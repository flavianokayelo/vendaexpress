const { Router } = require('express');
const { requireAuth } = require('../middleware/auth.middleware');
const { listCoupons, createCoupon, updateCoupon, deleteCoupon } = require('../controllers/coupons.controller');

const router = Router();

router.use(requireAuth);

router.get('/', listCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

module.exports = router;
