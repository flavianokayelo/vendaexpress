const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

async function getOwnedStoreId(userId) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE owner_id = ?', [userId]);
  return rows[0]?.id ?? null;
}

async function listCategories(req, res) {
  try {
    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE store_id = ? ORDER BY name ASC',
      [storeId]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function createCategory(req, res) {
  try {
    const { name, icon_url } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }

    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const id = uuidv4();
    await pool.query(
      'INSERT INTO categories (id, store_id, name, icon_url) VALUES (?, ?, ?, ?)',
      [id, storeId, name.trim(), icon_url || null]
    );

    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, icon_url } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    }

    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [result] = await pool.query(
      'UPDATE categories SET name = ?, icon_url = ? WHERE id = ? AND store_id = ?',
      [name.trim(), icon_url || null, id, storeId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }

    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const storeId = await getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [result] = await pool.query(
      'DELETE FROM categories WHERE id = ? AND store_id = ?',
      [id, storeId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };