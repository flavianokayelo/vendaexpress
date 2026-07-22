const { v4: uuidv4 } = require('uuid');
const pool = require('../db');

function parseProduct(row, videoRow, photoRows) {
  return {
    ...row,
    images: (photoRows || []).map((p) => ({ url: p.url, hash: p.hash })),
    video: videoRow ? { url: videoRow.url, thumbnail_url: videoRow.thumbnail_url || null } : null,
    active: !!row.active,
  };
}

async function getStoreIdBySlug(slug) {
  const [rows] = await pool.query('SELECT id FROM stores WHERE slug = ?', [slug]);
  return rows[0]?.id ?? null;
}

// Busca produtos por uma lista de IDs, já com fotos e vídeo anexados —
// usado pelo carrinho e pela wishlist para devolver os produtos completos.
async function getProductsById(storeId, ids) {
  if (!ids || ids.length === 0) return [];
  const placeholders = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT * FROM products WHERE store_id = ? AND id IN (${placeholders})`,
    [storeId, ...ids]
  );
  if (rows.length === 0) return [];

  const [photoRows] = await pool.query(
    `SELECT product_id, url, hash FROM product_photos WHERE store_id = ? AND product_id IN (${placeholders})`,
    [storeId, ...ids]
  );
  const photosByProduct = new Map();
  for (const row of photoRows) {
    const list = photosByProduct.get(row.product_id) || [];
    list.push({ url: row.url, hash: row.hash });
    photosByProduct.set(row.product_id, list);
  }

  const [videoRows] = await pool.query(
    `SELECT product_id, url, thumbnail_url FROM product_videos WHERE store_id = ? AND product_id IN (${placeholders})`,
    [storeId, ...ids]
  );
  const videoByProduct = new Map();
  for (const row of videoRows) {
    videoByProduct.set(row.product_id, { url: row.url, thumbnail_url: row.thumbnail_url });
  }

  return rows.map((p) => ({
    ...p,
    images: photosByProduct.get(p.id) || [],
    video: videoByProduct.get(p.id) || null,
    active: !!p.active,
  }));
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
    // banner_urls é guardado como JSON em LONGTEXT — o mysql2 não faz parse automático
    let banner_urls = [];
    if (store.banner_urls) {
      try {
        banner_urls = typeof store.banner_urls === 'string' ? JSON.parse(store.banner_urls) : store.banner_urls;
      } catch {
        banner_urls = [];
      }
    }
    const parsedStore = { ...store, banner_urls };

    const [products] = await pool.query(
      'SELECT * FROM products WHERE store_id = ? AND active = 1 ORDER BY created_at DESC',
      [store.id]
    );
    const [categories] = await pool.query(
      'SELECT * FROM categories WHERE store_id = ? ORDER BY name ASC',
      [store.id]
    );
    const [photoRows] = await pool.query(
      'SELECT product_id, url, hash FROM product_photos WHERE store_id = ? ORDER BY sort_order ASC',
      [store.id]
    );
    const photosByProduct = new Map();
    for (const row of photoRows) {
      const list = photosByProduct.get(row.product_id) || [];
      list.push({ url: row.url, hash: row.hash });
      photosByProduct.set(row.product_id, list);
    }
    const [videoRows] = await pool.query(
      'SELECT product_id, url, thumbnail_url FROM product_videos WHERE store_id = ?',
      [store.id]
    );
    const videoByProduct = new Map();
    for (const row of videoRows) {
      videoByProduct.set(row.product_id, { url: row.url, thumbnail_url: row.thumbnail_url });
    }
    const productsWithMedia = products.map((p) => ({
      ...p,
      images: photosByProduct.get(p.id) || [],
      video: videoByProduct.get(p.id) || null,
      active: !!p.active,
    }));

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

    const [videoRows] = await pool.query('SELECT * FROM product_videos WHERE product_id = ?', [id]);
    const [photoRows] = await pool.query(
      'SELECT * FROM product_photos WHERE product_id = ? ORDER BY sort_order ASC',
      [id]
    );

    let category = null;
    if (productRow.category_id) {
      const [categoryRows] = await pool.query('SELECT * FROM categories WHERE id = ?', [productRow.category_id]);
      category = categoryRows[0] || null;
    }

    // Produtos relacionados: mesma categoria, ativos, excluindo o próprio.
    let related = [];
    if (productRow.category_id) {
      const [relatedRows] = await pool.query(
        `SELECT * FROM products
         WHERE store_id = ? AND category_id = ? AND id != ? AND active = 1
         ORDER BY created_at DESC LIMIT 8`,
        [store.id, productRow.category_id, id]
      );
      const relatedIds = relatedRows.map((r) => r.id);
      const relatedPhotosByProduct = new Map();
      if (relatedIds.length > 0) {
        const placeholders = relatedIds.map(() => '?').join(',');
        const [relatedPhotoRows] = await pool.query(
          `SELECT * FROM product_photos WHERE product_id IN (${placeholders}) ORDER BY product_id, sort_order ASC`,
          relatedIds
        );
        for (const ph of relatedPhotoRows) {
          if (!relatedPhotosByProduct.has(ph.product_id)) relatedPhotosByProduct.set(ph.product_id, []);
          relatedPhotosByProduct.get(ph.product_id).push(ph);
        }
      }
      related = relatedRows.map((r) => parseProduct(r, null, relatedPhotosByProduct.get(r.id)));
    }

    const product = parseProduct(productRow, videoRows[0], photoRows);

    return res.json({ store, product, category, related });
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

    const customerId = uuidv4();
    await pool.query(
      'INSERT INTO customers (id, store_id, name, phone) VALUES (?, ?, ?, ?)',
      [customerId, storeId, name.trim(), phone || null]
    );

    const orderId = uuidv4();
    await pool.query(
      `INSERT INTO orders (id, store_id, customer_id, customer_name, customer_phone, customer_address, total, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderId, storeId, customerId, name.trim(), phone || null, address || null, total]
    );

    for (const item of orderItemsData) {
      await pool.query(
        'INSERT INTO order_items (id, order_id, product_id, name, price, quantity) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), orderId, item.product_id, item.name, item.price, item.quantity]
      );
    }

    return res.status(201).json({ order_id: orderId, total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro no servidor' });
  }
}

// --- Carrinho sincronizado (guest_id anónimo por dispositivo) ---

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
    const products = await getProductsById(storeId, items.map((i) => i.product_id));
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

// --- Wishlist sincronizada (guest_id anónimo por dispositivo) ---

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
    const products = await getProductsById(storeId, items.map((i) => i.product_id));
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
  validateCoupon,
  placeOrder,
  getCart,
  syncCart,
  getWishlist,
  syncWishlist,
};