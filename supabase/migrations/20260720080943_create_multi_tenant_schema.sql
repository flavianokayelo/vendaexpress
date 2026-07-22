/*
# Venda Express — Multi-tenant SaaS Schema

## Overview
Creates the full multi-tenant e-commerce platform schema. Every tenant (store) row
is owned by an authenticated merchant. All tenant-scoped tables carry a `store_id`
foreign key and are protected with ownership-aware RLS policies that check the
store's owner via the parent `stores` row.

## Tables
- plans: subscription plans (Starter, Business, Premium)
- stores: tenant stores, owned by authenticated merchants
- categories, products, customers, orders, order_items, coupons, store_staff: all store-scoped

## Security
- RLS enabled on every table.
- plans: public read, authenticated write.
- stores: owner CRUD + public read for active/trial stores (storefront rendering).
- Tenant tables: CRUD scoped to stores where auth.uid() = owner_id.
- Public storefront: anon+authenticated can SELECT active products & categories,
  and INSERT orders + order_items (guest checkout). Intentional shared access.
*/

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- plans
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  product_limit int,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_plans" ON plans;
CREATE POLICY "public_read_plans" ON plans FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_manage_plans" ON plans;
CREATE POLICY "auth_manage_plans" ON plans FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_plans" ON plans;
CREATE POLICY "auth_update_plans" ON plans FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

-- stores
CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'trial',
  theme_primary text NOT NULL DEFAULT '#0f766e',
  description text,
  logo_url text,
  banner_url text,
  whatsapp text,
  currency text NOT NULL DEFAULT 'AOA',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_stores" ON stores;
CREATE POLICY "owner_select_stores" ON stores FOR SELECT
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owner_insert_stores" ON stores;
CREATE POLICY "owner_insert_stores" ON stores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owner_update_stores" ON stores;
CREATE POLICY "owner_update_stores" ON stores FOR UPDATE
  TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "owner_delete_stores" ON stores;
CREATE POLICY "owner_delete_stores" ON stores FOR DELETE
  TO authenticated USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "public_select_stores" ON stores;
CREATE POLICY "public_select_stores" ON stores FOR SELECT
  TO anon, authenticated USING (status IN ('active','trial'));

-- categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_categories" ON categories;
CREATE POLICY "owner_select_categories" ON categories FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = categories.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_insert_categories" ON categories;
CREATE POLICY "owner_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = categories.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_categories" ON categories;
CREATE POLICY "owner_update_categories" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = categories.store_id AND s.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = categories.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_categories" ON categories;
CREATE POLICY "owner_delete_categories" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = categories.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "public_select_categories" ON categories;
CREATE POLICY "public_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock int NOT NULL DEFAULT 0,
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_products" ON products;
CREATE POLICY "owner_select_products" ON products FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_insert_products" ON products;
CREATE POLICY "owner_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_products" ON products;
CREATE POLICY "owner_update_products" ON products FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_products" ON products;
CREATE POLICY "owner_delete_products" ON products FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = products.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "public_select_products" ON products;
CREATE POLICY "public_select_products" ON products FOR SELECT
  TO anon, authenticated USING (active = true);

-- customers
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_customers" ON customers;
CREATE POLICY "owner_select_customers" ON customers FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = customers.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_insert_customers" ON customers;
CREATE POLICY "owner_insert_customers" ON customers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = customers.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_customers" ON customers;
CREATE POLICY "owner_update_customers" ON customers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = customers.store_id AND s.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = customers.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_customers" ON customers;
CREATE POLICY "owner_delete_customers" ON customers FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = customers.store_id AND s.owner_id = auth.uid())
  );

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_phone text,
  customer_address text,
  total numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_orders" ON orders;
CREATE POLICY "owner_select_orders" ON orders FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = orders.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "public_insert_orders" ON orders;
CREATE POLICY "public_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owner_update_orders" ON orders;
CREATE POLICY "owner_update_orders" ON orders FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = orders.store_id AND s.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = orders.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_orders" ON orders;
CREATE POLICY "owner_delete_orders" ON orders FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = orders.store_id AND s.owner_id = auth.uid())
  );

-- order_items
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric(10,2) NOT NULL DEFAULT 0,
  quantity int NOT NULL DEFAULT 1
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_order_items" ON order_items;
CREATE POLICY "owner_select_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN stores s ON s.id = o.store_id
      WHERE o.id = order_items.order_id AND s.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "public_insert_order_items" ON order_items;
CREATE POLICY "public_insert_order_items" ON order_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "owner_update_order_items" ON order_items;
CREATE POLICY "owner_update_order_items" ON order_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o JOIN stores s ON s.id = o.store_id WHERE o.id = order_items.order_id AND s.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM orders o JOIN stores s ON s.id = o.store_id WHERE o.id = order_items.order_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_order_items" ON order_items;
CREATE POLICY "owner_delete_order_items" ON order_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o JOIN stores s ON s.id = o.store_id WHERE o.id = order_items.order_id AND s.owner_id = auth.uid())
  );

-- coupons
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_percent numeric(5,2) NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_coupons" ON coupons;
CREATE POLICY "owner_select_coupons" ON coupons FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = coupons.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_insert_coupons" ON coupons;
CREATE POLICY "owner_insert_coupons" ON coupons FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = coupons.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_coupons" ON coupons;
CREATE POLICY "owner_update_coupons" ON coupons FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = coupons.store_id AND s.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = coupons.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_coupons" ON coupons;
CREATE POLICY "owner_delete_coupons" ON coupons FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = coupons.store_id AND s.owner_id = auth.uid())
  );

-- store_staff
CREATE TABLE IF NOT EXISTS store_staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE store_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select_store_staff" ON store_staff;
CREATE POLICY "owner_select_store_staff" ON store_staff FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_staff.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_insert_store_staff" ON store_staff;
CREATE POLICY "owner_insert_store_staff" ON store_staff FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_staff.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_update_store_staff" ON store_staff;
CREATE POLICY "owner_update_store_staff" ON store_staff FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_staff.store_id AND s.owner_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_staff.store_id AND s.owner_id = auth.uid())
  );

DROP POLICY IF EXISTS "owner_delete_store_staff" ON store_staff;
CREATE POLICY "owner_delete_store_staff" ON store_staff FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM stores s WHERE s.id = store_staff.store_id AND s.owner_id = auth.uid())
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_categories_store_id ON categories(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_customers_store_id ON customers(store_id);
CREATE INDEX IF NOT EXISTS idx_coupons_store_id ON coupons(store_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);

-- Seed plans
INSERT INTO plans (name, price, product_limit, features, sort_order)
VALUES
  ('Starter', 5000, 50, jsonb_build_array('Até 50 produtos','1 administrador','Tema básico','Subdomínio incluído','Loja online'), 1),
  ('Business', 15000, NULL, jsonb_build_array('Produtos ilimitados','Funcionários','Cupons de desconto','WhatsApp','Banners','Relatórios'), 2),
  ('Premium', 35000, NULL, jsonb_build_array('Domínio próprio','Google Analytics','SEO avançado','Integrações','API','Assistente IA','Suporte prioritário'), 3)
ON CONFLICT DO NOTHING;
