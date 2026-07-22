const router = require('express').Router();
const multer = require('multer');
const {
  listProducts, createProduct, updateProduct, deleteProduct, searchByHash, aiAssist,
} = require('../controllers/products.controller');
const { imageAssist } = require('../controllers/ai.controller');
const { requireAuth } = require('../middleware/auth.middleware');

// Upload em memória (não grava em disco) — usado só para analisar a imagem, não para a guardar
const memoryUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

router.use(requireAuth);
router.get('/', listProducts);
router.get('/search-by-hash', searchByHash);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/ai-assist', aiAssist);
router.post('/ai-assist-image', memoryUpload.single('image'), imageAssist);

module.exports = router;