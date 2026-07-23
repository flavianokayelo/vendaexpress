// venda-express-backend/src/controllers/payments.controller.js
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const emis = require('../services/emis.service');
const plog = require('../services/paymentLog');
const { activatePendingSignup } = require('./signup.controller');

async function getMyStoreId(userId) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
}

/**
 * POST /api/payments/start   { plan_id }
 * Renovação/upgrade de uma loja QUE JÁ EXISTE. O registo inicial passa
 * por /api/signup/start, não por aqui.
 */
async function startPayment(req, res) {
  try {
    const { plan_id } = req.body;
    if (!plan_id) return res.status(400).json({ error: 'plan_id é obrigatório' });

    const storeId = await getMyStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [planRows] = await pool.query('SELECT * FROM plans WHERE id = ?', [plan_id]);
    if (planRows.length === 0) return res.status(400).json({ error: 'Plano inválido' });
    const plan = planRows[0];

    // Reaproveita um pendente recente do mesmo plano (evita tokens a mais na EMIS)
    const [pending] = await pool.query(
      `SELECT * FROM payments
       WHERE store_id = ? AND plan_id = ? AND status = 'pending' AND emis_token IS NOT NULL
         AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
       ORDER BY created_at DESC LIMIT 1`,
      [storeId, plan_id]
    );
    if (pending.length > 0) {
      return res.json({
        payment: pending[0],
        emis: {
          token: pending[0].emis_token,
          frame_url: emis.buildFrameUrl(pending[0].emis_token),
          mocked: false,
        },
      });
    }

    const id = uuidv4();
    const paymentId = emis.makePaymentId('VR'); // VR = venda express renovação
    const reference = emis.makeReference(paymentId);
    const durationDays = plan.duration_days || 30;

    await pool.query(
      `INSERT INTO payments (id, store_id, plan_id, reference, amount, currency, duration_days, method, status)
       VALUES (?,?,?,?,?, 'AOA', ?, 'emis', 'pending')`,
      [id, storeId, plan_id, reference, plan.price, durationDays]
    );

    const frame = await emis.createFrameToken({ reference, amount: plan.price });

    if (frame.token) {
      await pool.query('UPDATE payments SET emis_token = ? WHERE id = ?', [frame.token, id]);
    } else if (!frame.mocked) {
      await pool.query(`UPDATE payments SET status = 'failed' WHERE id = ?`, [id]);
      return res.status(502).json({ error: frame.error || 'O portal Multicaixa Express não respondeu.' });
    }

    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ?', [id]);
    return res.status(201).json({ payment: rows[0], emis: frame });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

/**
 * Confirma um pagamento de renovação e estende a subscrição.
 * Idempotente e transaccional — a EMIS repete callbacks.
 */
async function confirmPayment(paymentId, { transactionId = null, raw = null } = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM payments WHERE id = ? FOR UPDATE', [paymentId]);
    if (rows.length === 0) throw new Error('Pagamento não encontrado');
    const payment = rows[0];

    if (payment.status === 'paid') {
      await conn.commit();
      return payment;
    }

    const [storeRows] = await conn.query('SELECT * FROM stores WHERE id = ?', [payment.store_id]);
    const store = storeRows[0];

    // Se ainda houver tempo pago, soma por cima; senão conta a partir de agora
    const now = new Date();
    const current = store.plan_expires_at ? new Date(store.plan_expires_at) : null;
    const start = current && current > now ? current : now;
    const end = new Date(start.getTime() + payment.duration_days * 24 * 60 * 60 * 1000);

    await conn.query(
      `UPDATE payments
       SET status = 'paid', paid_at = NOW(), emis_transaction_id = ?, raw_response = ?,
           period_start = ?, period_end = ?
       WHERE id = ?`,
      [transactionId, raw ? JSON.stringify(raw) : null, start, end, paymentId]
    );

    await conn.query(
      `UPDATE stores
       SET status = 'active', plan_id = ?,
           plan_started_at = COALESCE(plan_started_at, NOW()), plan_expires_at = ?
       WHERE id = ?`,
      [payment.plan_id, end, store.id]
    );

    await conn.commit();
    const [updated] = await pool.query('SELECT * FROM payments WHERE id = ?', [paymentId]);
    return updated[0];
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * POST /api/payments/callback   (PÚBLICO — chamado pela EMIS)
 *
 * Uma referência pode pertencer a duas coisas:
 *   1. um registo novo em pending_signups  -> cria a conta
 *   2. uma renovação em payments           -> estende a subscrição
 *
 * Devolve sempre 200 quando o payload é legível, para a EMIS não repetir.
 */
async function emisCallback(req, res) {
  const body = req.body || {};
  console.log('[emis][callback] payload:', JSON.stringify(body));
  plog.info('CALLBACK_RECEBIDA', { origem: 'EMIS directo', payload: body });

  try {
    const parsed = emis.parseCallback(body);
    console.log(
      `[emis][callback] ref=${parsed.reference} status=${parsed.raw_status} -> ${parsed.status} txn=${parsed.transaction_id}`
    );

    if (!parsed.reference) {
      console.warn('[emis][callback] sem referência — campos:', Object.keys(body).join(', '));
      plog.erro('CALLBACK_SEM_REF', { campos: Object.keys(body).join(',') });
      return res.status(400).json({ error: 'reference em falta' });
    }

    // --- caso 1: registo pendente ---
    const [pendingRows] = await pool.query(
      'SELECT id, status FROM pending_signups WHERE reference = ?',
      [parsed.reference]
    );
    if (pendingRows.length > 0) {
      if (['paid', 'failed', 'cancelled'].includes(pendingRows[0].status)) {
        console.log('[emis][callback] pendente já processado — a ignorar duplicado');
        return res.json({ status: 'already_processed' });
      }
      if (parsed.status === 'paid') {
        await activatePendingSignup(parsed.reference, {
          transactionId: parsed.transaction_id,
          raw: body,
        });
      } else {
        await pool.query(
          `UPDATE pending_signups SET status = 'failed', emis_transaction_id = ?, raw_response = ? WHERE id = ?`,
          [parsed.transaction_id, JSON.stringify(body), pendingRows[0].id]
        );
      }
      return res.json({ message: 'Callback processado', status: parsed.status });
    }

    // --- caso 2: renovação ---
    const [payRows] = await pool.query('SELECT * FROM payments WHERE reference = ?', [parsed.reference]);
    if (payRows.length === 0) {
      console.warn('[emis][callback] referência desconhecida:', parsed.reference);
      plog.erro('REF_DESCONHECIDA', { ref: parsed.reference, atencao: 'pagamento sem pedido correspondente' });
      return res.status(404).json({ error: 'Referência desconhecida' });
    }
    const payment = payRows[0];

    if (['paid', 'failed', 'cancelled'].includes(payment.status)) {
      return res.json({ status: 'already_processed' });
    }

    if (parsed.status === 'paid') {
      await confirmPayment(payment.id, { transactionId: parsed.transaction_id, raw: body });
      plog.ok('RENOVACAO_PAGA', {
        ref: parsed.reference, loja: payment.store_id,
        valor: Number(payment.amount), txn: parsed.transaction_id || '-',
      });
    } else {
      await pool.query(
        `UPDATE payments SET status = 'failed', emis_transaction_id = ?, raw_response = ? WHERE id = ?`,
        [parsed.transaction_id, JSON.stringify(body), payment.id]
      );
      plog.erro('RENOVACAO_RECUSADA', {
        ref: parsed.reference, loja: payment.store_id, status_emis: parsed.raw_status,
      });
    }

    return res.json({ message: 'Callback processado', status: parsed.status });
  } catch (err) {
    console.error('[emis][callback] erro:', err);
    plog.erro('CALLBACK_EXCEPCAO', { erro: err.message });
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

/** GET /api/payments/:id/status — sondado pelo modal de renovação */
async function getPaymentStatus(req, res) {
  try {
    const storeId = await getMyStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [rows] = await pool.query('SELECT * FROM payments WHERE id = ? AND store_id = ?', [
      req.params.id,
      storeId,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    const [storeRows] = await pool.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    return res.json({ payment: rows[0], store: storeRows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

/** GET /api/payments/mine — histórico de faturas */
async function listMyPayments(req, res) {
  try {
    const storeId = await getMyStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [rows] = await pool.query(
      `SELECT p.*, pl.name AS plan_name
       FROM payments p
       LEFT JOIN plans pl ON pl.id = p.plan_id
       WHERE p.store_id = ?
       ORDER BY p.created_at DESC`,
      [storeId]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

/** POST /api/payments/:id/confirm-manual — só com EMIS_ALLOW_MANUAL=true */
async function confirmManual(req, res) {
  try {
    if (process.env.EMIS_ALLOW_MANUAL !== 'true') {
      return res.status(403).json({ error: 'Confirmação manual desactivada' });
    }
    const storeId = await getMyStoreId(req.userId);
    const [rows] = await pool.query('SELECT id FROM payments WHERE id = ? AND store_id = ?', [
      req.params.id,
      storeId,
    ]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pagamento não encontrado' });

    const payment = await confirmPayment(req.params.id, { transactionId: 'MANUAL' });
    return res.json({ payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = {
  startPayment,
  emisCallback,
  getPaymentStatus,
  listMyPayments,
  confirmManual,
  confirmPayment,
};