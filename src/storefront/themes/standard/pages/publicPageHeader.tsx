// Header partilhado das páginas abertas (produto, categoria, pesquisa).
// Consome apenas a StorefrontApi — nunca faz fetch.
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { StorefrontApi } from "../../../contract";

export function PublicPageHeader({ api }: { api: StorefrontApi }) {
  const { slug, navigate, store, cart, wishlist, setWishlistOpen } = api;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-[var(--sf-primary)] shadow-[var(--sf-shadow-md)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          onClick={() => navigate(`/s/${slug}`)}
          className="flex items-center gap-2 rounded-[var(--sf-radius-pill)] px-2 py-1.5 text-white transition-colors hover:bg-white/15"
        >
          <ArrowLeft size={18} />
          <span className="hidden font-display text-sm font-semibold sm:inline">Voltar à loja</span>
        </button>
        <div className="flex items-center gap-3">
          {store.logo_url ? (
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white p-1 ring-2 ring-white/25">
              <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
            </span>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-white font-bold text-[var(--sf-primary)]">
              {store.name[0]}
            </div>
          )}
          <span className="font-display text-[15px] font-semibold text-white">{store.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWishlistOpen(true)}
            className="relative rounded-[var(--sf-radius-pill)] p-2.5 text-white transition-colors hover:bg-white/15"
          >
            <Heart size={20} strokeWidth={1.7} />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[11px] font-bold text-white">
                {wishlist.length}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate(`/s/${slug}`)}
            className="relative rounded-[var(--sf-radius-pill)] p-2.5 text-white transition-colors hover:bg-white/15"
          >
            <ShoppingCart size={22} strokeWidth={1.7} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[11px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}