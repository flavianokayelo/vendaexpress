const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

function parseStore(row) {
  if (!row) return null;
  let banner_urls = [];
  if (row.banner_urls) {
    try {
      banner_urls = typeof row.banner_urls === 'string' ? JSON.parse(row.banner_urls) : row.banner_urls;
    } catch {
      banner_urls = [];
    }
  }
  return { ...row, banner_urls };
}

async function createStore(req, res) {
  try {
    const { name, slug, plan_id } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e endereço da loja são obrigatórios' });
    }

    const [existingStore] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (existingStore.length > 0) {
      return res.status(409).json({ error: 'Já tens uma loja criada' });
    }

    const [slugTaken] = await pool.query('SELECT id FROM stores WHERE slug = ?', [slug]);
    if (slugTaken.length > 0) {
      return res.status(409).json({ error: 'Este endereço de loja já está em uso' });
    }

    const id = uuidv4();
    await pool.query(
      `INSERT INTO stores (id, owner_id, plan_id, name, slug, status, banner_urls)
       VALUES (?, ?, ?, ?, ?, 'trial', '[]')`,
      [id, req.userId, plan_id || null, name, slug]
    );

    const [rows] = await pool.query('SELECT * FROM stores WHERE id = ?', [id]);
    return res.status(201).json(parseStore(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getMyStore(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM stores WHERE owner_id = ?', [req.userId]);
    return res.json(parseStore(rows[0]) || null);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getMyStoreStats(req, res) {
  try {
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const storeId = storeRows[0].id;

    const [[productsCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE store_id = ?',
      [storeId]
    );
    const [[ordersCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM orders WHERE store_id = ?',
      [storeId]
    );
    const [[customersCount]] = await pool.query(
      'SELECT COUNT(*) AS count FROM customers WHERE store_id = ?',
      [storeId]
    );
    const [[revenueRow]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE store_id = ? AND status IN ('paid', 'shipped', 'delivered')`,
      [storeId]
    );
    const [recentOrders] = await pool.query(
      'SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC LIMIT 5',
      [storeId]
    );

    return res.json({
      products: productsCount.count,
      orders: ordersCount.count,
      customers: customersCount.count,
      revenue: Number(revenueRow.revenue),
      recentOrders,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function updateMyStore(req, res) {
  try {
    const { theme_primary, description, logo_url, banner_urls } = req.body;

    const [storeRows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const storeId = storeRows[0].id;

    // banner_urls é uma lista de até 5 URLs; guardamos como JSON (string) na coluna banner_urls.
    // banner_url (singular, coluna antiga) fica sincronizada com a primeira imagem,
    // para não quebrar nada que ainda leia esse campo isoladamente.
    const bannerList = Array.isArray(banner_urls) ? banner_urls.slice(0, 5) : [];

    await pool.query(
      `UPDATE stores
       SET theme_primary = ?, description = ?, logo_url = ?, banner_url = ?, banner_urls = ?
       WHERE id = ?`,
      [
        theme_primary || null,
        description || null,
        logo_url || null,
        bannerList[0] || null,
        JSON.stringify(bannerList),
        storeId,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM stores WHERE id = ?', [storeId]);
    return res.json(parseStore(rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { createStore, getMyStore, getMyStoreStats, updateMyStore };