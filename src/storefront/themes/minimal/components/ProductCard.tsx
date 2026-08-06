// ProductCard do tema Minimal — flat, sem moldura e sem ornamento. Imagem,
// nome e preço; o estado (condição) e o desconto aparecem como texto simples.
import { Check, Plus, Heart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { resolveMediaUrl } from "../../../../lib/api";
import { formatCurrency, placeholderImage } from "../../../../lib/format";
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
  const outOfStock = p.stock <= 0;
  const hasCondition = p.item_condition && p.item_condition !== "novo";

  const [justAdded, setJustAdded] = useState(false);
  const addTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(addTimer.current), []);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (outOfStock) return;
    onAdd(p);
    setJustAdded(true);
    window.clearTimeout(addTimer.current);
    addTimer.current = window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <article
      className={`group relative flex h-full w-full flex-col bg-[var(--sf-surface)] ${onView ? "cursor-pointer" : ""}`}
      onClick={() => onView?.(p)}
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--sf-surface-muted)]">
        <img
          src={productThumb(p)}
          alt={p.name}
          loading="lazy"
          className={`h-full w-full object-cover transition-opacity duration-300 ${outOfStock ? "opacity-40" : "group-hover:opacity-90"}`}
        />
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="bg-black px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white">
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
            className={`absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center bg-white text-[var(--sf-ink-secondary)] transition-colors ${
              isWishlisted ? "text-[var(--sf-danger)]" : "opacity-0 group-hover:opacity-100"
            }`}
            title={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          >
            <Heart size={14} strokeWidth={1.8} fill={isWishlisted ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-2.5">
        {!compact && (
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--sf-ink)]">
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
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--sf-ink-secondary)]">
            {hasCondition && <span>{CONDITION_LABEL[p.item_condition]}</span>}
            {!compact && categoryName && <span className="truncate">{categoryName}</span>}
          </div>
        </div>

        {!compact && (
          <button
            type="button"
            disabled={justAdded || outOfStock}
            onClick={handleAdd}
            className={`mt-2 flex h-9 w-full items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors ${
              outOfStock
                ? "cursor-not-allowed bg-zinc-100 text-zinc-400"
                : justAdded
                  ? "bg-[var(--sf-success)] text-white"
                  : "bg-black text-white hover:bg-[var(--sf-primary-hover)]"
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
