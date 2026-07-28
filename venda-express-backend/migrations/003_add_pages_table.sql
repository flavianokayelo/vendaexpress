CREATE TABLE IF NOT EXISTS pages (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  store_id   CHAR(36)     NOT NULL,
  title      VARCHAR(255) NOT NULL,
  slug       VARCHAR(255) NOT NULL,
  template   VARCHAR(60)  NOT NULL DEFAULT 'blank',
  status     ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  sections   JSON         NULL,
  meta       JSON         NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pages_store_id (store_id),
  UNIQUE INDEX idx_pages_store_slug (store_id, slug),
  CONSTRAINT fk_pages_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
