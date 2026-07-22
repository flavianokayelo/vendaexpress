import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Product } from './types';
import { getGuestId } from './guestId';
import { api } from './api';

export type CartItem = { product: Product; quantity: number };

type CartContextValue = {
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  updateQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(slug: string) {
  return `ve_cart_${slug}`;
}

function loadCart(slug: string): CartItem[] {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Carrinho: local-first (instantâneo, funciona offline) + sincronizado em segundo
// plano com o backend, associado a um guest_id anónimo por dispositivo. Isto dá
// ao lojista visibilidade sobre carrinhos, sem precisar de login do cliente.
export function CartProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const guestId = useRef(getGuestId());
  const [cart, setCart] = useState<CartItem[]>(() => loadCart(slug));
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // 1) Ao montar, tenta trazer o carrinho do servidor. Se o carrinho local já
  // tiver itens, esses ganham prioridade (é o que o utilizador está a ver agora).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const server = await api.storefront.getCart(slug, guestId.current);
        if (!cancelled) {
          setCart((prev) => (prev.length === 0 && server.length > 0)
            ? server.map((i) => ({ product: i.product, quantity: i.quantity }))
            : prev);
        }
      } catch {
        // backend indisponível — segue só com o carrinho local
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(slug), JSON.stringify(cart));
    } catch {
      // localStorage indisponível (ex: modo privado)
    }
  }, [cart, slug]);

  // 2) Sempre que o carrinho muda, sincroniza com o servidor (com debounce,
  // para não disparar um pedido a cada clique). Só depois da hidratação inicial,
  // para não sobrescrever o servidor com um carrinho vazio antes de tempo.
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      api.storefront
        .syncCart(slug, guestId.current, cart.map((i) => ({ product_id: i.product.id, quantity: i.quantity })))
        .catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [cart, hydrated, slug]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const value = useMemo(
    () => ({ cart, cartOpen, setCartOpen, addToCart, updateQty, removeFromCart, clearCart }),
    [cart, cartOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart precisa ser usado dentro de um <CartProvider>');
  return ctx;
}