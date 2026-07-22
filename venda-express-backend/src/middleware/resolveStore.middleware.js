const pool = require('../db');

async function resolveStore(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    req.storeId = rows[0].id;
    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { resolveStore };