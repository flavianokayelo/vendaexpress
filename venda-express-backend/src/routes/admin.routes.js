const router = require('express').Router();
const { listStores, getStats } = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// TODO: trocar requireAuth por um requireAdmin quando existir papel de admin
router.get('/stores', requireAuth, listStores);
router.get('/stats', requireAuth, getStats);

module.exports = router;