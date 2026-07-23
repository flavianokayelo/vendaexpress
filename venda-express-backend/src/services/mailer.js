// venda-express-backend/src/services/mailer.js
//
// Cliente do relay de email em 7sete.ao (ve_send_email.php), que por sua vez
// usa a enviarEmail() com PHPMailer + SMTP da Hostinger.
//
// Princípio: o email NUNCA pode partir o fluxo de pagamento. Todas as funções
// aqui apanham os próprios erros e limitam-se a registar no log. Se o servidor
// de email estiver em baixo, a conta é criada na mesma.
//
// .env:
//   VE_MAIL_URL=https://7sete.ao/ve_send_email.php
//   VE_MAIL_SECRET=<o mesmo VE_RELAY_SECRET dos PHP>
//   VE_MAIL_ENABLED=true

const plog = require('./paymentLog');

const MAIL_URL = process.env.VE_MAIL_URL || '';
const MAIL_SECRET = process.env.VE_MAIL_SECRET || process.env.EMIS_PROXY_SECRET || '';
const ENABLED = process.env.VE_MAIL_ENABLED !== 'false';

function configurado() {
  return Boolean(ENABLED && MAIL_URL && MAIL_SECRET && typeof fetch === 'function');
}

/**
 * Envia um email pelo relay. Não lança excepções: devolve true/false.
 * @param {'tentativa_pagamento'|'pagamento_sucesso'|'pagamento_falhou'|'trial_activado'} template
 * @param {{ to: string, name?: string, data?: object }} opcoes
 */
async function enviar(template, { to, name = 'Cliente', data = {} } = {}) {
  if (!configurado()) {
    plog.aviso('EMAIL_IGNORADO', { template, para: to, motivo: 'relay de email não configurado' });
    return false;
  }
  if (!to) return false;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(MAIL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-VE-Secret': MAIL_SECRET },
      body: JSON.stringify({ secret: MAIL_SECRET, template, to, name, data }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const texto = await res.text();

    if (!res.ok) {
      plog.erro('EMAIL_FALHOU', { template, para: to, http: res.status, resposta: texto.slice(0, 300) });
      return false;
    }

    plog.ok('EMAIL_ENVIADO', { template, para: to, loja: data.loja || '-' });
    return true;
  } catch (err) {
    plog.erro('EMAIL_FALHOU', { template, para: to, erro: err.message });
    return false;
  }
}

/**
 * Dispara sem esperar. Usar quando o email não deve atrasar a resposta HTTP
 * (praticamente sempre).
 */
function enviarEmSegundoPlano(template, opcoes) {
  enviar(template, opcoes).catch(() => { /* já registado dentro de enviar() */ });
}

module.exports = { enviar, enviarEmSegundoPlano, configurado };