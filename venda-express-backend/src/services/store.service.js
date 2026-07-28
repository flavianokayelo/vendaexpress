const pool = require('../db');

async function getOwnedStoreId(userId) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [userId]);
  return rows[0]?.id ?? null;
}

async function getOwnedStore(userId) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [userId]);
  return rows[0] || null;
}

module.exports = { getOwnedStoreId, getOwnedStore };
