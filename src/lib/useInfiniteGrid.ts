// Hook core de grelha infinito/"carregar mais": paga à medida que o utilizador
// chega ao fim (IntersectionObserver num sentinel). Extraído porque era copiado
// em todos os ProductGrid dos temas (PAGE_SIZE diferia de tema para tema).
import { useEffect, useRef, useState } from "react";

export function useInfiniteGrid<T>(items: T[], pageSize: number, enabled: boolean) {
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [items, pageSize]);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((v) => Math.min(v + pageSize, items.length));
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, pageSize, items.length]);

  const visible = enabled ? items.slice(0, visibleCount) : items;

  return { visible, visibleCount, sentinelRef };
}