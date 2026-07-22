const multer = require('multer');
const path = require('path');
const fs = require('fs');

function makeUploader(subfolder) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const storeId = req.storeId; // definido antes pelo controller/middleware que resolve a loja
      const dir = path.join(__dirname, '..', '..', 'uploads', storeId, subfolder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, unique);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Formato de imagem não suportado'));
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  });
}

module.exports = { makeUploader };