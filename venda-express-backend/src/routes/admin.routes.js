const router = require('express').Router();
const { listStores, getStats } = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

router.get('/stores', requireAuth, requireAdmin, listStores);
router.get('/stats', requireAuth, requireAdmin, getStats);

module.exports = router;