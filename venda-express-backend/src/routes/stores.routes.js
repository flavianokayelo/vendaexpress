const router = require('express').Router();
const { createStore, getMyStore, getMyStoreStats, updateMyStore } = require('../controllers/stores.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.post('/', requireAuth, createStore);
router.get('/mine', requireAuth, getMyStore);
router.get('/mine/stats', requireAuth, getMyStoreStats);
router.put('/mine', requireAuth, updateMyStore);

module.exports = router;