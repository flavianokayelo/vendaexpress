const pool = require('../db');
const storeService = require('../services/store.service');

async function getMyCustomers(req, res) {
  try {
    const store = await storeService.getOwnedStore(req.userId);
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' });

    const { search, page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

    let sql = 'SELECT * FROM customers WHERE store_id = ?';
    const params = [store.id];

    if (search && search.trim()) {
      sql += ' AND (name LIKE ? OR phone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [customers] = await pool.query(sql, params);

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM customers WHERE store_id = ?',
      [store.id]
    );

    return res.json({ customers, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { getMyCustomers };
