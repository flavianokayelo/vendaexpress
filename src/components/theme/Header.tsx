import { Search, Heart, ShoppingCart, Zap, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../lib/api';
import { Input } from '../ui/Field';
import type { Store, Category } from '../../lib/types';

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full bg-[var(--sf-danger)] px-1 font-display text-[12px] font-semibold leading-none text-white">
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
  const waDigits = store.whatsapp ? store.whatsapp.replace(/\D/g, '') : '';

  const prevCount = useRef(cartCount);
  const [cartPulsing, setCartPulsing] = useState(false);

  useEffect(() => {
    if (prevCount.current !== undefined && cartCount > prevCount.current) {
      setCartPulsing(true);
      const t = setTimeout(() => setCartPulsing(false), 700);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-[0_1px_3px_rgba(29,31,32,0.04)]">
      {/* Barra principal */}
      <div className="border-b border-[var(--sf-line)]">
        <div className="mx-auto flex max-w-[1240px] items-center gap-6 px-4 py-[18px] sm:px-6">
          <div className="flex flex-shrink-0 items-center gap-3">
            {store.logo_url ? (
              <img src={resolveMediaUrl(store.logo_url) ?? ''} alt={store.name} className="h-10 w-10 rounded-[11px] object-cover" />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[11px] bg-[var(--sf-accent)] text-white">
                <Zap size={21} strokeWidth={1.8} fill="currentColor" />
              </div>
            )}
            <div className="hidden min-w-0 sm:block">
              <div className="truncate font-display text-[23px] font-semibold leading-tight tracking-[-0.02em] text-[var(--sf-ink)]">
                {store.name}
              </div>
            </div>
          </div>

          {/* Pesquisa — pill 999px */}
          <div className="relative hidden flex-1 sm:block" style={{ maxWidth: 580 }}>
            <div className="relative">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sf-ink-secondary)]" />
              <Input
                className="!h-11 !rounded-[var(--sf-radius-pill)] !bg-[var(--sf-surface-muted)] pl-10 focus:!ring-1"
                placeholder="Procurar produtos…"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={onWishlistClick}
              className="relative flex h-11 w-11 items-center justify-center rounded-[10px] text-[var(--sf-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--sf-ink)_6%,transparent)]"
            >
              <Heart size={20} strokeWidth={1.5} />
              {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
            </button>

            <button
              onClick={onCartClick}
              className={`relative flex h-11 w-11 items-center justify-center rounded-[10px] text-[var(--sf-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--sf-ink)_6%,transparent)] ${
                cartPulsing ? 'animate-sf-cartpulse' : ''
              }`}
            >
              <ShoppingCart size={20} strokeWidth={1.5} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>

            {waDigits && (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden h-11 items-center gap-2 rounded-[var(--sf-radius-pill)] bg-[#25D366] px-[18px] font-display text-[15px] font-semibold text-white transition-colors hover:bg-[#1eb257] md:inline-flex"
              >
                <MessageCircle size={18} strokeWidth={1.7} />
                <span className="whitespace-nowrap">WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Pesquisa — mobile */}
        <div className="mx-auto max-w-[1240px] px-4 pb-3 sm:hidden">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--sf-ink-secondary)]" />
            <Input
              className="w-full !rounded-[var(--sf-radius-pill)] !bg-[var(--sf-surface-muted)] pl-10"
              placeholder="Procurar produtos…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Barra de categorias — pills claras */}
      {categories && categories.length > 0 && onSelectCategory && (
        <div className="border-b border-[var(--sf-line)] overflow-x-auto">
          <div className="mx-auto flex max-w-[1240px] items-center gap-2.5 whitespace-nowrap px-4 py-3.5 sm:px-6">
            {[{ id: '', name: 'Todos' }, ...categories.slice(0, 6)].map((c) => {
              const active = selectedCategoryId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCategory(c.id)}
                  className={`flex-shrink-0 rounded-[var(--sf-radius-pill)] px-[20px] py-2.5 font-display text-[15px] font-semibold transition-colors ${
                    active
                      ? 'bg-[var(--sf-accent)] text-white'
                      : 'text-[var(--sf-ink)]/65 hover:bg-[color-mix(in_srgb,var(--sf-ink)_7%,transparent)]'
                  }`}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
