import { useEffect, useMemo, useState } from "react";
import { Store as StoreIcon } from "lucide-react";
import { api } from "../lib/api";
import type { Store, Product, Category, PublicCoupon } from "../lib/types";
import { Button } from "../components/ui/Button";
import { StorefrontHomeSkeleton } from "../components/ui/Skeleton";
import { CartProvider, useCart } from "../lib/cart";
import { WishlistProvider, useWishlist } from "../lib/wishlist";
import { StorefrontThemeProvider } from "../storefrontTheme/ThemeProvider";
import { resolveConfig } from "../storefrontTheme/resolveConfig";
import type { StorefrontApi } from "../storefront/contract";
import {
  FALLBACK_THEME_ID,
  registerTheme,
  resolveTheme,
} from "../storefront/engine/ThemeRegistry";
import { standardTheme } from "../storefront/themes/standard";
import { luxuryTheme } from "../storefront/themes/luxury";
import { minimalTheme } from "../storefront/themes/minimal";
import { fashionTheme } from "../storefront/themes/fashion";
import { electronicsTheme } from "../storefront/themes/electronics";
import { modernTheme } from "../storefront/themes/modern";
import { fashionLuxeTheme } from "../storefront/themes/fashion-luxe";
import { freshMarketTheme } from "../storefront/themes/fresh-market";
import { autoProTheme } from "../storefront/themes/auto-pro";
import { foodExpressTheme } from "../storefront/themes/food-express";
[
  standardTheme,
  luxuryTheme,
  minimalTheme,
  fashionTheme,
  electronicsTheme,
  modernTheme,
  fashionLuxeTheme,
  freshMarketTheme,
  autoProTheme,
  foodExpressTheme,
].forEach(registerTheme);

export function StorefrontPage({
  slug,
  navigate,
}: {
  slug: string;
  navigate: (to: string) => void;
}) {
  return (
    <CartProvider slug={slug}>
      <WishlistProvider slug={slug}>
        <StorefrontPageInner slug={slug} navigate={navigate} />
      </WishlistProvider>
    </CartProvider>
  );
}

function StorefrontPageInner({
  slug,
  navigate,
}: {
  slug: string;
  navigate: (to: string) => void;
}) {
  const cart = useCart();
  const wishlist = useWishlist();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publicCoupons, setPublicCoupons] = useState<PublicCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.storefront.get(slug);
        setStore(data.store);
        setProducts(data.products);
        setCategories(data.categories);
        setPublicCoupons(data.coupons ?? []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  const theme = useMemo(() => {
    const id = store?.theme_id ?? FALLBACK_THEME_ID;
    return resolveTheme(id);
  }, [store]);

  const apiValue: StorefrontApi | null = useMemo(() => {
    if (!store || !theme) return null;
    return {
      slug,
      navigate,
      store,
      products,
      categories,
      publicCoupons,
      currency: store.currency,
      cart: cart.cart,
      addToCart: cart.addToCart,
      clearCart: cart.clearCart,
      setCartOpen: cart.setCartOpen,
      wishlist: wishlist.wishlist,
      isWishlisted: wishlist.isWishlisted,
      toggleWishlist: wishlist.toggleWishlist,
      setWishlistOpen: wishlist.setWishlistOpen,
      validateCoupon: (code) => api.storefront.validateCoupon(slug, code),
      placeOrder: (order) => api.storefront.placeOrder(slug, order),
    };
  }, [store, theme, slug, navigate, products, categories, publicCoupons, cart, wishlist]);

  if (loading) return <StorefrontHomeSkeleton />;

  if (notFound || !store || !theme || !apiValue) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
          <StoreIcon size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          Loja não encontrada
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          A loja "{slug}" não existe ou foi removida.
        </p>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => navigate("/")}
        >
          Voltar ao início
        </Button>
      </div>
    );
  }

  const resolvedConfig = useMemo(
    () => resolveConfig(store?.theme_id, store),
    [store],
  );
  const Home = theme.pages.Home;

  return (
    <StorefrontThemeProvider theme={resolvedConfig} className="min-h-screen bg-[var(--sf-surface-muted)]">
      <Home {...apiValue} />
    </StorefrontThemeProvider>
  );
}
