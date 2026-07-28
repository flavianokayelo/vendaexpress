const pool = require('../db');

async function listPages(req, res) {
  try {
    const userId = req.userId;
    const [stores] = await pool.query('SELECT id FROM stores WHERE user_id = ?', [userId]);
    if (!stores.length) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    const storeId = stores[0].id;
    const [rows] = await pool.query(
      'SELECT id, store_id, title, slug, template, status, sections, meta, created_at, updated_at FROM pages WHERE store_id = ? ORDER BY updated_at DESC',
      [storeId]
    );
    const pages = rows.map(normalizePage);
    return res.json(pages);
  } catch (err) {
    console.error('[PagesController] listPages:', err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getPage(req, res) {
  try {
    const userId = req.userId;
    const [stores] = await pool.query('SELECT id FROM stores WHERE user_id = ?', [userId]);
    if (!stores.length) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    const storeId = stores[0].id;
    const [rows] = await pool.query(
      'SELECT id, store_id, title, slug, template, status, sections, meta, created_at, updated_at FROM pages WHERE id = ? AND store_id = ?',
      [req.params.id, storeId]
    );
    if (!rows.length) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }
    return res.json(normalizePage(rows[0]));
  } catch (err) {
    console.error('[PagesController] getPage:', err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function createPage(req, res) {
  try {
    const userId = req.userId;
    const [stores] = await pool.query('SELECT id FROM stores WHERE user_id = ?', [userId]);
    if (!stores.length) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    const storeId = stores[0].id;
    const { title, slug, template, status, sections, meta } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: 'Título e slug são obrigatórios' });
    }

    const [result] = await pool.query(
      `INSERT INTO pages (store_id, title, slug, template, status, sections, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        storeId,
        title,
        slug,
        template || 'blank',
        status || 'draft',
        sections ? JSON.stringify(sections) : '[]',
        meta ? JSON.stringify(meta) : '{}',
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, store_id, title, slug, template, status, sections, meta, created_at, updated_at FROM pages WHERE id = ?',
      [result.insertId]
    );
    return res.status(201).json(normalizePage(rows[0]));
  } catch (err) {
    console.error('[PagesController] createPage:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Já existe uma página com este slug' });
    }
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function updatePage(req, res) {
  try {
    const userId = req.userId;
    const [stores] = await pool.query('SELECT id FROM stores WHERE user_id = ?', [userId]);
    if (!stores.length) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    const storeId = stores[0].id;

    const [existing] = await pool.query(
      'SELECT id FROM pages WHERE id = ? AND store_id = ?',
      [req.params.id, storeId]
    );
    if (!existing.length) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }

    const { title, slug, template, status, sections, meta } = req.body;

    await pool.query(
      `UPDATE pages SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        template = COALESCE(?, template),
        status = COALESCE(?, status),
        sections = COALESCE(?, sections),
        meta = COALESCE(?, meta)
       WHERE id = ?`,
      [
        title || null,
        slug || null,
        template || null,
        status || null,
        sections ? JSON.stringify(sections) : null,
        meta ? JSON.stringify(meta) : null,
        req.params.id,
      ]
    );

    const [rows] = await pool.query(
      'SELECT id, store_id, title, slug, template, status, sections, meta, created_at, updated_at FROM pages WHERE id = ?',
      [req.params.id]
    );
    return res.json(normalizePage(rows[0]));
  } catch (err) {
    console.error('[PagesController] updatePage:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Já existe uma página com este slug' });
    }
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function deletePage(req, res) {
  try {
    const userId = req.userId;
    const [stores] = await pool.query('SELECT id FROM stores WHERE user_id = ?', [userId]);
    if (!stores.length) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    const storeId = stores[0].id;

    const [result] = await pool.query(
      'DELETE FROM pages WHERE id = ? AND store_id = ?',
      [req.params.id, storeId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Página não encontrada' });
    }
    return res.json({ ok: true });
  } catch (err) {
    console.error('[PagesController] deletePage:', err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

function normalizePage(row) {
  return {
    id: String(row.id),
    storeId: String(row.store_id),
    title: row.title,
    slug: row.slug,
    template: row.template,
    status: row.status,
    sections: typeof row.sections === 'string' ? JSON.parse(row.sections) : (row.sections || []),
    meta: typeof row.meta === 'string' ? JSON.parse(row.meta) : (row.meta || {}),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { listPages, getPage, createPage, updatePage, deletePage };
