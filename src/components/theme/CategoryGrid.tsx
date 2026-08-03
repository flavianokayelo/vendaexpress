import { Tag } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import { RailNav } from './RailNav';
import { useHorizontalRail } from '../../lib/useHorizontalRail';
import type { Category } from '../../lib/types';

/** Carrossel de categorias — círculo com imagem bem enquadrada, sensação de
 * profundidade no hover, contador de produtos real (nunca inventado). Cada
 * categoria abre a sua própria página (ver CategoryPage). */
export function CategoryGrid({
  categories,
  onSelect,
  activeId,
  productCounts,
}: {
  categories: Category[];
  onSelect: (id: string) => void;
  /** Categoria em destaque (ex: página da própria categoria) — anel + cor ficam sempre visíveis, sem precisar de hover. */
  activeId?: string;
  /** Nº de produtos por categoria (id → contagem real) — omitido se não disponível. */
  productCounts?: Map<string, number>;
}) {
  const { railRef, canScrollLeft, canScrollRight, scrollRail } = useHorizontalRail(categories);

  if (categories.length === 0) return null;

  return (
    <div className="group/rail relative">
      <div
        ref={railRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-x-4 overflow-x-auto px-0.5 pb-1.5 pt-0.5 scroll-smooth"
      >
        {categories.map((c) => {
          const active = c.id === activeId;
          const count = productCounts?.get(c.id);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="group flex w-[76px] flex-shrink-0 snap-start flex-col items-center gap-2 text-center sm:w-[84px]"
            >
              <span
                className={`relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--sf-surface-muted)] shadow-[var(--sf-shadow-sm)] ring-1 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--sf-shadow-lg)] group-hover:ring-[var(--sf-primary)] group-hover:text-[var(--sf-primary)] sm:h-[72px] sm:w-[72px] ${
                  active
                    ? 'text-[var(--sf-primary)] shadow-[var(--sf-shadow-md)] ring-2 ring-[var(--sf-primary)]'
                    : 'text-[var(--sf-ink-secondary)] ring-1 ring-[var(--sf-line)]'
                }`}
              >
                {c.icon_url ? (
                  <img src={resolveMediaUrl(c.icon_url) ?? ''} alt={c.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <Tag size={22} strokeWidth={1.6} />
                )}
              </span>
              <span className="flex flex-col items-center gap-0.5">
                <span
                  className={`line-clamp-2 text-[11.5px] leading-tight transition-colors duration-150 group-hover:text-[var(--sf-primary)] ${
                    active ? 'font-semibold text-[var(--sf-primary)]' : 'font-medium text-[var(--sf-ink)]'
                  }`}
                >
                  {c.name}
                </span>
                {count !== undefined && (
                  <span className="text-[10px] tabular-nums text-[var(--sf-ink-secondary)]">
                    {count} {count === 1 ? 'item' : 'itens'}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <RailNav canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollRail} />
    </div>
  );
}
