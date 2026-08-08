// =============================================================================
// ElectronicsPageHeader — header compacto das páginas abertas do tema
// Electronics (tech). Barra azul primária com top stripe ciano (--sf-accent)
// e barra de pesquisa funcional (navega para a página de pesquisa da loja).
// Regra central: consome apenas a StorefrontApi — nunca faz fetch.
// =============================================================================
import { useState, type FormEvent } from "react";
import { ArrowLeft, Heart, Search, ShoppingCart } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { StorefrontApi } from "../../../contract";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[11px] font-bold text-white ring-2 ring-[var(--sf-primary)]">
      {n}
    </span>
  );
}

export function ElectronicsPageHeader({ api }: { api: StorefrontApi }) {
  const { slug, navigate, store, cart, wishlist, setWishlistOpen } = api;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const [q, setQ] = useState("");

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    const t = q.trim();
    if (t) navigate(`/s/${slug}/search?q=${encodeURIComponent(t)}`);
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--sf-primary)] shadow-[var(--sf-shadow-md)]">
      <div className="h-[3px] bg-[var(--sf-accent)]" aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(`/s/${slug}`)}
          className="flex items-center gap-2 rounded-[var(--sf-radius-pill)] px-2 py-1.5 text-white transition-colors hover:bg-white/15"
        >
          <ArrowLeft size={18} />
          <span className="hidden font-display text-sm font-semibold sm:inline">Voltar à loja</span>
        </button>

        <form onSubmit={submitSearch} className="hidden max-w-xs flex-1 md:block">
          <div className="group flex items-center gap-2 rounded-[var(--sf-radius-pill)] bg-white/15 px-3 py-2 ring-1 ring-white/25 transition-colors focus-within:bg-white focus-within:ring-[var(--sf-primary)]/40">
            <Search size={16} className="text-white transition-colors group-focus-within:text-[var(--sf-primary)]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Pesquisar na loja…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/70 group-focus-within:text-slate-900 group-focus-within:placeholder:text-slate-400"
            />
          </div>
        </form>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            {store.logo_url ? (
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-[var(--sf-radius-md)] bg-white font-bold text-[var(--sf-primary)]">
                {store.name[0]}
              </div>
            )}
            <span className="font-display text-[15px] font-semibold text-white">{store.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              aria-label="Favoritos"
              className="relative rounded-[var(--sf-radius-pill)] p-2.5 text-white transition-colors hover:bg-white/15"
            >
              <Heart size={20} strokeWidth={1.7} />
              {wishlist.length > 0 && <CountBadge n={wishlist.length} />}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/s/${slug}`)}
              aria-label="Carrinho"
              className="relative rounded-[var(--sf-radius-pill)] p-2.5 text-white transition-colors hover:bg-white/15"
            >
              <ShoppingCart size={22} strokeWidth={1.7} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
