const pool = require('../db');

async function getProductFullDetails(req, res) {
  try {
    const { id } = req.params;

    // JOIN products -> stores -> users, para trazer de uma vez:
    // dados do produto, dados da loja, e o contacto (email) do dono da loja.
    const [rows] = await pool.query(
      `SELECT
         p.*,
         s.name AS store_name,
         s.slug AS store_slug,
         s.status AS store_status,
         s.theme_primary AS store_theme_primary,
         s.description AS store_description,
         s.logo_url AS store_logo_url,
         s.banner_url AS store_banner_url,
         s.whatsapp AS store_whatsapp,
         s.currency AS store_currency,
         u.id AS owner_id,
         u.email AS owner_email
       FROM products p
       JOIN stores s ON s.id = p.store_id
       JOIN users u ON u.id = s.owner_id
       WHERE p.id = ? AND p.active = 1 AND s.status IN ('trial', 'active')`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    const row = rows[0];

    // Fotos e vídeo ficam em tabelas separadas (mesma lógica do storefront.controller).
    const [videoRows] = await pool.query('SELECT * FROM product_videos WHERE product_id = ?', [id]);
    const [photoRows] = await pool.query(
      'SELECT * FROM product_photos WHERE product_id = ? ORDER BY sort_order ASC',
      [id]
    );

    let category = null;
    if (row.category_id) {
      const [categoryRows] = await pool.query('SELECT * FROM categories WHERE id = ?', [row.category_id]);
      category = categoryRows[0] || null;
    }

    const product = {
      id: row.id,
      store_id: row.store_id,
      category_id: row.category_id,
      name: row.name,
      description: row.description,
      return_policy: row.return_policy,
      price: row.price,
      compare_at_price: row.compare_at_price,
      stock: row.stock,
      color: row.color,
      color_hex: row.color_hex,
      size: row.size,
      item_condition: row.item_condition,
      image_url: row.image_url,
      active: !!row.active,
      created_at: row.created_at,
      updated_at: row.updated_at,
      images: (photoRows || []).map((p) => ({ url: p.url, hash: p.hash })),
      video: videoRows[0] ? { url: videoRows[0].url, thumbnail_url: videoRows[0].thumbnail_url || null } : null,
    };

    const store = {
      id: row.store_id,
      name: row.store_name,
      slug: row.store_slug,
      status: row.store_status,
      theme_primary: row.store_theme_primary,
      description: row.store_description,
      logo_url: row.store_logo_url,
      banner_url: row.store_banner_url,
      whatsapp: row.store_whatsapp,
      currency: row.store_currency,
      owner: {
        id: row.owner_id,
        email: row.owner_email,
      },
    };

    return res.json({ product, store, category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = { getProductFullDetails };