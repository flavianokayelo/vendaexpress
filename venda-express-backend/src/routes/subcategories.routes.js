const router = require('express').Router();
const {
  listSubcategories, createSubcategory, updateSubcategory, deleteSubcategory,
} = require('../controllers/subcategories.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.use(requireAuth);
router.get('/', listSubcategories);
router.post('/', createSubcategory);
router.put('/:id', updateSubcategory);
router.delete('/:id', deleteSubcategory);

module.exports = router;