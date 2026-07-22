const pool = require('../db');

async function listStores(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT
        s.*,
        u.email AS owner_email,
        p.name AS plan_name
      FROM stores s
      JOIN users u ON u.id = s.owner_id
      LEFT JOIN plans p ON p.id = s.plan_id
      ORDER BY s.created_at DESC
    `);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getStats(req, res) {
  try {
    const [[{ storeCount }]] = await pool.query('SELECT COUNT(*) AS storeCount FROM stores');
    const [[{ productCount }]] = await pool.query('SELECT COUNT(*) AS productCount FROM products');
    const [[{ orderCount }]] = await pool.query('SELECT COUNT(*) AS orderCount FROM orders');
    const [[{ revenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS revenue
       FROM orders
       WHERE status IN ('paid','shipped','delivered')`
    );

    return res.json({
      stores: storeCount,
      products: productCount,
      orders: orderCount,
      revenue: Number(revenue),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { listStores, getStats };