const pool = require('../db');

async function getMyCustomers(req, res) {
  try {
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const storeId = storeRows[0].id;

    const [customers] = await pool.query(
      'SELECT * FROM customers WHERE store_id = ? ORDER BY created_at DESC',
      [storeId]
    );
    return res.json(customers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { getMyCustomers };