import { useEffect, useRef, useState } from 'react';
import { ProductCard } from './ProductCard';
import { RailNav } from './RailNav';
import { useHorizontalRail } from '../../lib/useHorizontalRail';
import type { Product } from '../../lib/types';

const PAGE_SIZE = 12;

export function ProductGrid({
  products,
  currency,
  categoryNames,
  onAdd,
  onView,
  isWishlisted,
  onToggleWishlist,
  layout = 'grid',
  paginate = false,
  compact = false,
}: {
  products: Product[];
  currency?: string;
  categoryNames?: Map<string, string>;
  onAdd: (p: Product) => void;
  onView?: (p: Product) => void;
  isWishlisted?: (id: string) => boolean;
  onToggleWishlist?: (p: Product) => void;
  /** "rail" = scroll horizontal com snap (secções tipo Promoção/Novidades); "grid" = grelha responsiva (catálogo/relacionados). */
  layout?: 'grid' | 'rail';
  /** Activa scroll infinito por página; só faz sentido em layout="grid". */
  paginate?: boolean;
  /** Esconde nome/categoria nos cards — usado na calha de Ofertas relâmpago. */
  compact?: boolean;
}) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [products]);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!paginate) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((v) => Math.min(v + PAGE_SIZE, products.length));
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [paginate, products.length]);

  const { railRef, canScrollLeft, canScrollRight, scrollRail } = useHorizontalRail(products);

  const visible = paginate ? products.slice(0, visibleCount) : products;

  if (visible.length === 0) return null;

  const renderCard = (p: Product, i: number) => (
    <ProductCard
      key={p.id}
      p={p}
      currency={currency}
      categoryName={p.category_id ? categoryNames?.get(p.category_id) : undefined}
      index={i}
      compact={compact}
      onAdd={onAdd}
      onView={onView}
      isWishlisted={isWishlisted?.(p.id)}
      onToggleWishlist={onToggleWishlist}
    />
  );

  if (layout === 'rail') {
    const railWidth = compact ? 'w-[120px] sm:w-[140px]' : 'w-[140px] sm:w-[168px]';
    return (
      <div className="group/rail relative">
        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto pb-2 scroll-smooth"
        >
          {visible.map((p, i) => (
            <div key={p.id} className={`${railWidth} flex-shrink-0 snap-start`}>
              {renderCard(p, i)}
            </div>
          ))}
        </div>

        <RailNav canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollRail} />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {visible.map((p, i) => renderCard(p, i))}
      </div>
      {paginate && visibleCount < products.length && (
        <div ref={sentinelRef} className="flex justify-center py-8 text-sm text-[var(--sf-ink-secondary)]">
          A carregar mais produtos...
        </div>
      )}
    </>
  );
}
