// venda-express-backend/src/middleware/subscription.middleware.js
const pool = require('../db');

const TRIAL_DAYS = 7;

function daysBetween(from, to) {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Avalia o estado da subscrição de uma loja. Função pura — não escreve na BD.
 * Regras, por ordem de prioridade:
 *   1. Tem plano pago dentro da validade  -> activa (motivo: 'plan')
 *   2. Ainda está dentro dos 7 dias        -> activa (motivo: 'trial')
 *   3. Caso contrário                      -> bloqueada
 */
function evaluateSubscription(store) {
  const now = new Date();
  const trialEndsAt = store.trial_ends_at ? new Date(store.trial_ends_at) : null;
  const planExpiresAt = store.plan_expires_at ? new Date(store.plan_expires_at) : null;

  if (planExpiresAt && planExpiresAt > now) {
    return {
      active: true,
      reason: 'plan',
      expires_at: planExpiresAt.toISOString(),
      days_left: daysBetween(now, planExpiresAt),
    };
  }

  if (trialEndsAt && trialEndsAt > now) {
    return {
      active: true,
      reason: 'trial',
      expires_at: trialEndsAt.toISOString(),
      days_left: daysBetween(now, trialEndsAt),
    };
  }

  return {
    active: false,
    reason: planExpiresAt ? 'plan_expired' : 'trial_expired',
    expires_at: (planExpiresAt || trialEndsAt || now).toISOString(),
    days_left: 0,
  };
}

/**
 * Middleware: exige loja com subscrição activa.
 * Coloca req.storeId e req.subscription para os controllers a seguir.
 *
 * NÃO aplicar em: /api/auth, /api/plans, /api/payments, /api/stores/mine,
 * /api/subscription e /api/storefront (o storefront público tem regra própria).
 */
async function requireActiveSubscription(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM stores WHERE owner_id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Loja não encontrada', code: 'NO_STORE' });
    }

    const store = rows[0];
    const sub = evaluateSubscription(store);

    // Sincroniza o campo status da loja com a realidade (barato e evita dados velhos)
    const desiredStatus = sub.active ? (sub.reason === 'plan' ? 'active' : 'trial') : 'suspended';
    if (store.status !== desiredStatus) {
      await pool.query('UPDATE stores SET status = ? WHERE id = ?', [desiredStatus, store.id]);
      store.status = desiredStatus;
    }

    if (!sub.active) {
      // 402 Payment Required — o frontend usa este código para abrir o modal EMIS
      return res.status(402).json({
        error:
          sub.reason === 'trial_expired'
            ? 'O teu período de teste de 7 dias terminou. Escolhe um plano para continuar.'
            : 'A tua subscrição expirou. Renova o plano para continuar.',
        code: 'SUBSCRIPTION_REQUIRED',
        subscription: sub,
      });
    }

    req.storeId = store.id;
    req.store = store;
    req.subscription = sub;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { evaluateSubscription, requireActiveSubscription, TRIAL_DAYS };