// Hook core de feedback "adicionado ao carrinho" (botão fica verde "Adicionado"
// durante Nms e volta ao normal). Extraído porque era copiado em todos os ProductCard
// dos temas.
import { useCallback, useEffect, useRef, useState } from "react";

export function useAddedFeedback(ms = 1200): { justAdded: boolean; markAdded: () => void } {
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const markAdded = useCallback(() => {
    setJustAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setJustAdded(false), ms);
  }, [ms]);

  return { justAdded, markAdded };
}