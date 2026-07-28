const pool = require('../db');
const storeService = require('../services/store.service');

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

async function getMyOrders(req, res) {
  try {
    const store = await storeService.getOwnedStore(req.userId);
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' });

    const { status, search, page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, Number(page)) - 1) * Number(limit);

    let sql = 'SELECT * FROM orders WHERE store_id = ?';
    const params = [store.id];

    if (status && VALID_STATUSES.includes(status)) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search && search.trim()) {
      sql += ' AND (customer_name LIKE ? OR customer_phone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), offset);

    const [orders] = await pool.query(sql, params);

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM orders WHERE store_id = ?',
      [store.id]
    );

    return res.json({ orders, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getOrderItems(req, res) {
  try {
    const { id } = req.params;
    const store = await storeService.getOwnedStore(req.userId);
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' });

    const [orderRows] = await pool.query('SELECT id FROM orders WHERE id = ? AND store_id = ?', [id, store.id]);
    if (orderRows.length === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Estado de pedido inválido' });
    }

    const store = await storeService.getOwnedStore(req.userId);
    if (!store) return res.status(404).json({ error: 'Loja não encontrada' });

    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ? AND store_id = ?',
      [status, id, store.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pedido não encontrado' });

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { getMyOrders, getOrderItems, updateOrderStatus };
