import { Search, Heart, ShoppingCart } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import { Input } from '../ui/Field';
import type { Store, Category } from '../../lib/types';

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[var(--sf-primary)] px-1 text-[10px] font-bold text-white">
      {n > 9 ? '9+' : n}
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
  selectedCategoryId = '',
  onSelectCategory,
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
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur">
      {/* Barra principal */}
      <div className="border-b border-[var(--sf-line)]">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-2.5 sm:h-[72px] sm:px-4 sm:py-0">
          <div className="flex flex-shrink-0 items-center gap-2">
            {store.logo_url ? (
              <img src={resolveMediaUrl(store.logo_url) ?? ''} alt={store.name} className="h-9 w-9 rounded-[var(--sf-radius-sm)] object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--sf-radius-sm)] bg-[var(--sf-primary)] font-bold text-white">
                {store.name[0]}
              </div>
            )}
            <div className="hidden min-w-0 sm:block">
              <div className="truncate font-bold text-[var(--sf-ink)]">{store.name}</div>
              <div className="truncate text-xs text-[var(--sf-ink-secondary)]">{store.slug}.vendaexpress.ao</div>
            </div>
          </div>

          {/* Pesquisa — centrada na barra inteira (posição absoluta, independente da largura do logo/ícones), como na referência */}
          <div className="absolute left-1/2 hidden w-full max-w-md -translate-x-1/2 px-4 sm:block">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--sf-ink-secondary)]" />
              <Input
                className="!h-[52px] !rounded-[var(--sf-radius-md)] pl-11 focus:!ring-1"
                placeholder="Procurar produtos..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-1">
            <button onClick={onWishlistClick} className="relative flex h-9 w-9 items-center justify-center rounded-[var(--sf-radius-sm)] text-[var(--sf-ink-secondary)] hover:bg-[var(--sf-surface-muted)]">
              <Heart size={20} />
              {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
            </button>

            <button onClick={onCartClick} className="relative flex h-9 w-9 items-center justify-center rounded-[var(--sf-radius-sm)] text-[var(--sf-ink-secondary)] hover:bg-[var(--sf-surface-muted)]">
              <ShoppingCart size={20} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>

        {/* Pesquisa — em mobile fica numa linha própria por baixo */}
        <div className="relative mx-auto max-w-6xl px-3 pb-2.5 sm:hidden">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--sf-ink-secondary)]" />
          <Input className="w-full !rounded-[var(--sf-radius-md)] pl-11" placeholder="Procurar produtos..." value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
      </div>

      {/* Barra de categorias */}
      {categories && categories.length > 0 && onSelectCategory && (
        <div className="overflow-x-auto bg-[var(--sf-ink)]">
          <div className="mx-auto flex max-w-6xl items-center gap-1 whitespace-nowrap px-4 py-2 text-sm">
            <button
              onClick={() => onSelectCategory('')}
              className={`flex-shrink-0 rounded px-2.5 py-1 font-medium transition-colors ${
                !selectedCategoryId ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'
              }`}
            >
              Todos os produtos
            </button>
            {categories.slice(0, 6).map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectCategory(c.id)}
                className={`flex-shrink-0 rounded px-2.5 py-1 font-medium transition-colors ${
                  selectedCategoryId === c.id ? 'bg-white/15 text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
