// =============================================================================
// MinimalPageHeader — header compacto das páginas abertas do tema Minimal
// (design limpo). Barra preta monocromática com cantos totalmente retos
// (radius 0), separadores brancos e tipografia display discreta.
// Regra central: consome apenas a StorefrontApi — nunca faz fetch.
// =============================================================================
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { StorefrontApi } from "../../../contract";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold leading-none text-black ring-2 ring-[var(--sf-primary)]">
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function MinimalPageHeader({ api }: { api: StorefrontApi }) {
  const { slug, navigate, store, cart, wishlist, setWishlistOpen } = api;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-30 border-b border-black bg-[var(--sf-primary)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(`/s/${slug}`)}
          className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/80 transition-colors hover:text-white"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          <span className="hidden sm:inline">Voltar à loja</span>
        </button>

        <div className="flex min-w-0 flex-shrink-0 items-center gap-3">
          <span className="hidden h-4 w-px bg-white/30 sm:block" aria-hidden />
          {store.logo_url ? (
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden bg-white p-1">
              <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
            </span>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center bg-white font-bold text-black">
              {store.name[0]}
            </div>
          )}
          <span className="truncate font-display text-[15px] font-medium tracking-wide text-white">{store.name}</span>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setWishlistOpen(true)}
            aria-label="Favoritos"
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-white transition-colors hover:bg-white/10"
          >
            <Heart size={19} strokeWidth={1.7} />
            {wishlist.length > 0 && <CountBadge n={wishlist.length} />}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/s/${slug}`)}
            aria-label="Carrinho"
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-white transition-colors hover:bg-white/10"
          >
            <ShoppingCart size={20} strokeWidth={1.7} />
            {cartCount > 0 && <CountBadge n={cartCount} />}
          </button>
        </div>
      </div>
    </header>
  );
}
