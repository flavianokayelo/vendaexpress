// ProductCard do tema Auto Pro — cards robustos com moldura (bordered),
// imagem 3:2, efeito de elevação no hover e preço em destaque.
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
      className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[var(--sf-radius-md)] border border-[var(--sf-line)] bg-[var(--sf-surface)] transition-transform duration-200 hover:-translate-y-1 hover:border-[var(--sf-primary)] hover:shadow-[var(--sf-shadow-md)] ${
        onView ? "cursor-pointer" : ""
      }`}
      onClick={() => onView?.(p)}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-[var(--sf-surface-muted)]">
        <img
          src={productThumb(p)}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-300 ${outOfStock ? "opacity-40" : "group-hover:scale-[1.04]"}`}
        />
        {isPromo && !outOfStock && (
          <span className="absolute left-2.5 top-2.5 bg-[var(--sf-accent)] px-2 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.1em] text-[var(--sf-ink)]">
            -{discountPct}% OFERTA
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-[var(--sf-ink)]/85 px-3 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white">
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
            className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[var(--sf-ink-secondary)] shadow-sm transition-opacity ${
              isWishlisted ? "text-[var(--sf-danger)]" : "opacity-0 group-hover:opacity-100"
            }`}
            title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart size={14} strokeWidth={1.8} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {!compact && (
          <h3 className="line-clamp-2 min-h-[2.4em] text-[13px] font-medium leading-snug text-[var(--sf-ink)]">
            {p.name}
          </h3>
        )}
        <div className={compact ? "" : "mt-auto"}>
          <div className="flex items-baseline gap-2">
            <span className={`font-display text-[16px] font-extrabold leading-none tabular-nums ${isPromo ? "text-[var(--sf-danger)]" : "text-[var(--sf-ink)]"}`}>
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
              <span className="rounded-[var(--sf-radius-sm)] bg-[var(--sf-surface-muted)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--sf-ink-secondary)]">
                {CONDITION_LABEL[p.item_condition]}
              </span>
            )}
            {!compact && categoryName && <span className="truncate">{categoryName}</span>}
          </div>
        </div>

        {!compact && (
          <button
            type="button"
            disabled={justAdded || outOfStock}
            onClick={handleAdd}
            className={`mt-2 flex h-9 w-full items-center justify-center gap-1.5 font-display text-[11px] font-extrabold uppercase tracking-[0.1em] transition-colors ${
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
