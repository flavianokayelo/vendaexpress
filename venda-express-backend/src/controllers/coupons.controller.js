const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const storeService = require('../services/store.service');

async function listCoupons(req, res) {
  try {
    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE store_id = ? ORDER BY code ASC',
      [storeId]
    );
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function createCoupon(req, res) {
  try {
    const { code, discount_percent, active, is_public } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Código do cupão é obrigatório' });
    }
    const discount = Number(discount_percent);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      return res.status(400).json({ error: 'Desconto deve ser entre 1 e 100' });
    }

    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [existing] = await pool.query(
      'SELECT id FROM coupons WHERE store_id = ? AND code = ?',
      [storeId, code.toUpperCase().trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Já existe um cupão com este código' });
    }

    const id = uuidv4();
    await pool.query(
      'INSERT INTO coupons (id, store_id, code, discount_percent, active, is_public) VALUES (?, ?, ?, ?, ?, ?)',
      [id, storeId, code.toUpperCase().trim(), discount, active === undefined ? 1 : (active ? 1 : 0), is_public ? 1 : 0]
    );

    const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const { code, discount_percent, active, is_public } = req.body;

    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const updates = [];
    const params = [];

    if (code !== undefined) {
      if (!code.trim()) return res.status(400).json({ error: 'Código do cupão inválido' });
      updates.push('code = ?');
      params.push(code.toUpperCase().trim());
    }
    if (discount_percent !== undefined) {
      const d = Number(discount_percent);
      if (isNaN(d) || d <= 0 || d > 100) {
        return res.status(400).json({ error: 'Desconto deve ser entre 1 e 100' });
      }
      updates.push('discount_percent = ?');
      params.push(d);
    }
    if (active !== undefined) {
      updates.push('active = ?');
      params.push(active ? 1 : 0);
    }
    if (is_public !== undefined) {
      updates.push('is_public = ?');
      params.push(is_public ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }

    params.push(id, storeId);
    const [result] = await pool.query(
      `UPDATE coupons SET ${updates.join(', ')} WHERE id = ? AND store_id = ?`,
      params
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cupão não encontrado' });
    }

    const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;
    const storeId = await storeService.getOwnedStoreId(req.userId);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [result] = await pool.query(
      'DELETE FROM coupons WHERE id = ? AND store_id = ?',
      [id, storeId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cupão não encontrado' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { listCoupons, createCoupon, updateCoupon, deleteCoupon };
