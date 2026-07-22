const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { requireAuth } = require('../middleware/auth.middleware');
const { resolveStore } = require('../middleware/resolveStore.middleware');
const { makeUploader } = require('../middleware/upload.middleware');
const {
  uploadCategoryIcon, uploadProductImages, uploadProductVideo,
  uploadStoreLogo, uploadStoreBanner,
} = require('../controllers/uploads.controller');

// --- Ícones de categoria ---
const iconUploader = makeUploader('icons');

router.post(
  '/category-icon',
  requireAuth,
  resolveStore,
  iconUploader.single('file'),
  uploadCategoryIcon
);

// --- Fotos de produto (até 5) ---
const productsUploader = makeUploader('products');

router.post(
  '/product-images',
  requireAuth,
  resolveStore,
  productsUploader.array('files', 5),
  uploadProductImages
);

// --- Logótipo da loja (1 ficheiro) ---
const logoUploader = makeUploader('logo');

router.post(
  '/store-logo',
  requireAuth,
  resolveStore,
  logoUploader.single('file'),
  uploadStoreLogo
);

// --- Banners da loja (até 5 fotos) ---
const bannerUploader = makeUploader('banners');

router.post(
  '/store-banner',
  requireAuth,
  resolveStore,
  bannerUploader.array('files', 5),
  uploadStoreBanner
);

// --- Vídeo de produto (até 20MB) + miniatura gerada no browser ---
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', '..', 'uploads', req.storeId, 'products', 'videos');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const videoFileFilter = (req, file, cb) => {
  const videoExts = ['.mp4', '.webm', '.mov', '.m4v', '.ogg'];
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.fieldname === 'video' && !videoExts.includes(ext)) {
    return cb(new Error('Formato de vídeo não suportado'));
  }
  if (file.fieldname === 'thumbnail' && !imageExts.includes(ext)) {
    return cb(new Error('Formato de imagem não suportado para a miniatura'));
  }
  cb(null, true);
};

const videoUploader = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB por ficheiro
});

router.post(
  '/product-video',
  requireAuth,
  resolveStore,
  videoUploader.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]),
  uploadProductVideo
);

module.exports = router;