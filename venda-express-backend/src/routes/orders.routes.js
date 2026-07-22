const router = require('express').Router();
const { getMyOrders, getOrderItems, updateOrderStatus } = require('../controllers/orders.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, getMyOrders);
router.get('/:id/items', requireAuth, getOrderItems);
router.patch('/:id/status', requireAuth, updateOrderStatus);

module.exports = router;