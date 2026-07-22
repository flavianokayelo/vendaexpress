const pool = require('../db');

async function listPlans(req, res) {
  try {
    const [rows] = await pool.query('SELECT * FROM plans ORDER BY sort_order ASC');
    const plans = rows.map((p) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    }));
    return res.json(plans);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { listPlans };