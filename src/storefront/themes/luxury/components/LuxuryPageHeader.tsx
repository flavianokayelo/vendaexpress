// =============================================================================
// LuxuryPageHeader — header compacto das páginas abertas do tema Luxury
// (boutique premium). Fundo navy escuro, linha fina de ouro (--sf-accent),
// tipografia display e "Voltar" em caixa alta com tracking largo.
// Regra central: consome apenas a StorefrontApi — nunca faz fetch.
// =============================================================================
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { StorefrontApi } from "../../../contract";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sf-accent)] px-1 text-[11px] font-bold leading-none text-[var(--sf-primary)] ring-2 ring-[var(--sf-primary)]">
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function LuxuryPageHeader({ api }: { api: StorefrontApi }) {
  const { slug, navigate, store, cart, wishlist, setWishlistOpen } = api;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[var(--sf-primary)] shadow-[var(--sf-shadow-md)]">
      <div className="h-px bg-[var(--sf-accent)]" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(`/s/${slug}`)}
          className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors hover:text-white"
        >
          <ArrowLeft size={15} strokeWidth={1.8} />
          <span className="underline decoration-[var(--sf-accent)] underline-offset-4">Voltar</span>
        </button>

        <div className="flex min-w-0 flex-shrink-0 items-center justify-center text-center">
          {store.logo_url ? (
            <span className="flex h-8 items-center justify-center px-1">
              <img
                src={resolveMediaUrl(store.logo_url) ?? ""}
                alt={store.name}
                className="h-full w-auto max-w-[120px] object-contain sm:max-w-[150px]"
              />
            </span>
          ) : (
            <span className="block truncate font-display text-[15px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[17px]">
              {store.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setWishlistOpen(true)}
            aria-label="Favoritos"
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-white transition-colors hover:text-[var(--sf-accent)]"
          >
            <Heart size={19} strokeWidth={1.5} />
            {wishlist.length > 0 && <CountBadge n={wishlist.length} />}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/s/${slug}`)}
            aria-label="Carrinho"
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-white transition-colors hover:text-[var(--sf-accent)]"
          >
            <ShoppingBag size={19} strokeWidth={1.5} />
            {cartCount > 0 && <CountBadge n={cartCount} />}
          </button>
        </div>
      </div>
    </header>
  );
}
