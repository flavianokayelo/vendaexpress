const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const storeService = require('../services/store.service');
const mediaService = require('../services/media.service');

async function listProducts(req, res) {
  try {
    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const { search, page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

    let sql = 'SELECT * FROM products WHERE store_id = ?';
    const params = [storeId];

    if (search && search.trim()) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [rows] = await pool.query(sql, params);

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM products WHERE store_id = ?',
      [storeId]
    );

    return res.json({
      products: await mediaService.attachMedia(storeId, rows),
      total,
      page: Number(page),
      limit: Number(limit),
    });
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

    const storeId = await storeService.getOwnedStoreId(req.userId);
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

    await mediaService.replacePhotos(id, storeId, photoList);
    await mediaService.replaceVideo(id, storeId, video || null);

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const [withMedia] = await mediaService.attachMedia(storeId, rows);
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

    const storeId = await storeService.getOwnedStoreId(req.userId);
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

    await mediaService.replacePhotos(id, storeId, photoList);
    await mediaService.replaceVideo(id, storeId, video || null);

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const [withMedia] = await mediaService.attachMedia(storeId, rows);
    return res.json(withMedia);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const storeId = await storeService.getOwnedStoreId(req.userId);
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

    const storeId = await storeService.getOwnedStoreId(req.userId);
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
