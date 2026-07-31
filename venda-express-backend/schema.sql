CREATE DATABASE IF NOT EXISTS venda_express
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE venda_express;

CREATE TABLE users (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  email      VARCHAR(255) NOT NULL,
  password   VARCHAR(255) NOT NULL,
  UNIQUE INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE plans (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  name          VARCHAR(255)  NOT NULL,
  price         DECIMAL(10,2) NOT NULL,
  duration_days INT           NOT NULL DEFAULT 30,
  features      JSON          NULL,
  sort_order    INT           NOT NULL DEFAULT 0,
  INDEX idx_plans_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE stores (
  id              CHAR(36)      NOT NULL PRIMARY KEY,
  owner_id        CHAR(36)      NOT NULL,
  plan_id         CHAR(36)      NULL,
  name            VARCHAR(255)  NOT NULL,
  slug            VARCHAR(60)   NOT NULL,
  status          ENUM('trial','active','suspended') NOT NULL DEFAULT 'trial',
  banner_urls     JSON          NULL,
  banner_url      VARCHAR(512)  NULL,
  logo_url        VARCHAR(512)  NULL,
  description     TEXT          NULL,
  theme_primary   VARCHAR(7)    NULL,
  theme_config    JSON          NULL,
  whatsapp        VARCHAR(50)   NULL,
  currency        VARCHAR(3)    NOT NULL DEFAULT 'AOA',
  trial_ends_at   DATETIME      NULL,
  plan_started_at DATETIME      NULL,
  plan_expires_at DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_stores_slug (slug),
  INDEX idx_stores_owner_id (owner_id),
  INDEX idx_stores_plan_id (plan_id),
  INDEX idx_stores_status (status),
  CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_stores_plan  FOREIGN KEY (plan_id)  REFERENCES plans(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id        CHAR(36)     NOT NULL PRIMARY KEY,
  store_id  CHAR(36)     NOT NULL,
  name      VARCHAR(255) NOT NULL,
  icon_url  VARCHAR(512) NULL,
  INDEX idx_categories_store_id (store_id),
  CONSTRAINT fk_categories_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subcategories (
  id          CHAR(36)     NOT NULL PRIMARY KEY,
  store_id    CHAR(36)     NOT NULL,
  category_id CHAR(36)     NOT NULL,
  name        VARCHAR(255) NOT NULL,
  INDEX idx_subcategories_store_id (store_id),
  INDEX idx_subcategories_category_id (category_id),
  CONSTRAINT fk_subcategories_store    FOREIGN KEY (store_id)    REFERENCES stores(id)    ON DELETE CASCADE,
  CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  store_id         CHAR(36)      NOT NULL,
  category_id      CHAR(36)      NULL,
  name             VARCHAR(255)  NOT NULL,
  description      TEXT          NULL,
  price            DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2) NULL,
  stock            INT           NOT NULL DEFAULT 0,
  color            VARCHAR(100)  NULL,
  color_hex        VARCHAR(7)    NULL,
  size             VARCHAR(100)  NULL,
  item_condition   VARCHAR(50)   NOT NULL DEFAULT 'novo',
  image_url        VARCHAR(512)  NULL,
  active           TINYINT(1)    NOT NULL DEFAULT 1,
  return_policy    TEXT          NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_store_id (store_id),
  INDEX idx_products_category_id (category_id),
  INDEX idx_products_active (active),
  INDEX idx_products_store_active (store_id, active),
  CONSTRAINT fk_products_store    FOREIGN KEY (store_id)    REFERENCES stores(id)    ON DELETE CASCADE,
  CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_photos (
  id         CHAR(36)      NOT NULL PRIMARY KEY,
  store_id   CHAR(36)      NOT NULL,
  product_id CHAR(36)      NOT NULL,
  url        VARCHAR(512)  NOT NULL,
  hash       VARCHAR(64)   NOT NULL,
  sort_order INT           NOT NULL DEFAULT 0,
  INDEX idx_product_photos_store_id (store_id),
  INDEX idx_product_photos_product_id (product_id),
  INDEX idx_product_photos_hash (hash),
  CONSTRAINT fk_product_photos_store   FOREIGN KEY (store_id)   REFERENCES stores(id)   ON DELETE CASCADE,
  CONSTRAINT fk_product_photos_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_videos (
  id             CHAR(36)      NOT NULL PRIMARY KEY,
  store_id       CHAR(36)      NOT NULL,
  product_id     CHAR(36)      NOT NULL,
  url            VARCHAR(512)  NOT NULL,
  thumbnail_url  VARCHAR(512)  NULL,
  INDEX idx_product_videos_store_id (store_id),
  INDEX idx_product_videos_product_id (product_id),
  CONSTRAINT fk_product_videos_store   FOREIGN KEY (store_id)   REFERENCES stores(id)   ON DELETE CASCADE,
  CONSTRAINT fk_product_videos_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE customers (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  store_id   CHAR(36)     NOT NULL,
  name       VARCHAR(255) NOT NULL,
  phone      VARCHAR(50)  NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_customers_store_id (store_id),
  CONSTRAINT fk_customers_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  store_id         CHAR(36)      NOT NULL,
  customer_id      CHAR(36)      NOT NULL,
  customer_name    VARCHAR(255)  NOT NULL,
  customer_phone   VARCHAR(50)   NULL,
  customer_address TEXT          NULL,
  total            DECIMAL(10,2) NOT NULL,
  status           ENUM('pending','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_store_id (store_id),
  INDEX idx_orders_customer_id (customer_id),
  INDEX idx_orders_status (status),
  INDEX idx_orders_created_at (created_at),
  CONSTRAINT fk_orders_store    FOREIGN KEY (store_id)    REFERENCES stores(id)    ON DELETE CASCADE,
  CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id         CHAR(36)      NOT NULL PRIMARY KEY,
  order_id   CHAR(36)      NOT NULL,
  product_id CHAR(36)      NULL,
  name       VARCHAR(255)  NOT NULL,
  price      DECIMAL(10,2) NOT NULL,
  quantity   INT           NOT NULL DEFAULT 1,
  INDEX idx_order_items_order_id (order_id),
  INDEX idx_order_items_product_id (product_id),
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coupons (
  id               CHAR(36)     NOT NULL PRIMARY KEY,
  store_id         CHAR(36)     NOT NULL,
  code             VARCHAR(100) NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  active           TINYINT(1)   NOT NULL DEFAULT 1,
  is_public        TINYINT(1)   NOT NULL DEFAULT 0,
  INDEX idx_coupons_store_id (store_id),
  INDEX idx_coupons_store_public (store_id, is_public, active),
  UNIQUE INDEX idx_coupons_store_code (store_id, code),
  CONSTRAINT fk_coupons_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart_items (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  store_id   CHAR(36)     NOT NULL,
  guest_id   VARCHAR(255) NOT NULL,
  product_id CHAR(36)     NOT NULL,
  quantity   INT          NOT NULL DEFAULT 1,
  INDEX idx_cart_items_store_id (store_id),
  INDEX idx_cart_items_guest_id (guest_id),
  INDEX idx_cart_items_product_id (product_id),
  INDEX idx_cart_items_store_guest (store_id, guest_id),
  CONSTRAINT fk_cart_items_store   FOREIGN KEY (store_id)   REFERENCES stores(id)   ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE wishlist_items (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  store_id   CHAR(36)     NOT NULL,
  guest_id   VARCHAR(255) NOT NULL,
  product_id CHAR(36)     NOT NULL,
  INDEX idx_wishlist_items_store_id (store_id),
  INDEX idx_wishlist_items_guest_id (guest_id),
  INDEX idx_wishlist_items_product_id (product_id),
  INDEX idx_wishlist_items_store_guest (store_id, guest_id),
  CONSTRAINT fk_wishlist_items_store   FOREIGN KEY (store_id)   REFERENCES stores(id)   ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id                  CHAR(36)      NOT NULL PRIMARY KEY,
  store_id            CHAR(36)      NOT NULL,
  plan_id             CHAR(36)      NOT NULL,
  reference           VARCHAR(20)   NOT NULL,
  amount              DECIMAL(10,2) NOT NULL,
  currency            VARCHAR(3)    NOT NULL DEFAULT 'AOA',
  duration_days       INT           NOT NULL DEFAULT 30,
  method              VARCHAR(50)   NOT NULL DEFAULT 'emis',
  status              ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  emis_token          VARCHAR(512)  NULL,
  emis_transaction_id VARCHAR(255)  NULL,
  raw_response        JSON          NULL,
  period_start        DATETIME      NULL,
  period_end          DATETIME      NULL,
  paid_at             DATETIME      NULL,
  created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_payments_reference (reference),
  INDEX idx_payments_store_id (store_id),
  INDEX idx_payments_plan_id (plan_id),
  INDEX idx_payments_status (status),
  INDEX idx_payments_store_plan_status (store_id, plan_id, status),
  CONSTRAINT fk_payments_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_plan  FOREIGN KEY (plan_id)  REFERENCES plans(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pending_signups (
  id                   CHAR(36)      NOT NULL PRIMARY KEY,
  reference            VARCHAR(20)   NOT NULL,
  payment_id           VARCHAR(100)  NOT NULL,
  email                VARCHAR(255)  NOT NULL,
  password_hash        VARCHAR(255)  NOT NULL,
  store_name           VARCHAR(255)  NOT NULL,
  slug                 VARCHAR(60)   NOT NULL,
  plan_id              CHAR(36)      NOT NULL,
  amount               DECIMAL(10,2) NOT NULL,
  currency             VARCHAR(3)    NOT NULL DEFAULT 'AOA',
  duration_days        INT           NOT NULL DEFAULT 30,
  status               ENUM('pending','paid','failed','cancelled','expired') NOT NULL DEFAULT 'pending',
  gpo_token            VARCHAR(512)  NULL,
  emis_transaction_id  VARCHAR(255)  NULL,
  raw_response         JSON          NULL,
  created_user_id      CHAR(36)      NULL,
  created_store_id     CHAR(36)      NULL,
  activated_at         DATETIME      NULL,
  created_at           DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_pending_signups_reference (reference),
  INDEX idx_pending_signups_email (email),
  INDEX idx_pending_signups_slug (slug),
  INDEX idx_pending_signups_status (status),
  INDEX idx_pending_signups_plan_id (plan_id),
  INDEX idx_pending_signups_created_user_id (created_user_id),
  INDEX idx_pending_signups_created_store_id (created_store_id),
  CONSTRAINT fk_pending_signups_plan  FOREIGN KEY (plan_id)          REFERENCES plans(id)  ON DELETE CASCADE,
  CONSTRAINT fk_pending_signups_user  FOREIGN KEY (created_user_id)  REFERENCES users(id)  ON DELETE SET NULL,
  CONSTRAINT fk_pending_signups_store FOREIGN KEY (created_store_id) REFERENCES stores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE ai_image_cache (
  id          INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  hash        VARCHAR(64)   NOT NULL,
  name        VARCHAR(255)  NOT NULL DEFAULT '',
  description TEXT          NULL,
  color       VARCHAR(100)  NOT NULL DEFAULT '',
  category    VARCHAR(255)  NOT NULL DEFAULT '',
  UNIQUE INDEX idx_ai_image_cache_hash (hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
