const pool = require('../db');

const VALID_STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

async function getMyOrders(req, res) {
  try {
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const storeId = storeRows[0].id;

    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE store_id = ? ORDER BY created_at DESC',
      [storeId]
    );
    return res.json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getOrderItems(req, res) {
  try {
    const { id } = req.params;
    const [storeRows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const storeId = storeRows[0].id;

    // Confirma que o pedido pertence mesmo à loja do utilizador autenticado
    // antes de devolver os itens (evita ver pedidos de outra loja pelo id).
    const [orderRows] = await pool.query('SELECT id FROM orders WHERE id = ? AND store_id = ?', [id, storeId]);
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

    const [storeRows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [req.userId]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const storeId = storeRows[0].id;

    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ? AND store_id = ?',
      [status, id, storeId]
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