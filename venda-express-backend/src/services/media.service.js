const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

async function attachMedia(storeId, products) {
  if (products.length === 0) return products;

  const [photoRows] = await pool.query(
    'SELECT product_id, url, hash FROM product_photos WHERE store_id = ? ORDER BY sort_order ASC',
    [storeId]
  );
  const photosByProduct = new Map();
  for (const row of photoRows) {
    const list = photosByProduct.get(row.product_id) || [];
    list.push({ url: row.url, hash: row.hash });
    photosByProduct.set(row.product_id, list);
  }

  const [videoRows] = await pool.query(
    'SELECT product_id, url, thumbnail_url FROM product_videos WHERE store_id = ?',
    [storeId]
  );
  const videoByProduct = new Map();
  for (const row of videoRows) {
    videoByProduct.set(row.product_id, { url: row.url, thumbnail_url: row.thumbnail_url });
  }

  return products.map((p) => ({
    ...p,
    images: photosByProduct.get(p.id) || [],
    video: videoByProduct.get(p.id) || null,
    active: !!p.active,
  }));
}

async function getProductsById(storeId, ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE store_id = ? AND id IN (${placeholders})`,
    [storeId, ...ids]
  );
  if (rows.length === 0) return [];

  const [photoRows] = await pool.query(
    `SELECT product_id, url, hash FROM product_photos WHERE store_id = ? AND product_id IN (${placeholders})`,
    [storeId, ...ids]
  );
  const photosByProduct = new Map();
  for (const row of photoRows) {
    const list = photosByProduct.get(row.product_id) || [];
    list.push({ url: row.url, hash: row.hash });
    photosByProduct.set(row.product_id, list);
  }

  const [videoRows] = await pool.query(
    `SELECT product_id, url, thumbnail_url FROM product_videos WHERE store_id = ? AND product_id IN (${placeholders})`,
    [storeId, ...ids]
  );
  const videoByProduct = new Map();
  for (const row of videoRows) {
    videoByProduct.set(row.product_id, { url: row.url, thumbnail_url: row.thumbnail_url });
  }

  return rows.map((p) => ({
    ...p,
    images: photosByProduct.get(p.id) || [],
    video: videoByProduct.get(p.id) || null,
    active: !!p.active,
  }));
}

async function replacePhotos(productId, storeId, photos) {
  await pool.query('DELETE FROM product_photos WHERE product_id = ?', [productId]);
  const list = Array.isArray(photos) ? photos.slice(0, 5) : [];
  if (list.length === 0) return;
  const values = list.map((p, idx) => [uuidv4(), storeId, productId, p.url, p.hash, idx]);
  await pool.query(
    'INSERT INTO product_photos (id, store_id, product_id, url, hash, sort_order) VALUES ?',
    [values]
  );
}

async function replaceVideo(productId, storeId, video) {
  await pool.query('DELETE FROM product_videos WHERE product_id = ?', [productId]);
  if (!video || !video.url) return;
  await pool.query(
    'INSERT INTO product_videos (id, store_id, product_id, url, thumbnail_url) VALUES (?, ?, ?, ?, ?)',
    [uuidv4(), storeId, productId, video.url, video.thumbnail_url || null]
  );
}

module.exports = { attachMedia, getProductsById, replacePhotos, replaceVideo };
