// Header do tema Fashion — boutique editorial.
//
// Pele fixa (não muda com a loja): barra de anúncio preta, logótipo centralizado
// com tipografia display, navegação de categorias em maiúsculas com letter-spacing
// largo e uma faixa fina de pesquisa. O accent (contagens, hover) usa --sf-primary,
// que É controlado pela cor da loja (store.theme_primary).
import { Heart, Search, ShoppingBag } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { Store, Category } from "../../../../lib/types";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sf-primary)] px-1 text-[11px] font-bold leading-none text-white ring-2 ring-[var(--sf-surface)]">
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
    <header className="sticky top-0 z-40 bg-[var(--sf-surface)] shadow-[var(--sf-shadow-sm)]">
      {/* barra de anúncio */}
      <div className="bg-[var(--sf-ink)] text-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-4 px-4 text-[11px] font-medium uppercase tracking-[0.18em] sm:text-[11.5px]" style={{ height: 32 }}>
          <span className="hidden sm:inline">Entrega grátis em Luanda</span>
          <span className="hidden h-3 w-px bg-white/30 sm:block" />
          <span>Nova coleção — chegou à loja</span>
          {onHelpClick && (
            <button type="button" onClick={onHelpClick} className="hidden text-white/80 transition-colors hover:text-white lg:block">
              Ajuda &amp; trocas
            </button>
          )}
        </div>
      </div>

      {/* cabeçalho principal — logo centralizado */}
      <div className="border-b border-[var(--sf-line)]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3.5 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              onClick={onWishlistClick}
              aria-label="Favoritos"
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-[var(--sf-ink)] transition-colors hover:text-[var(--sf-primary)]"
            >
              <Heart size={20} strokeWidth={1.6} />
              {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
            </button>
          </div>

          <div className="min-w-0 flex-shrink-0 text-center">
            {store.logo_url ? (
              <span className="flex h-9 items-center justify-center px-1 sm:h-10">
                <img
                  src={resolveMediaUrl(store.logo_url) ?? ""}
                  alt={store.name}
                  className="h-full w-auto max-w-[140px] object-contain sm:max-w-[180px]"
                />
              </span>
            ) : (
              <span className="block truncate font-display text-[20px] font-extrabold uppercase tracking-[0.04em] text-[var(--sf-ink)] sm:text-[26px]">
                {store.name}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="hidden h-9 w-[160px] items-center overflow-hidden border-b border-[var(--sf-line)] focus-within:border-[var(--sf-ink)] lg:flex"
            >
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Pesquisar"
                aria-label="Pesquisar"
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-[12px] uppercase tracking-[0.08em] text-[var(--sf-ink)] outline-none placeholder:text-[var(--sf-ink-secondary)]"
              />
              <button type="submit" aria-label="Pesquisar" className="flex h-full flex-shrink-0 items-center justify-center pl-2 text-[var(--sf-ink)]">
                <Search size={16} strokeWidth={1.6} />
              </button>
            </form>
            <button
              type="button"
              onClick={onCartClick}
              aria-label="Carrinho"
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-[var(--sf-ink)] transition-colors hover:text-[var(--sf-primary)]"
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>

        {/* navegação de categorias */}
        {categories && categories.length > 0 && onSelectCategory && (
          <nav className="border-t border-[var(--sf-line)]">
            <div className="no-scrollbar mx-auto flex max-w-[1280px] items-center gap-6 overflow-x-auto px-4 py-2.5">
              <button
                type="button"
                onClick={() => onSelectCategory("")}
                className={`flex-shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  selectedCategoryId === "" ? "text-[var(--sf-ink)] underline underline-offset-4 decoration-[var(--sf-primary)] decoration-2" : "text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
                }`}
              >
                Todas
              </button>
              {categories.slice(0, 10).map((c) => {
                const active = selectedCategoryId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelectCategory(c.id)}
                    className={`flex-shrink-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                      active ? "text-[var(--sf-ink)] underline underline-offset-4 decoration-[var(--sf-primary)] decoration-2" : "text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]"
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
