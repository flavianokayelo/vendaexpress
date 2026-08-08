// =============================================================================
// FreshMarketPageHeader — header compacto das páginas abertas do tema
// Fresh Market (mercearia). Barra flutuante verde bem redonda (--sf-radius-lg)
// com ponto laranja (--sf-accent) a remeter para o fresco do mercado.
// Regra central: consome apenas a StorefrontApi — nunca faz fetch.
// =============================================================================
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { StorefrontApi } from "../../../contract";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[11px] font-bold text-white ring-2 ring-[var(--sf-primary)]">
      {n}
    </span>
  );
}

export function FreshMarketPageHeader({ api }: { api: StorefrontApi }) {
  const { slug, navigate, store, cart, wishlist, setWishlistOpen } = api;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto max-w-6xl px-3 py-2 sm:px-4">
        <div className="flex items-center justify-between gap-3 rounded-[var(--sf-radius-lg)] bg-[var(--sf-primary)] px-3 py-2.5 shadow-[var(--sf-shadow-md)] sm:px-4">
          <button
            type="button"
            onClick={() => navigate(`/s/${slug}`)}
            className="flex items-center gap-2 rounded-full px-2 py-1.5 text-white transition-colors hover:bg-white/15"
          >
            <ArrowLeft size={18} />
            <span className="hidden font-display text-sm font-semibold sm:inline">Voltar</span>
          </button>

          <div className="flex min-w-0 flex-shrink-0 items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--sf-accent)] ring-2 ring-white/30" aria-hidden />
            {store.logo_url ? (
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--sf-radius-md)] bg-white font-bold text-[var(--sf-primary)]">
                {store.name[0]}
              </div>
            )}
            <span className="truncate font-display text-[15px] font-semibold text-white">{store.name}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              aria-label="Favoritos"
              className="relative rounded-full p-2.5 text-white transition-colors hover:bg-white/15"
            >
              <Heart size={20} strokeWidth={1.7} />
              {wishlist.length > 0 && <CountBadge n={wishlist.length} />}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/s/${slug}`)}
              aria-label="Carrinho"
              className="relative rounded-full p-2.5 text-white transition-colors hover:bg-white/15"
            >
              <ShoppingBag size={20} strokeWidth={1.7} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}