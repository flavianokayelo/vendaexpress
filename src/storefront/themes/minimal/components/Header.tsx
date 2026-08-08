// Header do tema Minimal — reduzido e funcional.
//
// Pele fixa: barra preta (--sf-primary) com cantos totalmente retos, logótipo à
// esquerda (initial em caixa branca), pesquisa simples de borda reta e ícones à
// direita. Sem ornamento — cada elemento justifica a existência.
import { Heart, Search, ShoppingBag } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { Store, Category } from "../../../../lib/types";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold leading-none text-black ring-2 ring-[var(--sf-primary)]">
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
  categories,
  selectedCategoryId = "",
  onSelectCategory,
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
    <header className="sticky top-0 z-40 border-b border-black bg-[var(--sf-primary)]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3">
        {/* logo à esquerda */}
        <div className="flex min-w-0 flex-shrink-0 items-center gap-2.5">
          {store.logo_url ? (
            <button type="button" onClick={onHelpClick} aria-label="Início" className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden">
              <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
            </button>
          ) : (
            <button type="button" onClick={onHelpClick} aria-label={store.name} className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-white font-display text-[16px] font-bold text-black">
              {store.name[0] || "L"}
            </button>
          )}
          {!store.logo_url && (
            <span className="hidden truncate font-display text-[15px] font-medium tracking-wide text-white sm:block">
              {store.name}
            </span>
          )}
        </div>

        {/* pesquisa */}
        <form onSubmit={(e) => e.preventDefault()} className="hidden min-w-0 flex-1 items-stretch border border-white/25 bg-white/5 focus-within:border-white md:flex">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Pesquisar produtos"
            aria-label="Pesquisar"
            className="h-9 min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-white/40"
          />
          <button type="submit" aria-label="Pesquisar" className="flex h-9 w-9 flex-shrink-0 items-center justify-center text-white/70 transition-colors hover:text-white">
            <Search size={16} strokeWidth={1.7} />
          </button>
        </form>

        {/* ícones */}
        <div className="flex min-w-0 flex-shrink-0 items-center">
          <button
            type="button"
            onClick={onWishlistClick}
            aria-label="Favoritos"
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-white transition-colors hover:bg-white/10"
          >
            <Heart size={19} strokeWidth={1.7} />
            {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
          </button>
          <button
            type="button"
            onClick={onCartClick}
            aria-label="Carrinho"
            className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-white transition-colors hover:bg-white/10"
          >
            <ShoppingBag size={19} strokeWidth={1.7} />
            {cartCount > 0 && <CountBadge n={cartCount} />}
          </button>
        </div>
      </div>

      {/* navegação de categorias */}
      {categories && categories.length > 0 && onSelectCategory && (
        <nav className="border-t border-white/10">
          <div className="no-scrollbar mx-auto flex max-w-[1280px] items-center gap-5 overflow-x-auto px-4 py-2">
            <button
              type="button"
              onClick={() => onSelectCategory("")}
              className={`flex-shrink-0 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
                selectedCategoryId === "" ? "text-white" : "text-white/50 hover:text-white"
              }`}
            >
              Todas
            </button>
            {categories.slice(0, 10).map((c) => {
              const active = selectedCategoryId === c.id;
              return (
                <span key={c.id} className="flex items-center gap-5">
                  <span aria-hidden className="h-3 w-px bg-white/15" />
                  <button
                    type="button"
                    onClick={() => onSelectCategory(c.id)}
                    className={`flex-shrink-0 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.14em] transition-colors ${
                      active ? "text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    {c.name}
                  </button>
                </span>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
