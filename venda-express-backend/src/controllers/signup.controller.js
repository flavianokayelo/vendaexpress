// venda-express-backend/src/controllers/signup.controller.js
//
// REGRA ACTUAL: não existe conta sem pagamento confirmado.
// O registo fica em `pending_signups` até a EMIS devolver ACCEPTED.
// Só nesse momento nascem as linhas em `users`, `stores` e `payments`.

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const emis = require('../services/emis.service');
const plog = require('../services/paymentLog');
const mailer = require('../services/mailer');
const { TRIAL_DAYS } = require('../middleware/subscription.middleware');
const { DEFAULT_THEME_CONFIG } = require('../constants');

/** Recusa registada: escreve no log ANTES de responder. */
function recusar(res, status, motivo, extra = {}) {
  const { code, ...campos } = extra;
  plog.aviso('REGISTO_RECUSADO', { motivo, ...campos });
  return res.status(status).json({ error: motivo, ...(code ? { code } : {}) });
}

/** Erro inesperado: vai para o ficheiro do dia E para o pagamentos-ERROS.log. */
function falhaInterna(res, err, ponto, extra = {}) {
  console.error(`[${ponto}]`, err);
  plog.erro('ERRO_INTERNO', { ponto, erro: err.message, ...extra });
  return res.status(500).json({ error: 'Erro no servidor' });
}

// Um pedido pendente vale 30 minutos
const PENDING_TTL_MINUTES = 30;

// Regras do teste gratuito:
// se a mesma pessoa tentar pagar e falhar este número de vezes, libertamos
// uma semana de teste para não a deixarmos bloqueada à porta.
const FAILED_ATTEMPTS_FOR_TRIAL = 2;

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidSlug(slug) {
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(slug) && slug.length >= 3 && slug.length <= 60;
}

/** Marca como expirados os pendentes que passaram do TTL. Barato, corre a cada consulta. */
async function expireStale() {
  await pool.query(
    `UPDATE pending_signups
     SET status = 'expired'
     WHERE status = 'pending' AND created_at < DATE_SUB(NOW(), INTERVAL ? MINUTE)`,
    [PENDING_TTL_MINUTES]
  );
}

/**
 * POST /api/signup/start
 * body: { email, password, store_name, slug, plan_id }
 * -> { reference, payment_id, gpo_token, frame_url, amount, plan_name, mocked }
 */
async function startSignup(req, res) {
  try {
    await expireStale();

    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const storeName = String(req.body.store_name || '').trim();
    const slug = String(req.body.slug || '').trim().toLowerCase();
    const planId = req.body.plan_id;

    // ---- validações ----
    if (!isValidEmail(email)) return recusar(res, 400, 'Email inválido', { email });
    if (password.length < 6) {
      return recusar(res, 400, 'A palavra-passe deve ter pelo menos 6 caracteres', { email });
    }
    if (storeName.length < 2) return recusar(res, 400, 'Indica o nome da tua loja', { email });
    if (!isValidSlug(slug)) {
      return recusar(res, 400, 'Endereço de loja inválido (usa letras minúsculas, números e hífens)', { email, loja: slug });
    }
    if (!planId) {
      return recusar(res, 400, 'Tens de escolher um plano', { email, code: 'PLAN_REQUIRED' });
    }

    const [planRows] = await pool.query('SELECT * FROM plans WHERE id = ?', [planId]);
    if (planRows.length === 0) return recusar(res, 400, 'Plano inválido', { email, code: 'PLAN_INVALID' });
    const plan = planRows[0];

    if (Number(plan.price) <= 0) {
      return recusar(res, 400, 'Este plano não tem preço definido. Contacta o suporte.', { email, plano: plan.name });
    }

    // ---- unicidade (contas reais) ----
    const [userTaken] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (userTaken.length > 0) return recusar(res, 409, 'Email já registado', { email });

    const [slugTaken] = await pool.query('SELECT id FROM stores WHERE slug = ?', [slug]);
    if (slugTaken.length > 0) return recusar(res, 409, 'Este endereço de loja já está em uso', { email, loja: slug });

    // ---- unicidade (pendentes ainda vivos) ----
    const [slugPending] = await pool.query(
      `SELECT id FROM pending_signups WHERE slug = ? AND status = 'pending'`,
      [slug]
    );
    if (slugPending.length > 0) {
      return recusar(res, 409, 'Este endereço está a ser registado por outra pessoa. Tenta outro.', { email, loja: slug });
    }

    // ---- criar o pendente ----
    const id = uuidv4();
    const paymentId = emis.makePaymentId('VE');
    const reference = emis.makeReference(paymentId);
    const passwordHash = await bcrypt.hash(password, 10);
    const durationDays = plan.duration_days || 30;

    await pool.query(
      `INSERT INTO pending_signups
        (id, reference, payment_id, email, password_hash, store_name, slug, plan_id,
         amount, currency, duration_days, status)
       VALUES (?,?,?,?,?,?,?,?,?,'AOA',?, 'pending')`,
      [id, reference, paymentId, email, passwordHash, storeName, slug, planId, plan.price, durationDays]
    );

    plog.logSeparator(`NOVO REGISTO — ${email} / ${slug}`);
    plog.info('PEDIDO_INICIADO', {
      ref: reference, email, loja: slug, plano: plan.name, valor: Number(plan.price), dias: durationDays,
    });

    // ---- pedir o token à EMIS ----
    const frame = await emis.createFrameToken({ reference, amount: plan.price });

    if (frame.token) {
      await pool.query('UPDATE pending_signups SET gpo_token = ? WHERE id = ?', [frame.token, id]);
    } else if (!frame.mocked) {
      // A EMIS respondeu mal — não deixamos o pendente pendurado
      await pool.query(
        `UPDATE pending_signups SET status = 'failed', raw_response = ? WHERE id = ?`,
        [JSON.stringify({ error: frame.error, detail: frame.detail || null }), id]
      );
      console.error('[signup] frameToken falhou:', frame.error, frame.detail || '');
      return res.status(502).json({
        error: frame.error || 'O portal Multicaixa Express não respondeu.',
        detail: frame.detail || null, // aparece na consola do browser, ajuda a diagnosticar
      });
    }

    const historico = await trialEligibilityFor(email);
    mailer.enviarEmSegundoPlano('tentativa_pagamento', {
      to: email,
      name: storeName,
      data: {
        loja: storeName,
        plano: plan.name,
        valor: Number(plan.price),
        referencia: reference,
        tentativa: historico.failed_attempts + 1,
        link_pagamento: frame.frame_url || null,
      },
    });

    return res.status(201).json({
      reference,
      payment_id: paymentId,
      gpo_token: frame.token,
      frame_url: frame.frame_url,
      amount: Number(plan.price),
      plan_name: plan.name,
      mocked: frame.mocked === true,
      expires_in_minutes: PENDING_TTL_MINUTES,
    });
  } catch (err) {
    return falhaInterna(res, err, 'startSignup');
  }
}

/**
 * Cria de facto a conta. Chamada pelo callback da EMIS e pela confirmação manual.
 * Idempotente: se já foi activado, devolve o que existe.
 */
async function activatePendingSignup(reference, { transactionId = null, raw = null } = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM pending_signups WHERE reference = ? FOR UPDATE', [
      reference,
    ]);
    if (rows.length === 0) {
      await conn.rollback();
      return { ok: false, reason: 'not_found' };
    }
    const pending = rows[0];

    if (pending.status === 'paid' && pending.created_user_id) {
      await conn.commit();
      plog.info('CALLBACK_DUPLICADA', { ref: reference, nota: 'conta já existia, ignorado' });
      return { ok: true, already: true, pending };
    }

    // Corrida: alguém registou o mesmo email/slug entretanto
    const [emailTaken] = await conn.query('SELECT id FROM users WHERE email = ?', [pending.email]);
    const [slugTaken] = await conn.query('SELECT id FROM stores WHERE slug = ?', [pending.slug]);
    if (emailTaken.length > 0 || slugTaken.length > 0) {
      await conn.query(
        `UPDATE pending_signups SET status = 'failed', raw_response = ? WHERE id = ?`,
        [JSON.stringify({ conflito: 'email ou slug ocupado entretanto', raw }), pending.id]
      );
      await conn.commit();
      plog.erro('ACTIVACAO_FALHOU', {
        ref: reference, email: pending.email, loja: pending.slug,
        motivo: 'email ou endereço de loja ficaram ocupados entretanto',
        atencao: 'PAGAMENTO RECEBIDO SEM CONTA CRIADA — resolver à mão',
      });
      return { ok: false, reason: 'conflict' };
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + pending.duration_days * 24 * 60 * 60 * 1000);

    // 1) utilizador
    const userId = uuidv4();
    await conn.query('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [
      userId,
      pending.email,
      pending.password_hash,
    ]);

    // 2) loja, já activa e paga
    const storeId = uuidv4();
    await conn.query(
      `INSERT INTO stores
        (id, owner_id, plan_id, name, slug, status, banner_urls, theme_config,
         trial_ends_at, plan_started_at, plan_expires_at)
       VALUES (?,?,?,?,?, 'active', '[]', ?, NULL, ?, ?)`,
      [storeId, userId, pending.plan_id, pending.store_name, pending.slug, DEFAULT_THEME_CONFIG, now, periodEnd]
    );

    // 3) factura
    await conn.query(
      `INSERT INTO payments
        (id, store_id, plan_id, reference, amount, currency, duration_days,
         method, status, emis_token, emis_transaction_id, raw_response,
         period_start, period_end, paid_at)
       VALUES (?,?,?,?,?,?,?, 'emis', 'paid', ?, ?, ?, ?, ?, NOW())`,
      [
        uuidv4(), storeId, pending.plan_id, pending.reference, pending.amount,
        pending.currency, pending.duration_days, pending.gpo_token, transactionId,
        raw ? JSON.stringify(raw) : null, now, periodEnd,
      ]
    );

    // 4) fechar o pendente
    await conn.query(
      `UPDATE pending_signups
       SET status = 'paid', emis_transaction_id = ?, raw_response = ?,
           created_user_id = ?, created_store_id = ?, activated_at = NOW()
       WHERE id = ?`,
      [transactionId, raw ? JSON.stringify(raw) : null, userId, storeId, pending.id]
    );

    await conn.commit();
    console.log(`[signup] conta criada para ${pending.email} (ref ${reference})`);
    plog.ok('CONTA_CRIADA', {
      ref: reference, email: pending.email, loja: pending.slug,
      valor: Number(pending.amount), txn: transactionId || '-',
      user_id: userId, store_id: storeId,
      plano_expira: periodEnd.toISOString().slice(0, 19).replace('T', ' '),
    });

    let nomePlano = '-';
    try {
      const [pl] = await pool.query('SELECT name FROM plans WHERE id = ?', [pending.plan_id]);
      if (pl.length > 0) nomePlano = pl[0].name;
    } catch { /* o email não vale um erro */ }

    mailer.enviarEmSegundoPlano('pagamento_sucesso', {
      to: pending.email,
      name: pending.store_name,
      data: {
        loja: pending.store_name,
        plano: nomePlano,
        valor: Number(pending.amount),
        referencia: pending.reference,
        expira_em: periodEnd.toLocaleDateString('pt-PT'),
      },
    });

    return { ok: true, already: false, pending, userId, storeId };
  } catch (err) {
    await conn.rollback();
    console.error('[signup] falha ao activar:', err);
    plog.erro('ACTIVACAO_FALHOU', {
      ref: reference, motivo: err.message,
      atencao: 'PAGAMENTO PODE TER SIDO RECEBIDO — verificar tbl_ve_gpo_callback',
    });
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * GET /api/signup/status?reference=XXXX   (público — o modal sonda isto)
 * Não devolve nada sensível: só o estado.
 */
async function getSignupStatus(req, res) {
  try {
    await expireStale();

    const reference = String(req.query.reference || '').trim();
    if (!reference) return res.status(400).json({ error: 'reference é obrigatório' });

    let [rows] = await pool.query(
      'SELECT status, email, activated_at FROM pending_signups WHERE reference = ?',
      [reference]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

    // Modo proxy: a EMIS não alcança o localhost, por isso a callback aterrou
    // em 7sete.ao. Vamos lá buscá-la antes de responder.
    if (rows[0].status === 'pending') {
      const relay = await emis.pollRelayStatus(reference);
      if (relay) {
        if (relay.status === 'paid') {
          await activatePendingSignup(reference, {
            transactionId: relay.transaction_id,
            raw: relay.raw,
          });
        } else {
          await pool.query(
            `UPDATE pending_signups SET status = 'failed', emis_transaction_id = ?, raw_response = ?
             WHERE reference = ?`,
            [relay.transaction_id, JSON.stringify(relay.raw), reference]
          );
          plog.erro('PAGAMENTO_RECUSADO', {
            ref: reference, status_emis: relay.raw_status, txn: relay.transaction_id || '-',
            nota: 'conta NÃO foi criada',
          });
          try {
            const [p] = await pool.query(
              `SELECT ps.email, ps.store_name, ps.amount, ps.gpo_token, pl.name AS plano
               FROM pending_signups ps LEFT JOIN plans pl ON pl.id = ps.plan_id
               WHERE ps.reference = ?`,
              [reference]
            );
            if (p.length > 0) {
              mailer.enviarEmSegundoPlano('pagamento_falhou', {
                to: p[0].email,
                name: p[0].store_name,
                data: {
                  loja: p[0].store_name,
                  plano: p[0].plano || '-',
                  valor: Number(p[0].amount),
                  referencia: reference,
                  link_pagamento: emis.buildFrameUrl(p[0].gpo_token),
                },
              });
            }
          } catch { /* o email não vale um erro */ }
        }
        [rows] = await pool.query(
          'SELECT status, email, activated_at FROM pending_signups WHERE reference = ?',
          [reference]
        );
      }
    }

    return res.json({
      status: rows[0].status,
      ready: rows[0].status === 'paid' && Boolean(rows[0].activated_at),
    });
  } catch (err) {
    return falhaInterna(res, err, 'getSignupStatus');
  }
}

/**
 * POST /api/signup/complete   { reference }   (público)
 * Só funciona se o pagamento já estiver confirmado. Devolve o JWT — é o login.
 */
async function completeSignup(req, res) {
  try {
    const reference = String(req.body.reference || '').trim();
    if (!reference) return res.status(400).json({ error: 'reference é obrigatório' });

    const [rows] = await pool.query('SELECT * FROM pending_signups WHERE reference = ?', [reference]);
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });
    const pending = rows[0];

    if (pending.status !== 'paid' || !pending.created_user_id) {
      return res.status(409).json({
        error: 'Pagamento ainda não confirmado',
        code: 'PAYMENT_NOT_CONFIRMED',
        status: pending.status,
      });
    }

    const user = { id: pending.created_user_id, email: pending.email };
    plog.ok('SESSAO_INICIADA', { ref: reference, email: pending.email, loja: pending.slug });
    return res.json({ user, token: signToken(user) });
  } catch (err) {
    return falhaInterna(res, err, 'completeSignup');
  }
}

/**
 * POST /api/signup/confirm-manual   { reference }
 * SÓ com EMIS_ALLOW_MANUAL=true. Existe porque a EMIS não consegue chamar
 * um callback em http://localhost. Remover em produção.
 */
async function confirmManual(req, res) {
  try {
    if (process.env.EMIS_ALLOW_MANUAL !== 'true') {
      return res.status(403).json({ error: 'Confirmação manual desactivada' });
    }
    const reference = String(req.body.reference || '').trim();
    plog.aviso('CONFIRMACAO_MANUAL', { ref: reference, nota: 'DEV — pagamento simulado, sem dinheiro real' });
    const result = await activatePendingSignup(reference, {
      transactionId: 'MANUAL',
      raw: { origem: 'confirm-manual' },
    });
    if (!result.ok) {
      return res.status(409).json({ error: `Não foi possível activar (${result.reason})` });
    }
    return res.json({ ok: true, already: result.already });
  } catch (err) {
    return falhaInterna(res, err, 'confirmManual');
  }
}

/**
 * POST /api/signup/abandon   { reference }   (público)
 * Chamado quando o cliente fecha o modal ou o pagamento é recusado.
 * Fecha a tentativa de imediato, para que conte já para o teste gratuito
 * (em vez de esperar os 30 minutos do expireStale).
 */
async function abandonSignup(req, res) {
  try {
    const reference = String(req.body.reference || '').trim();
    const motivo = String(req.body.reason || 'fechado pelo utilizador').slice(0, 120);
    if (!reference) return res.status(400).json({ error: 'reference é obrigatório' });

    const [rows] = await pool.query(
      'SELECT id, email, status FROM pending_signups WHERE reference = ?',
      [reference]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

    // Nunca mexer num pedido já pago
    if (rows[0].status === 'paid') return res.json({ ok: true, status: 'paid' });

    if (rows[0].status === 'pending') {
      await pool.query(`UPDATE pending_signups SET status = 'cancelled' WHERE id = ?`, [rows[0].id]);
      plog.aviso('TENTATIVA_ABANDONADA', { ref: reference, email: rows[0].email, motivo });
    }

    const info = await trialEligibilityFor(rows[0].email);
    return res.json({ ok: true, status: 'cancelled', ...info });
  } catch (err) {
    return falhaInterna(res, err, 'abandonSignup');
  }
}

/** Conta tentativas falhadas e decide se a pessoa já pode entrar em modo de teste. */
async function trialEligibilityFor(email) {
  const [[row]] = await pool.query(
    `SELECT COUNT(*) AS falhas
     FROM pending_signups
     WHERE email = ? AND status IN ('failed','cancelled','expired')`,
    [email]
  );
  const failed = Number(row.falhas || 0);

  // Quem já tem conta não precisa de teste nenhum
  const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

  return {
    failed_attempts: failed,
    needed: FAILED_ATTEMPTS_FOR_TRIAL,
    trial_days: TRIAL_DAYS,
    eligible: existing.length === 0 && failed >= FAILED_ATTEMPTS_FOR_TRIAL,
    already_registered: existing.length > 0,
  };
}

/**
 * GET /api/signup/trial-eligibility?email=...   (público)
 * O formulário consulta isto depois de uma falha, para decidir se mostra
 * o botão "começar com 7 dias grátis".
 */
async function getTrialEligibility(req, res) {
  try {
    await expireStale();
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Email inválido' });
    return res.json(await trialEligibilityFor(email));
  } catch (err) {
    return falhaInterna(res, err, 'getTrialEligibility');
  }
}

/**
 * POST /api/signup/trial   { email, password, store_name, slug, plan_id }   (público)
 * Cria a conta SEM pagamento, com 7 dias de validade.
 * Só passa se a pessoa já tiver falhado o pagamento vezes suficientes.
 */
async function startTrial(req, res) {
  const conn = await pool.getConnection();
  try {
    await expireStale();

    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const storeName = String(req.body.store_name || '').trim();
    const slug = String(req.body.slug || '').trim().toLowerCase();
    const planId = req.body.plan_id;

    if (!isValidEmail(email)) return recusar(res, 400, 'Email inválido', { via: 'trial' });
    if (password.length < 6) {
      return recusar(res, 400, 'A palavra-passe deve ter pelo menos 6 caracteres', { via: 'trial', email });
    }
    if (storeName.length < 2) return recusar(res, 400, 'Indica o nome da tua loja', { via: 'trial', email });
    if (!isValidSlug(slug)) return recusar(res, 400, 'Endereço de loja inválido', { via: 'trial', email });
    if (!planId) return recusar(res, 400, 'Tens de escolher um plano', { via: 'trial', email, code: 'PLAN_REQUIRED' });

    const elig = await trialEligibilityFor(email);
    if (elig.already_registered) return recusar(res, 409, 'Email já registado', { via: 'trial', email });
    if (!elig.eligible) {
      plog.aviso('TRIAL_RECUSADO', {
        email, falhas: elig.failed_attempts, precisa: FAILED_ATTEMPTS_FOR_TRIAL,
      });
      return res.status(403).json({
        error: 'O teste gratuito ainda não está disponível para esta conta.',
        code: 'TRIAL_NOT_ELIGIBLE',
        ...elig,
      });
    }

    const [planRows] = await pool.query('SELECT id, name FROM plans WHERE id = ?', [planId]);
    if (planRows.length === 0) return res.status(400).json({ error: 'Plano inválido' });

    const [slugTaken] = await pool.query('SELECT id FROM stores WHERE slug = ?', [slug]);
    if (slugTaken.length > 0) {
      return res.status(409).json({ error: 'Este endereço de loja já está em uso' });
    }

    await conn.beginTransaction();

    const userId = uuidv4();
    const storeId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await conn.query('INSERT INTO users (id, email, password) VALUES (?, ?, ?)', [
      userId, email, passwordHash,
    ]);

    // Loja em modo de teste: sem plano pago, expira em TRIAL_DAYS dias
    await conn.query(
      `INSERT INTO stores
        (id, owner_id, plan_id, name, slug, status, banner_urls, theme_config,
         trial_ends_at, plan_started_at, plan_expires_at)
       VALUES (?,?,?,?,?, 'trial', '[]', ?, DATE_ADD(NOW(), INTERVAL ? DAY), NULL, NULL)`,
      [storeId, userId, planId, storeName, slug, DEFAULT_THEME_CONFIG, TRIAL_DAYS]
    );

    await conn.commit();

    plog.ok('TRIAL_LIBERADO', {
      email, loja: slug, plano: planRows[0].name,
      falhas_anteriores: elig.failed_attempts, dias: TRIAL_DAYS,
      user_id: userId, store_id: storeId,
    });

    // Email do teste, já com um link de pagamento novo para regularizar.
    // Se a EMIS falhar aqui, o email segue à mesma, sem botão.
    (async () => {
      let linkPagamento = null;
      let preco = 0;
      try {
        const [pRow] = await pool.query('SELECT price, duration_days FROM plans WHERE id = ?', [planId]);
        preco = Number(pRow[0]?.price || 0);

        if (preco > 0) {
          const payId = uuidv4();
          const renovacaoId = emis.makePaymentId('VR');
          const ref = emis.makeReference(renovacaoId);
          await pool.query(
            `INSERT INTO payments (id, store_id, plan_id, reference, amount, currency, duration_days, method, status)
             VALUES (?,?,?,?,?, 'AOA', ?, 'emis', 'pending')`,
            [payId, storeId, planId, ref, preco, pRow[0]?.duration_days || 30]
          );
          const frame = await emis.createFrameToken({ reference: ref, amount: preco });
          if (frame.token) {
            await pool.query('UPDATE payments SET emis_token = ? WHERE id = ?', [frame.token, payId]);
            linkPagamento = frame.frame_url;
          }
        }
      } catch (e) {
        plog.aviso('LINK_TRIAL_FALHOU', { email, erro: e.message });
      }

      const fim = new Date(Date.now() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      mailer.enviarEmSegundoPlano('trial_activado', {
        to: email,
        name: storeName,
        data: {
          loja: storeName,
          plano: planRows[0].name,
          valor: preco,
          dias: TRIAL_DAYS,
          expira_em: fim.toLocaleDateString('pt-PT'),
          link_pagamento: linkPagamento,
        },
      });
    })();

    const user = { id: userId, email };
    return res.status(201).json({ user, token: signToken(user), trial_days: TRIAL_DAYS });
  } catch (err) {
    try { await conn.rollback(); } catch { /* ignora */ }
    console.error(err);
    plog.erro('TRIAL_FALHOU', { erro: err.message });
    return res.status(500).json({ error: 'Erro no servidor' });
  } finally {
    conn.release();
  }
}

module.exports = {
  startSignup,
  getSignupStatus,
  completeSignup,
  confirmManual,
  activatePendingSignup,
  abandonSignup,
  getTrialEligibility,
  startTrial,
};