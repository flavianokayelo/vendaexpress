const router = require('express').Router();
const { listPlans } = require('../controllers/plans.controller');

router.get('/', listPlans);

module.exports = router;