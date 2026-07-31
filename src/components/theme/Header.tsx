import { Search, Heart, ShoppingCart, Store as StoreIcon, HelpCircle, MessageCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../lib/api';
import type { Store, Category } from '../../lib/types';

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-extrabold leading-none text-[var(--sf-primary)]">
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

  const SearchField = (
    <div className="flex h-9 overflow-hidden rounded-[4px] bg-white shadow-[0_0_0_2px_rgba(255,255,255,0.25)] sm:h-10">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={`Buscar na ${store.name}`}
        aria-label="Buscar"
        className="min-w-0 flex-1 border-0 bg-transparent px-3.5 text-[13px] text-[var(--sf-ink)] outline-none sm:text-[14px]"
      />
      <button
        type="button"
        aria-label="Procurar"
        className="m-[3px] flex w-11 flex-shrink-0 items-center justify-center rounded-[3px] bg-[var(--sf-primary)] text-white hover:brightness-110 sm:w-[52px]"
      >
        <Search size={16} strokeWidth={2} />
      </button>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
      <div className="bg-[var(--sf-primary)]">
        {/* barra utilitária */}
        <div className="mx-auto hidden max-w-[1240px] items-center justify-between px-4 text-[12.5px] text-white sm:flex" style={{ height: 34 }}>
          <nav className="flex items-center gap-4">
            <button type="button" onClick={onHelpClick} className="opacity-90 transition-opacity hover:opacity-100 hover:underline">
              Perguntas frequentes
            </button>
            <button type="button" onClick={onHelpClick} className="opacity-90 transition-opacity hover:opacity-100 hover:underline">
              Trocas e devoluções
            </button>
          </nav>
          <nav className="flex items-center gap-4">
            {waDigits && (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100 hover:underline"
              >
                <MessageCircle size={13} /> Fale connosco
              </a>
            )}
            <button type="button" onClick={onHelpClick} className="flex items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100 hover:underline">
              <HelpCircle size={13} /> Ajuda
            </button>
          </nav>
        </div>

        {/* header principal */}
        <div className="mx-auto grid max-w-[1240px] grid-cols-[auto_1fr_auto] items-center gap-4 px-2 py-2.5 sm:gap-7 sm:px-4 sm:py-0" style={{ minHeight: 74 }}>
          <div className="flex flex-shrink-0 items-center gap-2.5">
            {store.logo_url ? (
              <img
                src={resolveMediaUrl(store.logo_url) ?? ''}
                alt={store.name}
                className="h-9 w-9 rounded-[9px] object-cover sm:h-[38px] sm:w-[38px]"
              />
            ) : (
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[9px] bg-white text-[var(--sf-primary)] sm:h-[38px] sm:w-[38px]">
                <StoreIcon size={19} strokeWidth={2} />
              </div>
            )}
            <span className="hidden truncate text-[20px] font-extrabold tracking-[-0.02em] text-white sm:block sm:text-[26px]">
              {store.name}
            </span>
          </div>

          <div className="hidden sm:block">{SearchField}</div>

          <div className="flex flex-shrink-0 items-center gap-4 justify-self-end">
            <button onClick={onWishlistClick} className="relative text-white">
              <Heart size={22} strokeWidth={1.8} />
              {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
            </button>
            <button onClick={onCartClick} className={`relative text-white ${cartPulsing ? 'animate-sf-cartpulse' : ''}`}>
              <ShoppingCart size={26} strokeWidth={1.8} />
              {cartCount > 0 && <CountBadge n={cartCount} />}
            </button>
          </div>
        </div>

        {/* pesquisa — mobile */}
        <div className="px-2 pb-2 sm:hidden">{SearchField}</div>

        {/* hotwords — categorias */}
        {categories && categories.length > 0 && onSelectCategory && (
          <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-3.5 gap-y-1 px-2 pb-2 text-[11.5px] text-white/90 sm:px-4">
            {[{ id: '', name: 'Todos' }, ...categories.slice(0, 8)].map((c) => {
              const active = selectedCategoryId === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onSelectCategory(c.id)}
                  className={active ? 'font-semibold text-white underline underline-offset-2' : 'hover:underline'}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
}
