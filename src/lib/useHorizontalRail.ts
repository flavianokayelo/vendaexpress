import { useEffect, useRef, useState } from 'react';

/** Lógica partilhada de uma calha com scroll horizontal + setas — usada por
 * ProductGrid (layout="rail") e CategoryGrid. Mantém uma única fonte da
 * verdade para o comportamento de "carrossel" em toda a loja. */
export function useHorizontalRail<T>(deps: T) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const update = () => {
    const el = railRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    const el = railRef.current;
    if (!el) return;
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [deps]);

  const scrollRail = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return { railRef, canScrollLeft, canScrollRight, scrollRail };
}
