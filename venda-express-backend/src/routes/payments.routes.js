// venda-express-backend/src/routes/payments.routes.js
const router = require('express').Router();
const {
  startPayment,
  emisCallback,
  getPaymentStatus,
  listMyPayments,
  confirmManual,
} = require('../controllers/payments.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Pública — chamada pela EMIS. NUNCA meter requireAuth aqui.
router.post('/callback', emisCallback);

// Autenticadas. Repara: NÃO usam requireActiveSubscription,
// senão a loja bloqueada nunca conseguia pagar para se desbloquear.
router.post('/start', requireAuth, startPayment);
router.get('/mine', requireAuth, listMyPayments);
router.get('/:id/status', requireAuth, getPaymentStatus);
router.post('/:id/confirm-manual', requireAuth, confirmManual);

module.exports = router;