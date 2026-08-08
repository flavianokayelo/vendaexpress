import type { Product } from '../types';
import { readJson, writeJson, removeRaw, keyFor, type StorageScope } from './storage';

export type CartItem = { product: Pick<Product, 'id'>; quantity: number };

const SCOPE: StorageScope = 'local';

function cartKey(slug: string) {
  return keyFor('cart', slug);
}

export function getCart(slug: string): CartItem[] {
  const raw = readJson<CartItem[] | null>(SCOPE, cartKey(slug), null);
  return Array.isArray(raw) ? raw : [];
}

export function setCart(slug: string, items: CartItem[]): void {
  writeJson(SCOPE, cartKey(slug), items);
}

export function clearCart(slug: string): void {
  removeRaw(SCOPE, cartKey(slug));
}

export function hasCart(slug: string): boolean {
  const items = getCart(slug);
  return items.length > 0;
}

export function cartCount(slug: string): number {
  return getCart(slug).reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(slug: string, product: Product, quantity = 1): CartItem[] {
  const items = getCart(slug);
  const next =
    items.find((i) => i.product.id === product.id) != null
      ? items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        )
      : [...items, { product: { id: product.id }, quantity }];
  setCart(slug, next);
  return next;
}