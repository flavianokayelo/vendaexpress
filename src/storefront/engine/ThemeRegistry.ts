// =============================================================================
// ThemeRegistry — resolução de temas com fallback previsível.
//
// - registerTheme() adiciona um tema (importado estaticamente) ao mapa.
// - resolveTheme(id) devolve o tema pedido se for válido; senão cai para o
//   tema fallback (standard) sem lançar.
// - getThemeComponents(id) devolve os componentes do tema, com fallback
//   componente-a-componente para o tema standard (um tema que quebre só num
//   componente continua a renderizar o resto).
import type { ThemeComponents, ThemeContract } from "../contract";
import { ThemeValidationError, validateTheme } from "./ThemeValidator";

export const FALLBACK_THEME_ID = "standard";

const registry = new Map<string, ThemeContract>();
let fallback: ThemeContract | null = null;

function isPresent(t: ThemeContract | null | undefined): t is ThemeContract {
  return !!t;
}

export function registerTheme(theme: ThemeContract): void {
  if (!theme || !theme.id) return;
  registry.set(theme.id, theme);
  if (theme.id === FALLBACK_THEME_ID) {
    fallback = theme;
  }
}

function getStandard(): ThemeContract | null {
  if (isPresent(fallback)) return fallback;
  return registry.get(FALLBACK_THEME_ID) ?? null;
}

/** Tema pedido, se registado e válido; caso contrário o fallback (standard). */
export function resolveTheme(id: string): ThemeContract | null {
  const requested = registry.get(id);
  if (requested) {
    const issues = validateTheme(requested, id);
    if (issues.length === 0) return requested;
    console.warn(new ThemeValidationError(id, issues).message);
  }
  const std = getStandard();
  if (!std) return null;
  const stdIssues = validateTheme(std, FALLBACK_THEME_ID);
  if (stdIssues.length > 0) {
    console.error(`Tema fallback "${FALLBACK_THEME_ID}" está quebrado:`, stdIssues);
    return null;
  }
  return std;
}

/** Id do tema que vai ser usado de facto (o pedido, se válido; senão standard). */
export function resolveThemeId(id: string): string {
  return resolveTheme(id)?.id ?? FALLBACK_THEME_ID;
}

/**
 * Componentes do tema pedido, com fallback por componente para o tema standard.
 * Garante que nenhum componente em falta deixa o storefront sem renderizar.
 */
export function getThemeComponents(id: string): ThemeComponents {
  const requested = registry.get(id);
  const std = getStandard();

  const base = requested && validateTheme(requested, id).length === 0 ? requested : null;
  const source = base ?? std;
  if (!source) {
    throw new Error(
      `Nenhum tema registado (incluindo o fallback "${FALLBACK_THEME_ID}") — não é possível renderizar o storefront.`,
    );
  }

  // Em caso de componente em falta, cai para o tema standard (fallback por
  // componente), para que um tema que quebre só numa peça continue a renderizar.
  const card = source.components.ProductCard;
  const grid = source.components.ProductGrid;
  const cart = source.components.Cart;

  return {
    Header: pick(source, std, "Header"),
    Footer: pick(source, std, "Footer"),
    ProductCard:
      typeof card === "function" ? card : (std?.components.ProductCard ?? card),
    ProductGrid:
      typeof grid === "function" ? grid : (std?.components.ProductGrid ?? grid),
    Cart: typeof cart === "function" ? cart : (std?.components.Cart ?? cart),
  };
}

/** Devolve o componente do tema A; se estiver em falta, o do tema B (standard). */
function pick<K extends keyof ThemeComponents>(
  a: ThemeContract | null,
  b: ThemeContract | null,
  key: K,
): ThemeComponents[K] {
  const fromA = a?.components[key];
  const fromB = b?.components[key];
  return (typeof fromA === "function" ? fromA : fromB ?? fromA) as ThemeComponents[K];
}

export function getRegisteredThemeIds(): string[] {
  return Array.from(registry.keys());
}
