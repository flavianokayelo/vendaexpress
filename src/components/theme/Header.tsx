import { Search, X, Heart, ShoppingCart, Store as StoreIcon, HelpCircle, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../lib/api';
import { formatCurrency, placeholderImage } from '../../lib/format';
import { useSearchHistory } from '../../lib/useSearchHistory';
import type { Store, Category, Product } from '../../lib/types';

function CountBadge({ n }: { n: number }) {
  return (
    <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-extrabold leading-none text-[var(--sf-primary)]">
      {n > 9 ? '9+' : n}
    </span>
  );
}

function suggestionThumb(p: Product) {
  return resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) || placeholderImage(p.name);
}

function SearchBox({
  storeName,
  search,
  onSearchChange,
  onSearchSubmit,
  suggestions,
  onSuggestionSelect,
  currency,
  history,
  addTerm,
  removeTerm,
  clearHistory,
}: {
  storeName: string;
  search: string;
  onSearchChange: (v: string) => void;
  onSearchSubmit?: () => void;
  suggestions: Product[];
  onSuggestionSelect?: (p: Product) => void;
  currency?: string;
  history: string[];
  addTerm: (term: string) => void;
  removeTerm: (term: string) => void;
  clearHistory: () => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [open]);

  const commit = (term: string) => {
    if (term.trim()) addTerm(term.trim());
    setOpen(false);
    onSearchSubmit?.();
  };

  const hasQuery = search.trim().length > 0;
  const showHistory = !hasQuery && history.length > 0;
  const showSuggestions = hasQuery && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(search);
        }}
        className={`flex h-9 overflow-hidden rounded-[var(--sf-radius-pill)] bg-white ring-2 transition-shadow duration-200 sm:h-10 ${
          open ? 'ring-white shadow-[var(--sf-shadow-lg)]' : 'ring-white/30 shadow-[var(--sf-shadow-sm)]'
        }`}
      >
        <div className="relative min-w-0 flex-1">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={`Buscar na ${storeName}`}
            aria-label="Buscar"
            className="h-full w-full border-0 bg-transparent pl-4 pr-8 text-[13px] text-[var(--sf-ink)] outline-none sm:text-[14px]"
          />
          {search && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => onSearchChange('')}
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--sf-ink-secondary)] transition-colors hover:bg-[var(--sf-surface-muted)] hover:text-[var(--sf-ink)]"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button
          type="submit"
          aria-label="Procurar"
          className="flex w-11 flex-shrink-0 items-center justify-center rounded-full bg-[var(--sf-primary)] text-white transition-[filter] duration-200 hover:brightness-110 active:brightness-95 sm:w-[52px]"
        >
          <Search size={16} strokeWidth={2} />
        </button>
      </form>

      {open && (showHistory || showSuggestions) && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[var(--sf-radius-md)] border border-[var(--sf-line)] bg-[var(--sf-surface)] text-left shadow-[var(--sf-shadow-xl)]">
          {showHistory && (
            <div className="py-1.5">
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--sf-ink-secondary)]">
                  Pesquisas recentes
                </span>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={clearHistory}
                  className="text-[11px] font-medium text-[var(--sf-ink-secondary)] hover:text-[var(--sf-primary)]"
                >
                  Limpar
                </button>
              </div>
              {history.map((term) => (
                <div
                  key={term}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSearchChange(term);
                    commit(term);
                  }}
                  className="group flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-[var(--sf-surface-muted)]"
                >
                  <Clock size={14} className="flex-shrink-0 text-[var(--sf-ink-secondary)]" />
                  <span className="flex-1 truncate text-[13px] text-[var(--sf-ink)]">{term}</span>
                  <button
                    type="button"
                    aria-label={`Remover "${term}" do histórico`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeTerm(term);
                    }}
                    className="flex-shrink-0 text-[var(--sf-ink-secondary)] opacity-0 hover:text-[var(--sf-danger)] group-hover:opacity-100"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showSuggestions && (
            <div className="py-1.5">
              <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--sf-ink-secondary)]">
                <TrendingUp size={12} /> Sugestões
              </div>
              {suggestions.map((p) => (
                <div
                  key={p.id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTerm(search);
                    setOpen(false);
                    onSuggestionSelect?.(p);
                  }}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 hover:bg-[var(--sf-surface-muted)]"
                >
                  <img
                    src={suggestionThumb(p)}
                    alt=""
                    loading="lazy"
                    className="h-9 w-9 flex-shrink-0 rounded-[4px] object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[var(--sf-ink)]">{p.name}</span>
                  <span className="flex-shrink-0 text-[12px] font-semibold text-[var(--sf-ink)] [font-feature-settings:'tnum'_1]">
                    {formatCurrency(Number(p.price), currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Header({
  store,
  search,
  onSearchChange,
  onSearchSubmit,
  suggestions = [],
  onSuggestionSelect,
  currency,
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
  /** Disparado ao carregar Enter ou no botão de procurar — distinto de onSearchChange (que já filtra ao vivo). */
  onSearchSubmit?: () => void;
  /** Produtos sugeridos pra mostrar no dropdown enquanto o utilizador escreve. */
  suggestions?: Product[];
  onSuggestionSelect?: (p: Product) => void;
  currency?: string;
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

  const { history, addTerm, removeTerm, clearHistory } = useSearchHistory(store.slug);

  const searchBoxProps = {
    storeName: store.name,
    search,
    onSearchChange,
    onSearchSubmit,
    suggestions,
    onSuggestionSelect,
    currency,
    history,
    addTerm,
    removeTerm,
    clearHistory,
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="shadow-[var(--sf-shadow-md)] backdrop-blur-xl backdrop-saturate-150" style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--sf-primary) 96%, white), color-mix(in srgb, var(--sf-primary-hover) 30%, var(--sf-primary)))' }}>
        {/* barra utilitária */}
        <div className="mx-auto hidden max-w-[1240px] items-center justify-between px-4 text-[12px] text-white/85 sm:flex" style={{ height: 30 }}>
          <nav className="flex items-center gap-4">
            <button type="button" onClick={onHelpClick} className="transition-colors hover:text-white hover:underline">
              Perguntas frequentes
            </button>
            <button type="button" onClick={onHelpClick} className="transition-colors hover:text-white hover:underline">
              Trocas e devoluções
            </button>
          </nav>
          <nav className="flex items-center gap-4">
            {waDigits && (
              <a
                href={`https://wa.me/${waDigits}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline"
              >
                <MessageCircle size={13} /> Fale connosco
              </a>
            )}
            <button type="button" onClick={onHelpClick} className="flex items-center gap-1.5 transition-colors hover:text-white hover:underline">
              <HelpCircle size={13} /> Ajuda
            </button>
          </nav>
        </div>

        <div className="border-t border-white/10">
          {/* header principal */}
          <div className="mx-auto grid max-w-[1240px] grid-cols-[auto_1fr_auto] items-center gap-4 px-2 py-2 sm:gap-7 sm:px-4 sm:py-0" style={{ minHeight: 64 }}>
            <div className="flex flex-shrink-0 items-center gap-2.5">
              {store.logo_url ? (
                <span className="flex h-8 max-w-[128px] flex-shrink-0 items-center justify-center rounded-[9px] bg-white px-1 sm:h-[34px]">
                  <img
                    src={resolveMediaUrl(store.logo_url) ?? ''}
                    alt={store.name}
                    className="h-full w-auto max-w-full object-contain"
                  />
                </span>
              ) : (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-white text-[var(--sf-primary)] sm:h-[34px] sm:w-[34px]">
                  <StoreIcon size={18} strokeWidth={2} />
                </div>
              )}
              <span className="hidden truncate font-display text-[19px] font-extrabold tracking-[-0.02em] text-white sm:block sm:text-[24px]">
                {store.name}
              </span>
            </div>

            <div className="hidden sm:block">
              <SearchBox {...searchBoxProps} />
            </div>

            <div className="flex flex-shrink-0 items-center gap-1 justify-self-end">
              <button
                onClick={onWishlistClick}
                aria-label="Favoritos"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition-[background-color,transform] duration-150 hover:bg-white/15 active:scale-90"
              >
                <Heart size={21} strokeWidth={1.8} />
                {wishlistCount > 0 && <CountBadge n={wishlistCount} />}
              </button>
              <button
                onClick={onCartClick}
                aria-label="Carrinho"
                className={`relative flex h-10 w-10 items-center justify-center rounded-full text-white transition-[background-color,transform] duration-150 hover:bg-white/15 active:scale-90 ${cartPulsing ? 'animate-sf-cartpulse' : ''}`}
              >
                <ShoppingCart size={22} strokeWidth={1.8} />
                {cartCount > 0 && <CountBadge n={cartCount} />}
              </button>
            </div>
          </div>

          {/* pesquisa — mobile */}
          <div className="px-2 pb-2 sm:hidden">
            <SearchBox {...searchBoxProps} />
          </div>

          {/* hotwords — categorias (pills) */}
          {categories && categories.length > 0 && onSelectCategory && (
            <div className="no-scrollbar mx-auto flex max-w-[1240px] items-center gap-1.5 overflow-x-auto px-2 pb-2.5 pt-0.5 sm:px-4">
              {[{ id: '', name: 'Todos' }, ...categories.slice(0, 8)].map((c) => {
                const active = selectedCategoryId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => onSelectCategory(c.id)}
                    className={`group relative flex-shrink-0 whitespace-nowrap rounded-[var(--sf-radius-pill)] px-3 py-1 text-[12px] font-medium transition-colors duration-150 ${
                      active ? 'bg-white font-semibold text-[var(--sf-primary)]' : 'text-white/85 hover:bg-white/12 hover:text-white'
                    }`}
                  >
                    {c.name}
                    {!active && (
                      <span className="pointer-events-none absolute inset-x-3 bottom-0.5 h-[1.5px] origin-center scale-x-0 rounded-full bg-white transition-transform duration-200 group-hover:scale-x-100" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
