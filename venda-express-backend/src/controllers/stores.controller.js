const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const { evaluateSubscription, TRIAL_DAYS } = require('../middleware/subscription.middleware');
const { DEFAULT_THEME_CONFIG } = require('../constants');

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
  let theme_config = null;
  if (row.theme_config) {
    try {
      theme_config = typeof row.theme_config === 'string' ? JSON.parse(row.theme_config) : row.theme_config;
    } catch {
      theme_config = null;
    }
  }
  return { ...row, banner_urls, theme_config, subscription: evaluateSubscription(row) };
}

async function createStore(req, res) {
  try {
    const { name, slug, plan_id } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Nome e endereço da loja são obrigatórios' });
    }

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
      `INSERT INTO stores (id, owner_id, plan_id, name, slug, status, banner_urls, theme_config, theme_id, trial_ends_at)
       VALUES (?, ?, ?, ?, ?, 'trial', '[]', ?, 'standard', DATE_ADD(NOW(), INTERVAL ? DAY))`,
      [id, req.userId, plan_id, name, slug, DEFAULT_THEME_CONFIG, TRIAL_DAYS]
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

    // Receita por mês (últimos 12 meses) — usado no gráfico do Resumo.
    const [revenueRows] = await pool.query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS ym, SUM(total) AS total
       FROM orders
       WHERE store_id = ? AND status IN ('paid', 'shipped', 'delivered')
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL 11 MONTH)
       GROUP BY ym`,
      [storeId]
    );
    const byMonth = new Map(revenueRows.map((r) => [r.ym, Number(r.total)]));
    const revenueByMonth = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      revenueByMonth.push(byMonth.get(key) ?? 0);
    }

    return res.json({
      products: productsCount.count,
      orders: ordersCount.count,
      customers: customersCount.count,
      revenue: Number(revenueRow.revenue),
      revenueByMonth,
      recentOrders,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function updateMyStore(req, res) {
  try {
    const { theme_primary, theme_id, description, logo_url, banner_urls, whatsapp } = req.body;

    const [storeRows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const storeId = storeRows[0].id;

    const validThemeIds = ['standard', 'luxury', 'minimal', 'fashion', 'electronics'];
    const resolvedThemeId = theme_id && validThemeIds.includes(theme_id) ? theme_id : undefined;

    const bannerList = Array.isArray(banner_urls) ? banner_urls.slice(0, 5) : [];

    const fields = [];
    const values = [];

    if (theme_primary !== undefined) { fields.push('theme_primary = ?'); values.push(theme_primary || null); }
    if (resolvedThemeId !== undefined) { fields.push('theme_id = ?'); values.push(resolvedThemeId); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description || null); }
    if (logo_url !== undefined) { fields.push('logo_url = ?'); values.push(logo_url || null); }
    if (banner_urls !== undefined) {
      fields.push('banner_url = ?', 'banner_urls = ?');
      values.push(bannerList[0] || null, JSON.stringify(bannerList));
    }
    if (whatsapp !== undefined) { fields.push('whatsapp = ?'); values.push(whatsapp || null); }

    if (fields.length === 0) {
      const [rows] = await pool.query('SELECT * FROM stores WHERE id = ?', [storeId]);
      return res.json(parseStore(rows[0]));
    }

    fields.push('updated_at = NOW()');
    values.push(storeId);

    await pool.query(`UPDATE stores SET ${fields.join(', ')} WHERE id = ?`, values);

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
