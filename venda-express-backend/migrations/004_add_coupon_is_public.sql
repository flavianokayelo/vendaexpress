-- Permite ao lojista marcar um cupão para aparecer publicamente na loja
-- (faixa de vouchers na storefront), em vez de só funcionar por código digitado.

ALTER TABLE coupons
  ADD COLUMN is_public TINYINT(1) NOT NULL DEFAULT 0 AFTER active,
  ADD INDEX idx_coupons_store_public (store_id, is_public, active);
