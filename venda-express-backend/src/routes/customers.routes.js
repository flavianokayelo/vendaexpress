const router = require('express').Router();
const { getMyCustomers } = require('../controllers/customers.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, getMyCustomers);

module.exports = router;