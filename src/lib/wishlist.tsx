import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Product } from './types';
import { getGuestId } from './guestId';
import { api } from './api';

type WishlistContextValue = {
  wishlist: Product[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  wishlistOpen: boolean;
  setWishlistOpen: (open: boolean) => void;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

function storageKey(slug: string) {
  return `ve_wishlist_${slug}`;
}

export function WishlistProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const guestId = useRef(getGuestId());
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Carrega o que já estava guardado localmente
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(slug));
      setWishlist(raw ? JSON.parse(raw) : []);
    } catch {
      setWishlist([]);
    }
  }, [slug]);

  // Tenta trazer do servidor; se o local estiver vazio, adota o do servidor
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const server = await api.storefront.getWishlist(slug, guestId.current);
        if (!cancelled) {
          setWishlist((prev) => (prev.length === 0 && server.length > 0) ? server : prev);
        }
      } catch {
        // backend indisponível — segue só com o local
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();
    return () => { cancelled = true; };
     
  }, [slug]);

  useEffect(() => {
    localStorage.setItem(storageKey(slug), JSON.stringify(wishlist));
  }, [wishlist, slug]);

  // Sincroniza com o backend (debounced), só depois da hidratação inicial
  useEffect(() => {
    if (!hydrated) return;
    const t = setTimeout(() => {
      api.storefront
        .syncWishlist(slug, guestId.current, wishlist.map((p) => p.id))
        .catch(() => {});
    }, 800);
    return () => clearTimeout(t);
  }, [wishlist, hydrated, slug]);

  const isWishlisted = (productId: string) => wishlist.some((p) => p.id === productId);

  const toggleWishlist = (product: Product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]
    );
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isWishlisted, toggleWishlist, wishlistOpen, setWishlistOpen }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}