const router = require('express').Router();
const { getStorefront, getStorefrontProduct, validateCoupon, placeOrder,getCart,syncCart,getWishlist,syncWishlist } = require('../controllers/storefront.controller');

router.get('/:slug', getStorefront);
router.get('/:slug/products/:id', getStorefrontProduct);
router.post('/:slug/coupons/validate', validateCoupon);
router.post('/:slug/orders', placeOrder);

router.get('/:slug/cart', getCart);
router.put('/:slug/cart', syncCart);
router.get('/:slug/wishlist', getWishlist);
router.put('/:slug/wishlist', syncWishlist);

module.exports = router;