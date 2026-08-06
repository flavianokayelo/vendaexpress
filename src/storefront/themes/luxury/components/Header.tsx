// Header do tema Luxury — boutique premium.
//
// Pele fixa (não muda com a loja): fundo navy profundo (--sf-primary), linha fina
// de ouro no topo, logótipo centralizado, navegação de categorias em maiúsculas
// com tracking largo e sublinhado dourado no ativo, e uma pesquisa de underline.
// Discreto e editorial — sem sombras fortes nem ruído.
import { Heart, Search, ShoppingBag } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import type { Store, Category } from "../../../../lib/types";

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--sf-accent)] px-1 text-[11px] font-bold leading-none text-[var(--sf-primary)] ring-2 ring-[var(--sf-primary)]">
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
    <header className="sticky top-0 z-40 bg-[var(--sf-primary)]">
      <div className="h-px bg-[var(--sf-accent)]" aria-hidden />
      {/* barra de anúncio */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-4 px-4 text-[10.5px] font-medium uppercase tracking-[0.2em] text-white/60" style={{ height: 32 }}>
          <span className="hidden sm:inline">Envio cuidadoso e seguro</span>
          <span className="hidden h-3 w-px bg-white/20 sm:block" />
          <span>Seleção curada para si</span>
          {onHelpClick && (
            <button type="button" onClick={onHelpClick} className="hidden text-white/50 transition-colors hover:text-[var(--sf-accent)] lg:block">
              Atendimento
            </button>
          )}
        </div>
      </div>

      {/* cabeçalho principal — logo centralizado */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-3.5 sm:py-4">
          <div className="flex min-w-0 flex-1 items-center">
            <button
              type="button"
              onClick={onWishlistClick}
              aria-label="Favoritos"
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-white/80 transition-colors hover:text-[var(--sf-accent)]"
            >
              <Heart size={19} strokeWidth={1.5} />
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
              <span className="block truncate font-display text-[19px] font-semibold uppercase tracking-[0.14em] text-white sm:text-[23px]">
                {store.name}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="hidden h-9 w-[150px] items-center overflow-hidden border-b border-white/25 focus-within:border-[var(--sf-accent)] lg:flex"
            >
              <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Pesquisar"
                aria-label="Pesquisar"
                className="h-full min-w-0 flex-1 border-0 bg-transparent text-[11px] uppercase tracking-[0.1em] text-white outline-none placeholder:text-white/40"
              />
              <button type="submit" aria-label="Pesquisar" className="flex h-full flex-shrink-0 items-center justify-center pl-2 text-white/60 transition-colors hover:text-[var(--sf-accent)]">
                <Search size={15} strokeWidth={1.5} />
              </button>
            </form>
            <button
              type="button"
              onClick={onCartClick}
              aria-label="Carrinho"
              className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center text-white/80 transition-colors hover:text-[var(--sf-accent)]"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>

        {/* navegação de categorias */}
        {categories && categories.length > 0 && onSelectCategory && (
          <nav className="border-t border-white/10">
            <div className="no-scrollbar mx-auto flex max-w-[1280px] items-center gap-7 overflow-x-auto px-4 py-2.5">
              <button
                type="button"
                onClick={() => onSelectCategory("")}
                className={`flex-shrink-0 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                  selectedCategoryId === "" ? "text-white shadow-[inset_0_-1.5px_0_var(--sf-accent)]" : "text-white/55 hover:text-white"
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
                    className={`flex-shrink-0 whitespace-nowrap text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                      active ? "text-white shadow-[inset_0_-1.5px_0_var(--sf-accent)]" : "text-white/55 hover:text-white"
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
