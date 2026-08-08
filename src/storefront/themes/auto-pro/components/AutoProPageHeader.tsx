// =============================================================================
// AutoProPageHeader — header compacto das páginas abertas do tema Auto Pro
// (racing/automotivo). Barra vermelha com faixa amarela (--sf-accent) inferior,
// tipografia display em maiúsculas e cantos quase retos.
// Regra central: consome apenas a StorefrontApi — nunca faz fetch.
// =============================================================================
import { ChevronLeft, Heart, ShoppingCart } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { StorefrontApi } from "../../../contract";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[11px] font-bold text-white ring-2 ring-[var(--sf-primary)]">
      {n}
    </span>
  );
}

export function AutoProPageHeader({ api }: { api: StorefrontApi }) {
  const { slug, navigate, store, cart, wishlist, setWishlistOpen } = api;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-[var(--sf-primary)] shadow-[var(--sf-shadow-md)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(`/s/${slug}`)}
          className="flex items-center gap-1.5 rounded-[var(--sf-radius-sm)] px-2 py-1.5 text-white transition-colors hover:bg-white/15"
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
          <span className="hidden font-display text-xs font-bold uppercase tracking-[0.14em] sm:inline">Voltar à loja</span>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="h-6 w-1.5 bg-[var(--sf-accent)]" aria-hidden />
          <div className="flex items-center gap-2">
            {store.logo_url ? (
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--sf-radius-sm)] bg-white font-bold text-[var(--sf-primary)]">
                {store.name[0]}
              </div>
            )}
            <span className="font-display text-[15px] font-extrabold uppercase tracking-[0.05em] text-white">{store.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWishlistOpen(true)}
            aria-label="Favoritos"
            className="relative rounded-[var(--sf-radius-sm)] p-2.5 text-white transition-colors hover:bg-white/15"
          >
            <Heart size={20} strokeWidth={1.7} />
            {wishlist.length > 0 && <CountBadge n={wishlist.length} />}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/s/${slug}`)}
            aria-label="Carrinho"
            className="relative rounded-[var(--sf-radius-sm)] p-2.5 text-white transition-colors hover:bg-white/15"
          >
            <ShoppingCart size={22} strokeWidth={1.7} />
            {cartCount > 0 && <CountBadge n={cartCount} />}
          </button>
        </div>
      </div>
      <div className="h-1 bg-[var(--sf-accent)]" aria-hidden />
    </header>
  );
}
