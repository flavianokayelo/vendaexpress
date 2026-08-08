// Header do tema Auto Pro — racing/automotivo. Barra vermelha (--sf-primary)
// com faixa amarela (--sf-accent), tipografia display em maiúsculas e navegação
// por peça robusta. Busca em destaque para encontrAR peças rapidamente.
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
    <header className="sticky top-0 z-40 bg-[var(--sf-primary)] shadow-[var(--sf-shadow-md)]">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-3">
        {/* logo */}
        <button type="button" onClick={onHelpClick} className="flex min-w-0 flex-shrink-0 items-center gap-2.5 text-left">
          <span className="h-8 w-1.5 flex-shrink-0 bg-[var(--sf-accent)]" aria-hidden />
          {store.logo_url ? (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden">
              <img src={resolveMediaUrl(store.logo_url) ?? ""} alt={store.name} className="h-full w-full object-contain" />
            </span>
          ) : (
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[var(--sf-radius-sm)] bg-white font-display text-[15px] font-extrabold text-[var(--sf-primary)]">
              {store.name[0] || "A"}
            </span>
          )}
          <span className="hidden truncate font-display text-[16px] font-extrabold uppercase tracking-[0.05em] text-white sm:block">
            {store.name}
          </span>
        </button>

        {/* pesquisa */}
        <form onSubmit={(e) => e.preventDefault()} className="min-w-0 flex-1">
          <div className="group flex items-center gap-2 rounded-[var(--sf-radius-sm)] border border-white/25 bg-white/10 px-3 py-2.5 transition-colors focus-within:border-[var(--sf-accent)] focus-within:bg-white/15">
            <Search size={17} className="flex-shrink-0 text-white/80 transition-colors group-focus-within:text-[var(--sf-accent)]" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pesquisar peças…"
              aria-label="Pesquisar peças"
              className="w-full bg-transparent text-[13px] text-white outline-none placeholder:text-white/60"
            />
          </div>
        </form>

        {/* ícones */}
        <div className="flex min-w-0 flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onWishlistClick}
            aria-label="Favoritos"
            className="relative rounded-[var(--sf-radius-sm)] p-2.5 text-white transition-colors hover:bg-white/15"
          >
            <Heart size={20} strokeWidth={1.7} />
            {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
          </button>
          <button
            type="button"
            onClick={onCartClick}
            aria-label="Carrinho"
            className="relative rounded-[var(--sf-radius-sm)] p-2.5 text-white transition-colors hover:bg-white/15"
          >
            <ShoppingCart size={21} strokeWidth={1.7} />
            {cartCount > 0 && <CountBadge n={cartCount} />}
          </button>
        </div>
      </div>

      {/* navegação de categorias por tipo de peça */}
      {categories && categories.length > 0 && onSelectCategory && (
        <nav className="border-t border-white/10">
          <div className="no-scrollbar mx-auto flex max-w-[1280px] items-center gap-1 overflow-x-auto px-4 py-2">
            <button
              type="button"
              onClick={() => onSelectCategory("")}
              className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                selectedCategoryId === ""
                  ? "bg-[var(--sf-accent)] text-[var(--sf-ink)]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              Todas
            </button>
            {categories.slice(0, 12).map((c) => {
              const active = selectedCategoryId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectCategory(c.id)}
                  className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                    active ? "bg-[var(--sf-accent)] text-[var(--sf-ink)]" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </nav>
      )}
      <div className="h-1 bg-[var(--sf-accent)]" aria-hidden />
    </header>
  );
}
