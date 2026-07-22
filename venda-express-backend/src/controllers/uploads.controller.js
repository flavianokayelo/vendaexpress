const crypto = require('crypto');
const fs = require('fs');

async function uploadCategoryIcon(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  }
  const url = `/uploads/${req.storeId}/icons/${req.file.filename}`;
  return res.status(201).json({ url });
}

async function uploadProductImages(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  }
  const photos = req.files.map((f) => {
    const buffer = fs.readFileSync(f.path);
    const hash = crypto.createHash('sha256').update(buffer).digest('hex');
    return { url: `/uploads/${req.storeId}/products/${f.filename}`, hash };
  });
  return res.status(201).json({ photos });
}

async function uploadProductVideo(req, res) {
  const videoFile = req.files?.video?.[0];
  const thumbFile = req.files?.thumbnail?.[0];
  if (!videoFile) return res.status(400).json({ error: 'Nenhum vídeo enviado' });

  const url = `/uploads/${req.storeId}/products/videos/${videoFile.filename}`;
  const thumbnail_url = thumbFile ? `/uploads/${req.storeId}/products/videos/${thumbFile.filename}` : null;
  return res.status(201).json({ url, thumbnail_url });
}

async function uploadStoreLogo(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  }
  const url = `/uploads/${req.storeId}/logo/${req.file.filename}`;
  return res.status(201).json({ url });
}

async function uploadStoreBanner(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  }
  const urls = req.files.map((f) => `/uploads/${req.storeId}/banners/${f.filename}`);
  return res.status(201).json({ urls });
}

module.exports = {
  uploadCategoryIcon, uploadProductImages, uploadProductVideo,
  uploadStoreLogo, uploadStoreBanner,
};