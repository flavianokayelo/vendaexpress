// venda-express-backend/src/controllers/stores.controller.js
const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { evaluateSubscription, TRIAL_DAYS } = require('../middleware/subscription.middleware');

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
  return { ...row, banner_urls, subscription: evaluateSubscription(row) };
}

async function createStore(req, res) {
  try {
    const { name, slug, plan_id } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e endereço da loja são obrigatórios' });
    }

    // REGRA NOVA: escolher plano é obrigatório
    if (!plan_id) {
      return res.status(400).json({ error: 'Tens de escolher um plano', code: 'PLAN_REQUIRED' });
    }
    const [planRows] = await pool.query('SELECT id FROM plans WHERE id = ?', [plan_id]);
    if (planRows.length === 0) {
      return res.status(400).json({ error: 'Plano inválido', code: 'PLAN_INVALID' });
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
      `INSERT INTO stores (id, owner_id, plan_id, name, slug, status, banner_urls, trial_ends_at)
       VALUES (?, ?, ?, ?, ?, 'trial', '[]', DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [id, req.userId, plan_id, name, slug, TRIAL_DAYS]
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

/**
 * GET /api/subscription/status
 * Usado pelo frontend para mostrar o contador "faltam X dias" e decidir
 * se abre o modal EMIS. Nunca devolve 402 — é sempre informativo.
 */
async function getSubscriptionStatus(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM stores WHERE owner_id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.json({ active: false, reason: 'no_store', expires_at: null, days_left: 0, plan: null });
    }
    const store = rows[0];
    const sub = evaluateSubscription(store);

    let plan = null;
    if (store.plan_id) {
      const [planRows] = await pool.query('SELECT * FROM plans WHERE id = ?', [store.plan_id]);
      if (planRows.length > 0) {
        plan = {
          ...planRows[0],
          features:
            typeof planRows[0].features === 'string'
              ? JSON.parse(planRows[0].features)
              : planRows[0].features,
        };
      }
    }

    return res.json({ ...sub, plan, store_status: store.status });
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

module.exports = {
  createStore,
  getMyStore,
  getMyStoreStats,
  updateMyStore,
  getSubscriptionStatus,
  parseStore,
};