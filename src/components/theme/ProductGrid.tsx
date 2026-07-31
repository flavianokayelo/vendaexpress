import { useEffect, useRef, useState } from 'react';
import { ProductCard } from './ProductCard';
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

  const visible = paginate ? products.slice(0, visibleCount) : products;

  if (visible.length === 0) return null;

  const renderCard = (p: Product, i: number) => (
    <ProductCard
      key={p.id}
      p={p}
      currency={currency}
      categoryName={p.category_id ? categoryNames?.get(p.category_id) : undefined}
      index={i}
      onAdd={onAdd}
      onView={onView}
      isWishlisted={isWishlisted?.(p.id)}
      onToggleWishlist={onToggleWishlist}
    />
  );

  if (layout === 'rail') {
    return (
      <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 scroll-smooth">
        {visible.map((p, i) => (
          <div key={p.id} className="w-[200px] flex-shrink-0 snap-start sm:w-[238px]">
            {renderCard(p, i)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-5">
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
