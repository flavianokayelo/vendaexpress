import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Setas + fade de borda partilhadas por toda calha horizontal (produtos,
 * categorias) — mesma affordance de "carrossel" em toda a loja. */
export function RailNav({
  canScrollLeft,
  canScrollRight,
  onScroll,
}: {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScroll: (dir: 1 | -1) => void;
}) {
  return (
    <>
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-[var(--sf-surface)] to-transparent" />
          <button
            type="button"
            aria-label="Ver anteriores"
            onClick={() => onScroll(-1)}
            className="absolute left-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--sf-surface)] text-[var(--sf-ink)] shadow-[var(--sf-shadow-md)] transition-[opacity,transform] duration-200 sm:flex opacity-0 group-hover/rail:opacity-100 hover:scale-105 hover:bg-[var(--sf-surface-muted)]"
          >
            <ChevronLeft size={16} />
          </button>
        </>
      )}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--sf-surface)] to-transparent" />
          <button
            type="button"
            aria-label="Ver mais"
            onClick={() => onScroll(1)}
            className="absolute right-1 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--sf-surface)] text-[var(--sf-ink)] shadow-[var(--sf-shadow-md)] transition-[opacity,transform] duration-200 sm:flex opacity-0 group-hover/rail:opacity-100 hover:scale-105 hover:bg-[var(--sf-surface-muted)]"
          >
            <ChevronRight size={16} />
          </button>
        </>
      )}
    </>
  );
}
