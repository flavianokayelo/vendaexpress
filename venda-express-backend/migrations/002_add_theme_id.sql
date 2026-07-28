-- Adicionar coluna theme_id à tabela stores
-- O valor 'standard' é o tema padrão para lojas existentes e novas

ALTER TABLE stores
  ADD COLUMN theme_id VARCHAR(60) NOT NULL DEFAULT 'standard' AFTER currency,
  ADD INDEX idx_stores_theme_id (theme_id);
