const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const storeService = require('../services/store.service');

async function categoryBelongsToStore(categoryId, storeId) {
  const [rows] = await pool.query(
    'SELECT id FROM categories WHERE id = ? AND store_id = ?',
    [categoryId, storeId]
  );
  return rows.length > 0;
}

async function listSubcategories(req, res) {
  try {
    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const { category_id } = req.query;
    let sql = 'SELECT * FROM subcategories WHERE store_id = ?';
    const params = [storeId];
    if (category_id) {
      sql += ' AND category_id = ?';
      params.push(category_id);
    }
    sql += ' ORDER BY name ASC';

    const [rows] = await pool.query(sql, params);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function createSubcategory(req, res) {
  try {
    const { name, category_id } = req.body;
    if (!name || !name.trim() || !category_id) {
      return res.status(400).json({ error: 'Nome e categoria são obrigatórios' });
    }

    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const belongs = await categoryBelongsToStore(category_id, storeId);
    if (!belongs) return res.status(404).json({ error: 'Categoria não encontrada' });

    const id = uuidv4();
    await pool.query(
      'INSERT INTO subcategories (id, store_id, category_id, name) VALUES (?, ?, ?, ?)',
      [id, storeId, category_id, name.trim()]
    );

    const [rows] = await pool.query('SELECT * FROM subcategories WHERE id = ?', [id]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function updateSubcategory(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [result] = await pool.query(
      'UPDATE subcategories SET name = ? WHERE id = ? AND store_id = ?',
      [name.trim(), id, storeId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sub-categoria não encontrada' });
    }

    const [rows] = await pool.query('SELECT * FROM subcategories WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function deleteSubcategory(req, res) {
  try {
    const { id } = req.params;
    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [result] = await pool.query(
      'DELETE FROM subcategories WHERE id = ? AND store_id = ?',
      [id, storeId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Sub-categoria não encontrada' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { listSubcategories, createSubcategory, updateSubcategory, deleteSubcategory };
