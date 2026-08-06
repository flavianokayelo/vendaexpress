// Header do tema Food Express — barra flutuante laranja em pill (--sf-radius-pill)
// com ponto verde (--sf-accent) como marcador de entrega. Busca simples e
// carrinho sempre acessível, para pedido imediato.
import { Heart, Search, ShoppingCart } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { Store, Category } from "../../../../lib/types";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[11px] font-bold text-white ring-2 ring-[var(--sf-primary)]">
      {n > 9 ? "9+" : n}
    </span>
  );
}

export function Header({
  store,
  search,
  onSearchChange,
  cartCount,
  onCartClick,
  wishlistCount,
  onWishlistClick,
  onHelpClick,
}: {
  store: Store;
  search: string;
  onSearchChange: (v: string) => void;
  cartCount: number;
  onCartClick: () => void;
  wishlistCount: number;
  onWishlistClick: () => void;
  categories?: Category[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
  onHelpClick?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 bg-[var(--sf-surface)]/95 py-2 backdrop-blur-sm">
      <div className="mx-auto max-w-[1280px] px-3 sm:px-4">
        <div className="flex items-center justify-between gap-3 rounded-[var(--sf-radius-pill)] bg-[var(--sf-primary)] px-3 py-2.5 shadow-[var(--sf-shadow-md)] sm:px-4">
          {/* logo */}
          <button type="button" onClick={onHelpClick} className="flex min-w-0 flex-shrink-0 items-center gap-2 text-left">
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[var(--sf-accent)] ring-2 ring-white/30" aria-hidden />
            {store.logo_url ? (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1">
                <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
              </span>
            ) : (
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white font-display text-[15px] font-bold text-[var(--sf-primary)]">
                {store.name[0] || "E"}
              </span>
            )}
            <span className="hidden truncate font-display text-[16px] font-semibold text-white sm:block">{store.name}</span>
          </button>

          {/* busca simples */}
          <form onSubmit={(e) => e.preventDefault()} className="min-w-0 flex-1">
            <div className="group flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-2 ring-1 ring-white/25 transition-colors focus-within:bg-white focus-within:ring-[var(--sf-accent)]/50">
              <Search size={17} className="flex-shrink-0 text-white transition-colors group-focus-within:text-[var(--sf-primary)]" />
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Pesquisar no menu…"
                aria-label="Pesquisar no menu"
                className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/70 group-focus-within:text-slate-900 group-focus-within:placeholder:text-slate-400"
              />
            </div>
          </form>

          {/* ícones */}
          <div className="flex min-w-0 flex-shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={onWishlistClick}
              aria-label="Favoritos"
              className="relative rounded-full p-2.5 text-white transition-colors hover:bg-white/15"
            >
              <Heart size={20} strokeWidth={1.7} />
              {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
            </button>
            <button
              type="button"
              onClick={onCartClick}
              aria-label="Carrinho"
              className="relative rounded-full bg-[var(--sf-accent)] p-2.5 text-white transition-colors hover:brightness-95"
            >
              <ShoppingCart size={20} strokeWidth={1.7} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
