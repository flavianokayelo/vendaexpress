// ProductCard do tema Luxury — editorial com borda fina e retrato 1:1.
// Badges discretos (sem sombras fortes), nome em maiúsculas e "Adicionar" no hover.
// Mostra só o que existe nos dados — nunca inventa avaliações ou vendas.
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
      className={`group relative flex h-full w-full flex-col overflow-hidden border border-[var(--sf-line)] bg-[var(--sf-surface)] transition-shadow duration-300 hover:shadow-[var(--sf-shadow-sm)] ${onView ? "cursor-pointer" : ""}`}
      onClick={() => onView?.(p)}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--sf-surface-muted)]">
        <img
          src={productThumb(p)}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] ${outOfStock ? "opacity-40" : ""}`}
        />
        {hasCondition && (
          <span className="absolute left-0 top-0 bg-[var(--sf-ink)] px-2 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-white">
            {CONDITION_LABEL[p.item_condition]}
          </span>
        )}
        {isPromo && (
          <span className="absolute right-3 top-3 border border-[var(--sf-line)] bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--sf-primary)]">
            −{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/10">
            <span className="bg-black/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
              Esgotado
            </span>
          </span>
        )}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(p);
            }}
            className={`absolute bottom-3 left-3 flex h-8 w-8 items-center justify-center border border-[var(--sf-line)] bg-white text-[var(--sf-ink-secondary)] transition-colors ${
              isWishlisted ? "text-[var(--sf-danger)]" : "opacity-0 group-hover:opacity-100"
            }`}
            title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart size={14} strokeWidth={1.6} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        )}
        {!outOfStock && (
          <button
            type="button"
            disabled={justAdded}
            onClick={handleAdd}
            title="Adicionar ao carrinho"
            className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white opacity-0 transition-all group-hover:opacity-100 ${
              justAdded ? "bg-[var(--sf-success)]" : "bg-[var(--sf-ink)] hover:bg-[var(--sf-primary)]"
            }`}
          >
            {justAdded ? (
              <>
                <Check size={12} strokeWidth={2.5} /> Adicionado
              </>
            ) : (
              <>
                <Plus size={12} strokeWidth={2.5} /> Adicionar
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-2 pb-2 pt-3">
        {!compact && (
          <h3 className="line-clamp-2 text-[11px] font-medium uppercase leading-[1.6] tracking-[0.1em] text-[var(--sf-ink)]">
            {p.name}
          </h3>
        )}
        <div className={compact ? "" : "mt-auto"}>
          <div className="flex items-baseline gap-2">
            <span className={`text-[15px] font-semibold leading-none tabular-nums ${isPromo ? "text-[var(--sf-primary)]" : "text-[var(--sf-ink)]"}`}>
              {formatCurrency(Number(p.price), currency)}
            </span>
            {isPromo && (
              <span className="text-[11px] tabular-nums text-[var(--sf-ink-secondary)] line-through">
                {formatCurrency(Number(p.compare_at_price), currency)}
              </span>
            )}
          </div>
        </div>
        {!compact && categoryName && (
          <span className="truncate text-[10px] uppercase tracking-[0.1em] text-[var(--sf-ink-secondary)]">
            {categoryName}
          </span>
        )}
      </div>
    </article>
  );
}
