// venda-express-backend/src/routes/signup.routes.js
//
// Todas as rotas são PÚBLICAS — ainda não existe conta, logo não há JWT.
const router = require('express').Router();
const {
  startSignup,
  getSignupStatus,
  completeSignup,
  confirmManual,
  abandonSignup,
  getTrialEligibility,
  startTrial,
} = require('../controllers/signup.controller');

// --- fluxo pago ---
router.post('/start', startSignup);
router.get('/status', getSignupStatus);
router.post('/complete', completeSignup);
router.post('/abandon', abandonSignup);

// --- caminho alternativo: 7 dias de teste após falhas de pagamento ---
router.get('/trial-eligibility', getTrialEligibility);
router.post('/trial', startTrial);

// --- desenvolvimento (só com EMIS_ALLOW_MANUAL=true) ---
router.post('/confirm-manual', confirmManual);

module.exports = router;