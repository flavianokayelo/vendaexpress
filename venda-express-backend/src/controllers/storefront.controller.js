const { v4: uuidv4 } = require('uuid');
const pool = require('../db');
const mediaService = require('../services/media.service');

async function getStoreIdBySlug(slug) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE slug = ?', [slug]);
  return rows[0]?.id ?? null;
}

async function getStorefront(req, res) {
  try {
    const { slug } = req.params;
    const [storeRows] = await pool.query(
      "SELECT * FROM stores WHERE slug = ? AND status IN ('trial','active')",
      [slug]
    );
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });

    const store = storeRows[0];
    let banner_urls = [];
    if (store.banner_urls) {
      try {
        banner_urls = typeof store.banner_urls === 'string' ? JSON.parse(store.banner_urls) : store.banner_urls;
      } catch {
        banner_urls = [];
      }
    }
    let theme_config = null;
    if (store.theme_config) {
      try {
        theme_config = typeof store.theme_config === 'string' ? JSON.parse(store.theme_config) : store.theme_config;
      } catch {
        theme_config = null;
      }
    }
    const parsedStore = { ...store, banner_urls, theme_config };

    const [products] = await pool.query(
      'SELECT * FROM products WHERE store_id = ? AND active = 1 ORDER BY created_at DESC',
      [store.id]
    );
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE store_id = ? ORDER BY name ASC',
      [store.id]
    );

    const productsWithMedia = await mediaService.attachMedia(store.id, products);

    return res.json({ store: parsedStore, categories, products: productsWithMedia });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getStorefrontProduct(req, res) {
  try {
    const { slug, id } = req.params;
    const [storeRows] = await pool.query(
      "SELECT * FROM stores WHERE slug = ? AND status IN ('trial','active')",
      [slug]
    );
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const store = storeRows[0];

    const [productRows] = await pool.query(
      'SELECT * FROM products WHERE id = ? AND store_id = ? AND active = 1',
      [id, store.id]
    );
    if (productRows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    const productRow = productRows[0];

    const [withMedia] = await mediaService.attachMedia(store.id, [productRow]);
    const product = withMedia;

    let category = null;
    if (productRow.category_id) {
      const [categoryRows] = await pool.query('SELECT * FROM categories WHERE id = ?', [productRow.category_id]);
      category = categoryRows[0] || null;
    }

    let related = [];
    if (productRow.category_id) {
      const [relatedRows] = await pool.query(
        `SELECT * FROM products
         WHERE store_id = ? AND category_id = ? AND id != ? AND active = 1
         ORDER BY created_at DESC LIMIT 8`,
        [store.id, productRow.category_id, id]
      );
      related = await mediaService.attachMedia(store.id, relatedRows);
    }

    return res.json({ store, product, category, related });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getStorefrontPage(req, res) {
  try {
    const { slug, pageSlug } = req.params;
    const [storeRows] = await pool.query(
      "SELECT id, name, slug, logo_url, description, whatsapp, currency, theme_id FROM stores WHERE slug = ? AND status IN ('trial','active')",
      [slug]
    );
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const store = storeRows[0];

    const [pageRows] = await pool.query(
      `SELECT id, store_id, title, slug, template, status, sections, meta, created_at, updated_at
       FROM pages WHERE store_id = ? AND slug = ? AND status = 'published'`,
      [store.id, pageSlug]
    );
    if (pageRows.length === 0) return res.status(404).json({ error: 'Página não encontrada' });
    const row = pageRows[0];
    const page = {
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

    const [categories] = await pool.query('SELECT * FROM categories WHERE store_id = ? ORDER BY name ASC', [store.id]);

    return res.json({ store, categories, page });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function validateCoupon(req, res) {
  try {
    const { slug } = req.params;
    const { code } = req.body;
    if (!code || !code.trim()) return res.status(400).json({ error: 'Código obrigatório' });

    const [storeRows] = await pool.query('SELECT id FROM stores WHERE slug = ?', [slug]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });

    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE store_id = ? AND code = ? AND active = 1',
      [storeRows[0].id, code.toUpperCase().trim()]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cupom inválido ou expirado' });

    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function placeOrder(req, res) {
  try {
    const { slug } = req.params;
    const { name, phone, address, items, coupon_code } = req.body;

    if (!name || !name.trim() || !phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Dados do pedido incompletos' });
    }

    const [storeRows] = await pool.query('SELECT id FROM stores WHERE slug = ?', [slug]);
    if (storeRows.length === 0) return res.status(404).json({ error: 'Loja não encontrada' });
    const storeId = storeRows[0].id;

    const productIds = items.map((i) => i.product_id).filter(Boolean);
    if (productIds.length === 0) return res.status(400).json({ error: 'Carrinho vazio' });

    const placeholders = productIds.map(() => '?').join(',');
    const [productRows] = await pool.query(
      `SELECT id, name, price FROM products WHERE store_id = ? AND active = 1 AND id IN (${placeholders})`,
      [storeId, ...productIds]
    );
    const productMap = new Map(productRows.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItemsData = [];
    for (const item of items) {
      const p = productMap.get(item.product_id);
      if (!p) continue;
      const qty = Math.max(1, Number(item.quantity) || 1);
      subtotal += Number(p.price) * qty;
      orderItemsData.push({ product_id: p.id, name: p.name, price: Number(p.price), quantity: qty });
    }
    if (orderItemsData.length === 0) return res.status(400).json({ error: 'Produtos inválidos' });

    let discountPercent = 0;
    if (coupon_code) {
      const [couponRows] = await pool.query(
        'SELECT discount_percent FROM coupons WHERE store_id = ? AND code = ? AND active = 1',
        [storeId, coupon_code.toUpperCase().trim()]
      );
      if (couponRows.length > 0) discountPercent = Number(couponRows[0].discount_percent);
    }
    const total = Math.round((subtotal - (subtotal * discountPercent) / 100) * 100) / 100;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const customerId = uuidv4();
      await conn.query(
        'INSERT INTO customers (id, store_id, name, phone) VALUES (?, ?, ?, ?)',
        [customerId, storeId, name.trim(), phone || null]
      );

      const orderId = uuidv4();
      await conn.query(
        `INSERT INTO orders (id, store_id, customer_id, customer_name, customer_phone, customer_address, total, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [orderId, storeId, customerId, name.trim(), phone || null, address || null, total]
      );

      for (const item of orderItemsData) {
        await conn.query(
          'INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), orderId, item.product_id, item.name, item.price, item.quantity]
        );
      }

      await conn.commit();
      return res.status(201).json({ order_id: orderId, total });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getCart(req, res) {
  try {
    const { slug } = req.params;
    const { guest_id } = req.query;
    if (!guest_id) return res.json([]);

    const storeId = await getStoreIdBySlug(slug);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [items] = await pool.query(
      'SELECT product_id, quantity FROM cart_items WHERE store_id = ? AND guest_id = ?',
      [storeId, guest_id]
    );
    const products = await mediaService.getProductsById(storeId, items.map((i) => i.product_id));
    const productMap = new Map(products.map((p) => [p.id, p]));

    const result = items
      .filter((i) => productMap.has(i.product_id))
      .map((i) => ({ product: productMap.get(i.product_id), quantity: i.quantity }));
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function syncCart(req, res) {
  try {
    const { slug } = req.params;
    const { guest_id, items } = req.body;
    if (!guest_id || !Array.isArray(items)) return res.status(400).json({ error: 'Dados inválidos' });

    const storeId = await getStoreIdBySlug(slug);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    await pool.query('DELETE FROM cart_items WHERE store_id = ? AND guest_id = ?', [storeId, guest_id]);

    const values = items
      .filter((i) => i.product_id && Number(i.quantity) > 0)
      .map((i) => [uuidv4(), storeId, guest_id, i.product_id, Math.max(1, Number(i.quantity))]);
    if (values.length > 0) {
      await pool.query(
        'INSERT INTO cart_items (id, store_id, guest_id, product_id, quantity) VALUES ?',
        [values]
      );
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function getWishlist(req, res) {
  try {
    const { slug } = req.params;
    const { guest_id } = req.query;
    if (!guest_id) return res.json([]);

    const storeId = await getStoreIdBySlug(slug);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    const [items] = await pool.query(
      'SELECT product_id FROM wishlist_items WHERE store_id = ? AND guest_id = ?',
      [storeId, guest_id]
    );
    const products = await mediaService.getProductsById(storeId, items.map((i) => i.product_id));
    return res.json(products);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

async function syncWishlist(req, res) {
  try {
    const { slug } = req.params;
    const { guest_id, product_ids } = req.body;
    if (!guest_id || !Array.isArray(product_ids)) return res.status(400).json({ error: 'Dados inválidos' });

    const storeId = await getStoreIdBySlug(slug);
    if (!storeId) return res.status(404).json({ error: 'Loja não encontrada' });

    await pool.query('DELETE FROM wishlist_items WHERE store_id = ? AND guest_id = ?', [storeId, guest_id]);

    if (product_ids.length > 0) {
      const values = product_ids.map((pid) => [uuidv4(), storeId, guest_id, pid]);
      await pool.query('INSERT INTO wishlist_items (id, store_id, guest_id, product_id) VALUES ?', [values]);
    }
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

module.exports = {
  getStorefront,
  getStorefrontProduct,
  getStorefrontPage,
  validateCoupon,
  placeOrder,
  getCart,
  syncCart,
  getWishlist,
  syncWishlist,
};
