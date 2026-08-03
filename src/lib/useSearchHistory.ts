import { useCallback, useEffect, useState } from 'react';

const MAX_HISTORY = 8;

function keyFor(storeSlug: string) {
  return `ve_search_history_${storeSlug}`;
}

function read(storeSlug: string): string[] {
  try {
    const raw = localStorage.getItem(keyFor(storeSlug));
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function write(storeSlug: string, list: string[]) {
  try {
    localStorage.setItem(keyFor(storeSlug), JSON.stringify(list));
  } catch {
    // localStorage indisponível (modo privado, quota) — histórico fica só em memória.
  }
}

/** Histórico de buscas por loja (localStorage) — mais recente primeiro, sem duplicados. */
export function useSearchHistory(storeSlug: string) {
  const [history, setHistory] = useState<string[]>(() => read(storeSlug));

  useEffect(() => {
    setHistory(read(storeSlug));
  }, [storeSlug]);

  const addTerm = useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setHistory((prev) => {
        const next = [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(0, MAX_HISTORY);
        write(storeSlug, next);
        return next;
      });
    },
    [storeSlug],
  );

  const removeTerm = useCallback(
    (term: string) => {
      setHistory((prev) => {
        const next = prev.filter((t) => t !== term);
        write(storeSlug, next);
        return next;
      });
    },
    [storeSlug],
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    write(storeSlug, []);
  }, [storeSlug]);

  return { history, addTerm, removeTerm, clearHistory };
}
