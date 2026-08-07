// ProductCard do tema Food Express — cardápio de alta conversão. Imagem 1:1
// forte em fundo tint (padded-tint), preço e botão de adicionar muito
// visíveis, com zoom no hover.
import { Check, Plus, Heart } from "lucide-react";
import { resolveMediaUrl } from "../../../../lib/api";
import { formatCurrency, placeholderImage } from "../../../../lib/format";
import { useAddedFeedback } from "../../../../lib/useAddedFeedback";
import type { Product } from "../../../../lib/types";

const CONDITION_LABEL: Record<string, string> = {
  usado: "Usado",
  recondicionado: "Recondicionado",
  novo: "Novo",
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
  const outOfStock = p.stock <= 0;
  const hasCondition = p.item_condition && p.item_condition !== "novo";
  const discountPct = isPromo
    ? Math.round((1 - Number(p.price) / Number(p.compare_at_price)) * 100)
    : 0;

  const { justAdded, markAdded } = useAddedFeedback();

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAdd(p);
    markAdded();
  };

  return (
    <article
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--sf-radius-md)] bg-[var(--sf-surface)] ${onView ? "cursor-pointer" : ""}`}
      onClick={() => onView?.(p)}
    >
      <div className="relative aspect-square bg-[var(--sf-surface-muted)] p-3">
        <div className="relative h-full w-full overflow-hidden rounded-[var(--sf-radius-sm)]">
          <img
            src={productThumb(p)}
            alt={p.name}
            loading="lazy"
            className={`h-full w-full object-cover transition-transform duration-300 ${outOfStock ? "opacity-40" : "group-hover:scale-[1.05]"}`}
          />
        </div>
        {isPromo && !outOfStock && (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--sf-accent)] px-2 py-1 text-[10px] font-bold text-white">
            -{discountPct}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-[var(--sf-ink)]/80 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
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
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--sf-ink-secondary)] shadow-sm transition-opacity ${
              isWishlisted ? "text-[var(--sf-danger)]" : "opacity-0 group-hover:opacity-100"
            }`}
            title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart size={14} strokeWidth={1.8} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 pb-3 pt-1">
        {!compact && (
          <h3 className="line-clamp-2 min-h-[2.4em] text-[13px] font-medium leading-snug text-[var(--sf-ink)]">
            {p.name}
          </h3>
        )}
        <div className={compact ? "" : "mt-auto"}>
          <div className="flex items-baseline gap-2">
            <span className={`text-[15px] font-semibold leading-none tabular-nums ${isPromo ? "text-[var(--sf-accent)]" : "text-[var(--sf-ink)]"}`}>
              {formatCurrency(Number(p.price), currency)}
            </span>
            {isPromo && (
              <span className="text-[11px] tabular-nums text-[var(--sf-ink-secondary)] line-through">
                {formatCurrency(Number(p.compare_at_price), currency)}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--sf-ink-secondary)]">
            {hasCondition && (
              <span className="rounded-full bg-[var(--sf-surface-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--sf-ink-secondary)]">
                {CONDITION_LABEL[p.item_condition]}
              </span>
            )}
            {!compact && categoryName && <span className="truncate">{categoryName}</span>}
          </div>
        </div>

        {/* botão de adicionar muito visível */}
        {!compact && (
          <button
            type="button"
            disabled={justAdded || outOfStock}
            onClick={handleAdd}
            className={`mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-full text-[11px] font-semibold transition-colors ${
              outOfStock
                ? "cursor-not-allowed bg-[var(--sf-surface-muted)] text-[var(--sf-ink-secondary)]"
                : justAdded
                  ? "bg-[var(--sf-success)] text-white"
                  : "bg-[var(--sf-primary)] text-white hover:bg-[var(--sf-primary-hover)]"
            }`}
          >
            {outOfStock ? (
              "Indisponível"
            ) : justAdded ? (
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
    </article>
  );
}
