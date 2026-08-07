// ProductGrid do tema Fashion Luxe — grids editoriais com espaço amplo e
// rail para coleções em destaque.
import { ProductCard } from "./ProductCard";
import { RailNav } from "../../../../components/theme/RailNav";
import { useHorizontalRail } from "../../../../lib/useHorizontalRail";
import { useInfiniteGrid } from "../../../../lib/useInfiniteGrid";
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
  const { visible, visibleCount, sentinelRef } = useInfiniteGrid(products, PAGE_SIZE, paginate);

  const { railRef, canScrollLeft, canScrollRight, scrollRail } = useHorizontalRail(products);

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
    const railWidth = compact ? "w-[150px] sm:w-[170px]" : "w-[190px] sm:w-[230px]";
    return (
      <div className="group/rail relative">
        <div ref={railRef} className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 scroll-smooth">
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {visible.map((p) => renderCard(p))}
      </div>
      {paginate && visibleCount < products.length && (
        <div ref={sentinelRef} className="flex justify-center py-8 text-[11px] uppercase tracking-[0.16em] text-[var(--sf-ink-secondary)]">
          A carregar mais produtos...
        </div>
      )}
    </>
  );
}
