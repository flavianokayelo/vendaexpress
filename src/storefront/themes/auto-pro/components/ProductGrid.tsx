// ProductGrid do tema Auto Pro — grid robusto de peças e rail horizontal para
// ofertas/populares.
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import { RailNav } from "../../../../components/theme/RailNav";
import { useHorizontalRail } from "../../../../lib/useHorizontalRail";
import type { Product } from "../../../../lib/types";

const PAGE_SIZE = 12;

export function ProductGrid({
  products,
  currency,
  categoryNames,
  onAdd,
  onView,
  isWishlisted,
  onToggleWishlist,
  layout = "grid",
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
  layout?: "grid" | "rail";
  paginate?: boolean;
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
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [paginate, products.length]);

  const { railRef, canScrollLeft, canScrollRight, scrollRail } = useHorizontalRail(products);

  const visible = paginate ? products.slice(0, visibleCount) : products;

  if (visible.length === 0) return null;

  const renderCard = (p: Product) => (
    <ProductCard
      key={p.id}
      p={p}
      currency={currency}
      categoryName={p.category_id ? categoryNames?.get(p.category_id) : undefined}
      compact={compact}
      onAdd={onAdd}
      onView={onView}
      isWishlisted={isWishlisted?.(p.id)}
      onToggleWishlist={onToggleWishlist}
    />
  );

  if (layout === "rail") {
    const railWidth = compact ? "w-[136px] sm:w-[160px]" : "w-[180px] sm:w-[220px]";
    return (
      <div className="group/rail relative">
        <div ref={railRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scroll-smooth">
          {visible.map((p) => (
            <div key={p.id} className={`${railWidth} flex-shrink-0 snap-start`}>
              {renderCard(p)}
            </div>
          ))}
        </div>
        <RailNav canScrollLeft={canScrollLeft} canScrollRight={canScrollRight} onScroll={scrollRail} />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((p) => renderCard(p))}
      </div>
      {paginate && visibleCount < products.length && (
        <div ref={sentinelRef} className="flex justify-center py-8 text-sm text-[var(--sf-ink-secondary)]">
          A carregar mais produtos...
        </div>
      )}
    </>
  );
}