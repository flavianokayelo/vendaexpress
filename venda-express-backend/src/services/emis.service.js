// venda-express-backend/src/services/emis.service.js
//
// Dois modos de funcionamento:
//
//   DIRECTO  — o Node fala com a EMIS. Só funciona quando o EMIS_CALLBACK_URL
//              é HTTPS e público (produção, ou localhost com túnel).
//
//   PROXY    — o Node fala com 7sete.ao, que fala com a EMIS. É o modo de
//              desenvolvimento: o domínio já está registado no POS e a
//              callback tem onde aterrar. Activa-se pondo EMIS_PROXY_TOKEN_URL.
//
// .env (modo PROXY, recomendado para testar agora):
//   EMIS_PROXY_TOKEN_URL=https://7sete.ao/ve_gpo_token.php
//   EMIS_PROXY_STATUS_URL=https://7sete.ao/ve_gpo_status.php
//   EMIS_PROXY_SECRET=<o mesmo valor de VE_RELAY_SECRET nos PHP>
//   EMIS_FRAME_URL=https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame
//
// .env (modo DIRECTO):
//   EMIS_FRAME_TOKEN_URL=https://pagamentonline.emis.co.ao/online-payment-gateway/webframe/v1/frameToken
//   EMIS_MERCHANT_TOKEN=...
//   EMIS_CALLBACK_URL=https://<domínio-público>/api/payments/callback

const crypto = require('crypto');
const plog = require('./paymentLog');

const FRAME_TOKEN_URL =
  process.env.EMIS_FRAME_TOKEN_URL ||
  'https://pagamentonline.emis.co.ao/online-payment-gateway/webframe/v1/frameToken';

const FRAME_URL =
  process.env.EMIS_FRAME_URL ||
  'https://pagamentonline.emis.co.ao/online-payment-gateway/portal/frame';

const MERCHANT_TOKEN = process.env.EMIS_MERCHANT_TOKEN || '';
const CALLBACK_URL = process.env.EMIS_CALLBACK_URL || '';

const PROXY_TOKEN_URL = process.env.EMIS_PROXY_TOKEN_URL || '';
const PROXY_STATUS_URL = process.env.EMIS_PROXY_STATUS_URL || '';
const PROXY_SECRET = process.env.EMIS_PROXY_SECRET || '';

const usingProxy = Boolean(PROXY_TOKEN_URL && PROXY_SECRET);

function log(msg, level = 'INFO') {
  console.log(`[emis][${level}] ${msg}`);
}

// Node < 18 não tem fetch global — falha silenciosa muito difícil de diagnosticar.
if (typeof fetch !== 'function') {
  log(
    'ERRO FATAL: este Node não tem fetch global (precisas de Node 18+). ' +
      'Corre `node -v`. Alternativa: npm install node-fetch e adaptar este ficheiro.',
    'ERROR'
  );
}

function isConfigured() {
  return usingProxy || Boolean(MERCHANT_TOKEN && CALLBACK_URL);
}

function mode() {
  if (usingProxy) return 'proxy';
  if (MERCHANT_TOKEN && CALLBACK_URL) return 'directo';
  return 'nenhum';
}

/** payment_id: prefixo + carimbo temporal + aleatório. Ex: VE250723143012a1b2c3 */
function makePaymentId(prefix = 'VE') {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  const stamp =
    String(d.getFullYear()).slice(2) +
    p(d.getMonth() + 1) + p(d.getDate()) +
    p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  return `${prefix}${stamp}${crypto.randomBytes(3).toString('hex')}`;
}

/** Referência EMIS: md5(payment_id), 12 hex maiúsculos. Igual ao PHP. */
function makeReference(paymentId) {
  return crypto.createHash('md5').update(paymentId).digest('hex').slice(0, 12).toUpperCase();
}

function buildFrameUrl(gpoToken) {
  return gpoToken ? `${FRAME_URL}?token=${encodeURIComponent(gpoToken)}` : null;
}

async function postJson(url, body, extraHeaders = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...extraHeaders },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    return { status: res.status, text };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pede o frameToken, pelo modo configurado.
 * @returns {{ token, frame_url, mocked, error?, detail? }}
 */
async function createFrameToken({ reference, amount }) {
  if (typeof fetch !== 'function') {
    return { token: null, frame_url: null, mocked: false, error: 'Node sem fetch global (precisa de Node 18+)' };
  }

  if (!isConfigured()) {
    log('Sem configuração EMIS (nem proxy nem directo) — modo simulado', 'WARN');
    return { token: null, frame_url: null, mocked: true, error: 'EMIS não configurada' };
  }

  // ---------- MODO PROXY (7sete.ao) ----------
  if (usingProxy) {
    log(`frameToken via proxy -> ${PROXY_TOKEN_URL} | ref=${reference} amount=${amount}`);
    try {
      const { status, text } = await postJson(
        PROXY_TOKEN_URL,
        { reference, amount: Number(amount), secret: PROXY_SECRET },
        { 'X-VE-Secret': PROXY_SECRET }
      );
      log(`frameToken via proxy <- HTTP ${status} | ${text || '(vazio)'}`);

      let data = {};
      try { data = JSON.parse(text); } catch { /* fica {} */ }

      if (status === 200 && data.id) {
        plog.ok('TOKEN_OK', { via: 'proxy', ref: reference, valor: amount, gpo_token: data.id });
        return { token: data.id, frame_url: buildFrameUrl(data.id), mocked: false };
      }
      plog.erro('TOKEN_FALHOU', {
        via: 'proxy', ref: reference, valor: amount, http: status,
        erro: data.error || 'sem mensagem', resposta_emis: data.emis_body || text,
      });
      return {
        token: null,
        frame_url: null,
        mocked: false,
        error: data.error || 'O portal Multicaixa Express não respondeu.',
        detail: data.emis_body || text,
      };
    } catch (err) {
      log(`proxy inacessível: ${err.message}`, 'ERROR');
      return { token: null, frame_url: null, mocked: false, error: 'Não foi possível contactar o portal de pagamentos.' };
    }
  }

  // ---------- MODO DIRECTO ----------
  const payload = {
    reference: String(reference),
    amount: Number(amount),
    token: String(MERCHANT_TOKEN),
    qrCode: 'PAYMENT',
    mobile: 'PAYMENT',
    card: 'DISABLED',
    callbackUrl: CALLBACK_URL,
  };
  log(`frameToken directo -> ${JSON.stringify({ ...payload, token: '***OCULTO***' })}`);

  try {
    const { status, text } = await postJson(FRAME_TOKEN_URL, payload);
    log(`frameToken directo <- HTTP ${status} | ${text || '(vazio)'}`);

    if (status !== 200) {
      plog.erro('TOKEN_FALHOU', { via: 'directo', ref: reference, valor: amount, http: status, resposta_emis: text });
      return { token: null, frame_url: null, mocked: false, error: 'O portal Multicaixa Express não respondeu.', detail: text };
    }
    let data = {};
    try { data = JSON.parse(text); } catch {
      plog.erro('TOKEN_FALHOU', { via: 'directo', ref: reference, erro: 'resposta não é JSON', resposta_emis: text });
      return { token: null, frame_url: null, mocked: false, error: 'Resposta inválida do portal de pagamentos.' };
    }
    if (!data.id) {
      plog.erro('TOKEN_FALHOU', { via: 'directo', ref: reference, erro: 'sem id na resposta', resposta_emis: text });
      return { token: null, frame_url: null, mocked: false, error: 'O portal não devolveu token.', detail: text };
    }
    plog.ok('TOKEN_OK', { via: 'directo', ref: reference, valor: amount, gpo_token: data.id });
    return { token: data.id, frame_url: buildFrameUrl(data.id), mocked: false };
  } catch (err) {
    log(`erro de rede: ${err.message}`, 'ERROR');
    plog.erro('TOKEN_FALHOU', { via: 'directo', ref: reference, erro: `rede: ${err.message}` });
    return { token: null, frame_url: null, mocked: false, error: 'Não foi possível contactar o portal de pagamentos.' };
  }
}

/**
 * Vai a 7sete.ao ver se já chegou callback para esta referência.
 * Usado no modo proxy, porque a EMIS não alcança o localhost.
 * @returns {null | { status:'paid'|'failed', transaction_id, raw, raw_status }}
 */
async function pollRelayStatus(reference) {
  if (!PROXY_STATUS_URL || !PROXY_SECRET || typeof fetch !== 'function') return null;

  try {
    const url = `${PROXY_STATUS_URL}?reference=${encodeURIComponent(reference)}&secret=${encodeURIComponent(PROXY_SECRET)}`;
    const res = await fetch(url, { headers: { 'X-VE-Secret': PROXY_SECRET } });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.found) return null;

    const rawStatus = String(data.status || '');
    const ok = ['ACCEPTED', 'SUCCESS', 'SUCCEEDED'].includes(rawStatus);
    log(`relay: ref=${reference} status=${rawStatus} -> ${ok ? 'paid' : 'failed'}`);
    plog.logPayment(ok ? 'OK' : 'ERRO', 'RESPOSTA_EMIS', {
      via: 'relay-7sete', ref: reference, status_emis: rawStatus,
      resultado: ok ? 'PAGO' : 'NAO PAGO', txn: data.transaction_id || '-',
    });

    return {
      status: ok ? 'paid' : 'failed',
      transaction_id: data.transaction_id || null,
      raw: data.raw || data,
      raw_status: rawStatus,
    };
  } catch (err) {
    log(`relay inacessível: ${err.message}`, 'WARN');
    return null;
  }
}

/** Normaliza o corpo da callback directa da EMIS. */
function parseCallback(data) {
  let reference = null;
  if (data && data.reference && typeof data.reference === 'object' && data.reference.id) {
    reference = data.reference.id;
  } else if (data && typeof data.reference === 'string') {
    reference = data.reference;
  } else if (data && data.merchantReferenceNumber) {
    reference = data.merchantReferenceNumber;
  }

  const rawStatus = String((data && data.status) || '');
  const ok = ['ACCEPTED', 'SUCCESS', 'SUCCEEDED'].includes(rawStatus);

  return {
    reference,
    status: ok ? 'paid' : 'failed',
    transaction_id: (data && data.id) || null,
    raw_status: rawStatus,
  };
}

log(`modo de operação: ${mode()}`);

module.exports = {
  isConfigured,
  mode,
  usingProxy,
  createFrameToken,
  pollRelayStatus,
  parseCallback,
  makePaymentId,
  makeReference,
  buildFrameUrl,
};