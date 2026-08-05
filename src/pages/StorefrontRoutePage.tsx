// =============================================================================
// StorefrontRoutePage — wrapper partilhado para as PÁGINAS ABERTAS
// (product / category / search). Faz o mesmo "set up" da StorefrontPage
// (providers + fetch da loja + construção da StorefrontApi), injeta o contexto
// de rota e delega o render da PÁGINA ao tema via getThemePage(id, kind).
//
// O tema NUNCA faz fetch: recebe store + products + categories + route e
// deriva tudo sozinho. O wrapper é o único ponto que toca a API.
// =============================================================================
import { useEffect, useMemo, useState } from "react";
import { Store as StoreIcon } from "lucide-react";
import { api } from "../lib/api";
import type { Store, Product, Category, PublicCoupon } from "../lib/types";
import type { StorefrontRoute } from "../storefront/contract";
import type { ThemePages } from "../storefront/contract";
import { Button } from "../components/ui/Button";
import { CartProvider, useCart } from "../lib/cart";
import { WishlistProvider, useWishlist } from "../lib/wishlist";
import { StorefrontThemeProvider } from "../storefrontTheme/ThemeProvider";
import { resolveConfig } from "../storefrontTheme/resolveConfig";
import type { StorefrontApi } from "../storefront/contract";
import { FALLBACK_THEME_ID, resolveTheme, getThemePage } from "../storefront/engine/ThemeRegistry";
import { registerThemes } from "../storefront/engine/registerThemes";
import { ProductDetailSkeleton } from "../components/ui/Skeleton";

registerThemes();

// StorefrontRoute.kind usa minúsculas; ThemePages usa chaves capitalizadas.
const ROUTE_PAGE_KIND: Record<StorefrontRoute["kind"], keyof ThemePages> = {
  home: "Home",
  product: "Product",
  category: "Category",
  search: "Search",
};

export function StorefrontRoutePage({
  slug,
  navigate,
  route,
  loading,
}: {
  slug: string;
  navigate: (to: string) => void;
  route: StorefrontRoute;
  loading?: React.ReactNode;
}) {
  return (
    <CartProvider slug={slug}>
      <WishlistProvider slug={slug}>
        <StorefrontRoutePageInner slug={slug} navigate={navigate} route={route} loading={loading} />
      </WishlistProvider>
    </CartProvider>
  );
}

function StorefrontRoutePageInner({
  slug,
  navigate,
  route,
  loading,
}: {
  slug: string;
  navigate: (to: string) => void;
  route: StorefrontRoute;
  loading?: React.ReactNode;
}) {
  const cart = useCart();
  const wishlist = useWishlist();

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publicCoupons, setPublicCoupons] = useState<PublicCoupon[]>([]);
  const [loadingState, setLoadingState] = useState(true);
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
        setLoadingState(false);
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
      route,
    };
  }, [store, theme, slug, navigate, products, categories, publicCoupons, cart, wishlist, route]);

  const resolvedConfig = useMemo(() => resolveConfig(store?.theme_id, store), [store]);

  if (loadingState) return loading ?? <ProductDetailSkeleton />;

  if (notFound || !store || !theme || !apiValue) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-200 text-slate-400">
          <StoreIcon size={28} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Loja não encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">A loja "{slug}" não existe ou foi removida.</p>
        <Button className="mt-6" variant="outline" onClick={() => navigate("/")}>
          Voltar ao início
        </Button>
      </div>
    );
  }

  const Page = getThemePage(theme.id, ROUTE_PAGE_KIND[route.kind]);

  return (
    <StorefrontThemeProvider theme={resolvedConfig} className="min-h-screen bg-[var(--sf-surface-muted)]">
      {Page ? <Page {...apiValue} /> : null}
    </StorefrontThemeProvider>
  );
}