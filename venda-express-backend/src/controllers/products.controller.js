const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

async function getOwnedStoreId(userId) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [userId]);
  return rows[0]?.id ?? null;
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

async function listProducts(req, res) {
  try {
    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [rows] = await pool.query(
      'SELECT * FROM products WHERE store_id = ? ORDER BY created_at DESC',
      [storeId]
    );
    return res.json(await attachMedia(storeId, rows));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function createProduct(req, res) {
  try {
    const {
      name, description, price, compare_at_price, stock, color, color_hex, size,
      item_condition, category_id, images, video, active, return_policy,
    } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Nome do produto é obrigatório' });
    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Preço é obrigatório' });
    }

    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const photoList = Array.isArray(images) ? images.slice(0, 5) : [];
    const id = uuidv4();

    await pool.query(
      `INSERT INTO products
        (id, store_id, category_id, name, description, price, compare_at_price, stock, color, color_hex,
         size, item_condition, image_url, active, return_policy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, storeId, category_id || null, name.trim(), description || null,
        Number(price), compare_at_price ? Number(compare_at_price) : null,
        Number(stock) || 0, color || null, color_hex || null, size || null,
        item_condition || 'novo', photoList[0]?.url || null,
        active === undefined ? true : !!active, return_policy || null,
      ]
    );

    await replacePhotos(id, storeId, photoList);
    await replaceVideo(id, storeId, video || null);

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const [withMedia] = await attachMedia(storeId, rows);
    return res.status(201).json(withMedia);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const {
      name, description, price, compare_at_price, stock, color, color_hex, size,
      item_condition, category_id, images, video, active, return_policy,
    } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Nome do produto é obrigatório' });
    if (price === undefined || price === null || isNaN(Number(price))) {
      return res.status(400).json({ error: 'Preço é obrigatório' });
    }

    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const photoList = Array.isArray(images) ? images.slice(0, 5) : [];

    const [result] = await pool.query(
      `UPDATE products SET
        category_id = ?, name = ?, description = ?, price = ?, compare_at_price = ?,
        stock = ?, color = ?, color_hex = ?, size = ?, item_condition = ?, image_url = ?,
        active = ?, return_policy = ?
       WHERE id = ? AND store_id = ?`,
      [
        category_id || null, name.trim(), description || null, Number(price),
        compare_at_price ? Number(compare_at_price) : null, Number(stock) || 0,
        color || null, color_hex || null, size || null, item_condition || 'novo',
        photoList[0]?.url || null, active === undefined ? true : !!active, return_policy || null,
        id, storeId,
      ]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });

    await replacePhotos(id, storeId, photoList);
    await replaceVideo(id, storeId, video || null);

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const [withMedia] = await attachMedia(storeId, rows);
    return res.json(withMedia);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [result] = await pool.query('DELETE FROM products WHERE id = ? AND store_id = ?', [id, storeId]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function searchByHash(req, res) {
  try {
    const { hash } = req.query;
    if (!hash) return res.status(400).json({ error: 'hash é obrigatório' });

    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [rows] = await pool.query(
      `SELECT pp.product_id, p.name FROM product_photos pp
       JOIN products p ON p.id = pp.product_id
       WHERE pp.store_id = ? AND pp.hash = ? LIMIT 1`,
      [storeId, hash]
    );
    return res.json({ match: rows[0] || null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function aiAssist(req, res) {
  try {
    const { keywords, category } = req.body;
    if (!keywords || !keywords.trim()) {
      return res.status(400).json({ error: 'Indica algumas palavras-chave do produto' });
    }
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(501).json({
        error: 'IA não configurada. Adiciona OPENAI_API_KEY ao .env do backend para ativar esta funcionalidade.',
      });
    }

    const prompt = `Cria um nome curto e apelativo (máx 8 palavras) e uma descrição de venda (2-3 frases, em português de Angola) para um produto de e-commerce.
Palavras-chave: ${keywords}
Categoria: ${category || 'geral'}
Responde APENAS em JSON no formato: {"name": "...", "description": "..."}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI error:', await response.text());
      return res.status(502).json({ error: 'Erro ao comunicar com o serviço de IA' });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());

    return res.json({ name: parsed.name || '', description: parsed.description || '' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = {
  listProducts, createProduct, updateProduct, deleteProduct, searchByHash, aiAssist,
};