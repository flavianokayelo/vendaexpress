// venda-express-backend/src/services/paymentLog.js
//
// Log dedicado ao ciclo de pagamento. Mesma filosofia dos logs PHP do 7sete:
// ficheiro de texto, uma linha por evento, fácil de abrir e de fazer grep.
//
// Escreve em venda-express-backend/logs/:
//   pagamentos-2026-07-23.log   -> tudo o que aconteceu nesse dia
//   pagamentos-ERROS.log        -> só o que correu mal, acumulado
//
// Cada linha:
//   [2026-07-23 09:35:12] [OK]   ACTIVATED  ref=82074DE6FFDC | email=x@y.ao | store=... 
//   [2026-07-23 09:35:12] [ERRO] TOKEN_FAIL ref=82074DE6FFDC | erro=... 
//
// Níveis: OK (correu bem) · INFO (passo intermédio) · AVISO · ERRO

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
const ERROR_FILE = path.join(LOG_DIR, 'pagamentos-ERROS.log');

function ensureDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (err) {
    console.error('[paymentLog] não consegui criar a pasta de logs:', err.message);
  }
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  );
}

function dailyFile() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return path.join(LOG_DIR, `pagamentos-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.log`);
}

/** Nunca deixar dados sensíveis chegarem ao ficheiro. */
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const proibidos = ['password', 'password_hash', 'secret', 'merchant_token', 'token_comerciante'];
  const out = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (proibidos.includes(k.toLowerCase())) {
      out[k] = '***OCULTO***';
    } else if (v && typeof v === 'object') {
      out[k] = sanitize(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function formatFields(fields) {
  if (!fields || Object.keys(fields).length === 0) return '';
  return Object.entries(sanitize(fields))
    .map(([k, v]) => `${k}=${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(' | ');
}

/**
 * Regista um evento de pagamento.
 * @param {'OK'|'INFO'|'AVISO'|'ERRO'} level
 * @param {string} event   Nome curto em maiúsculas, ex: 'TOKEN_OK'
 * @param {object} fields  Pares chave/valor a acrescentar à linha
 */
function logPayment(level, event, fields = {}) {
  ensureDir();

  const line = `[${stamp()}] [${level}] ${event.padEnd(18)} ${formatFields(fields)}\n`;

  try {
    fs.appendFileSync(dailyFile(), line);
    if (level === 'ERRO') fs.appendFileSync(ERROR_FILE, line);
  } catch (err) {
    console.error('[paymentLog] falha ao escrever:', err.message);
  }

  // Também na consola, para veres em tempo real no nodemon
  const cor = level === 'ERRO' ? '\x1b[31m' : level === 'OK' ? '\x1b[32m' : level === 'AVISO' ? '\x1b[33m' : '\x1b[36m';
  console.log(`${cor}[pagamentos]\x1b[0m ${level} ${event} ${formatFields(fields)}`);
}

/** Atalho para separar visualmente cada tentativa de pagamento no ficheiro. */
function logSeparator(titulo) {
  ensureDir();
  const line = `\n===== ${stamp()} — ${titulo} =====\n`;
  try {
    fs.appendFileSync(dailyFile(), line);
  } catch { /* ignora */ }
}

const ok = (event, fields) => logPayment('OK', event, fields);
const info = (event, fields) => logPayment('INFO', event, fields);
const aviso = (event, fields) => logPayment('AVISO', event, fields);
const erro = (event, fields) => logPayment('ERRO', event, fields);

module.exports = { logPayment, logSeparator, ok, info, aviso, erro, LOG_DIR };