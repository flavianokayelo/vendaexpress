// ProductCard do tema Modern — denso, com badges de promoção/condição.
// Mostra só o que existe realmente nos dados do produto (nunca inventa
// contagens de vendas ou avaliações que o backend não fornece).
import { Check, Plus, Heart } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import { formatCurrency, placeholderImage } from "../../../../lib/format";
import { useAddedFeedback } from "../../../../lib/useAddedFeedback";
import type { Product } from "../../../../lib/types";

const CONDITION_LABEL: Record<string, string> = {
  usado: "Usado",
  recondicionado: "Recondicionado",
};

function productThumb(p: Product) {
  return resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) || placeholderImage(p.name);
}

export function ProductCard({
  p,
  currency,
  categoryName,
  compact,
  onAdd,
  onView,
  isWishlisted,
  onToggleWishlist,
}: {
  p: Product;
  currency?: string;
  categoryName?: string;
  index?: number;
  compact?: boolean;
  onAdd: (p: Product) => void;
  onView?: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (p: Product) => void;
}) {
  const isPromo = !!p.compare_at_price && Number(p.compare_at_price) > Number(p.price);
  const discountPct = isPromo ? Math.round((1 - Number(p.price) / Number(p.compare_at_price)) * 100) : 0;
  const outOfStock = p.stock <= 0;
  const lowStock = !outOfStock && p.stock <= 5;
  const hasCondition = p.item_condition && p.item_condition !== "novo";

  const { justAdded, markAdded } = useAddedFeedback();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAdd(p);
    markAdded();
  };

  return (
    <article
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[10px] border border-[var(--sf-line)] bg-[var(--sf-surface)] transition-[box-shadow,transform] duration-150 hover:-translate-y-[2px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.09)] ${onView ? "cursor-pointer" : ""}`}
      onClick={() => onView?.(p)}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--sf-surface-muted)]">
        <img
          src={productThumb(p)}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover ${outOfStock ? "opacity-40" : ""}`}
        />
        {hasCondition && (
          <span className="absolute left-0 top-1.5 rounded-r-[4px] bg-[#1B1B1B] px-1.5 py-[3px] text-[10px] font-bold leading-none text-white">
            {CONDITION_LABEL[p.item_condition]}
          </span>
        )}
        {isPromo && (
          <span className="absolute right-1.5 top-1.5 rounded-[5px] bg-[var(--sf-primary)] px-1.5 py-[3px] text-[11px] font-extrabold leading-none text-white shadow-sm">
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="rounded-[6px] bg-black/60 px-2.5 py-1 text-[11px] font-semibold text-white">Esgotado</span>
          </span>
        )}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(p);
            }}
            className={`absolute bottom-1.5 left-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-[var(--sf-ink-secondary)] shadow-sm transition-colors ${
              isWishlisted ? "text-[var(--sf-danger)]" : ""
            }`}
            title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart size={12} strokeWidth={2} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        )}
        {!outOfStock && (
          <button
            type="button"
            disabled={justAdded}
            onClick={handleAdd}
            title="Adicionar ao carrinho"
            className={`absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md transition-colors ${
              justAdded ? "bg-[var(--sf-success)]" : "bg-[var(--sf-primary)] hover:brightness-110"
            }`}
          >
            {justAdded ? <Check size={13} strokeWidth={2.5} /> : <Plus size={14} strokeWidth={2.5} />}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-2.5 pb-2.5 pt-2">
        {!compact && (
          <h3 className="line-clamp-2 min-h-[32px] text-[13px] font-normal leading-[1.25] text-[var(--sf-ink)]">
            {p.name}
          </h3>
        )}
        <div className={compact ? "" : "mt-auto"}>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-[16.5px] font-bold leading-none tabular-nums ${isPromo ? "text-[var(--sf-primary)]" : "text-[var(--sf-ink)]"}`}
            >
              {formatCurrency(Number(p.price), currency)}
            </span>
            {isPromo && (
              <span className="truncate text-[11px] tabular-nums text-[var(--sf-ink-secondary)] line-through">
                {formatCurrency(Number(p.compare_at_price), currency)}
              </span>
            )}
          </div>
        </div>
        {!compact && categoryName && (
          <span className="truncate text-[10.5px] text-[var(--sf-ink-secondary)]">Em {categoryName}</span>
        )}
        {lowStock && <span className="text-[10px] font-medium text-[var(--sf-warning)]">Só {p.stock} un.</span>}
      </div>
    </article>
  );
}
