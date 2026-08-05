// =============================================================================
// ThemeRegistry — resolução de temas com fallback previsível (engine v2).
//
// - registerTheme() adiciona um tema (importado estaticamente) ao mapa, MAS o
//   validator veta temas quebrados (ERROR): não entram no mapa e o storefront
//   usa o fallback (standard). Ids duplicados também são ignorados.
// - resolveTheme(id) devolve o tema pedido se estiver registado; senão cai
//   para o tema fallback (standard) sem lançar.
// - getThemeComponents(id) devolve os componentes do tema, com fallback
//   componente-a-componente para o tema standard.
// - getThemeConfig(id) devolve o DNA (config.ts) do tema, para o resolveConfig.
import type { ThemeComponents, ThemeContract, ThemePages } from "../contract";
import { OPTIONAL_PAGES } from "../contract";
import type { ThemeConfigData } from "../../storefrontTheme/types";
import { hasBlockingIssues, validateTheme } from "./ThemeValidator";

export const FALLBACK_THEME_ID = "standard";

const registry = new Map<string, ThemeContract>();
let fallback: ThemeContract | null = null;

function isPresent(t: ThemeContract | null | undefined): t is ThemeContract {
  return !!t;
}

export function registerTheme(theme: ThemeContract): void {
  if (!theme || !theme.id) return;
  if (registry.has(theme.id)) {
    console.warn(`Tema "${theme.id}" já registado — registo duplicado ignorado (mantém-se o primeiro).`);
    return;
  }
  const issues = validateTheme(theme, theme.id);
  if (hasBlockingIssues(issues)) {
    console.warn(
      `Tema "${theme.id}" bloqueado pelo validator (usa-se o fallback): ${issues
        .filter((i) => i.level === "error")
        .map((i) => i.code)
        .join("; ")}`,
    );
    return;
  }
  registry.set(theme.id, theme);
  if (theme.id === FALLBACK_THEME_ID) {
    fallback = theme;
  }
  const notes = issues.filter((i) => i.level !== "error");
  if (notes.length > 0) {
    console.info(
      `Tema "${theme.id}" registado (${notes.length} avisos/info): ${notes
        .map((i) => i.code)
        .join("; ")}`,
    );
  }
}

function getStandard(): ThemeContract | null {
  if (isPresent(fallback)) return fallback;
  return registry.get(FALLBACK_THEME_ID) ?? null;
}

/** Tema pedido, se registado e válido; caso contrário o fallback (standard). */
export function resolveTheme(id: string): ThemeContract | null {
  const requested = registry.get(id);
  if (requested) return requested;
  return getStandard();
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

  const source = requested ?? std;
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

/**
 * Páginas do tema pedido, com fallback página-a-página para o standard.
 * Home é sempre preenchida (obrigatória); as opcionais usam o fallback partilhado.
 */
export function getThemePages(id: string): ThemePages {
  const source = resolveTheme(id);
  const std = getStandard();
  const home = source?.pages.Home ?? std?.pages.Home;
  if (!home) {
    throw new Error(
      `Nenhuma Home disponível para o tema "${id}" (nem fallback "${FALLBACK_THEME_ID}") — não é possível renderizar o storefront.`,
    );
  }
  const pages: ThemePages = { Home: home };
  for (const name of OPTIONAL_PAGES) {
    const fromSource = source?.pages[name];
    const fromStd = std?.pages[name];
    if (typeof fromSource === "function") pages[name] = fromSource;
    else if (typeof fromStd === "function") pages[name] = fromStd;
  }
  return pages;
}

/**
 * Página de tema pedida (ex: "Product"): usa a do tema pedido se existir;
 * senão a do fallback standard. Home (obrigatória) cai sempre para a do
 * standard se o tema não tiver. Nunca devolve undefined para chaves válidas
 * com fallback presente.
 */
export function getThemePage(
  id: string,
  key: keyof ThemePages,
): NonNullable<ThemePages[keyof ThemePages]> | null {
  const source = resolveTheme(id);
  const std = getStandard();
  const fromSource = source?.pages[key];
  const fromStd = std?.pages[key];
  const resolved =
    (typeof fromSource === "function"
      ? fromSource
      : typeof fromStd === "function"
        ? fromStd
        : undefined) ?? null;
  return resolved as NonNullable<ThemePages[keyof ThemePages]> | null;
}

/**
 * DNA (config.ts) do tema pedido; se o tema não estiver registado (ou for o
 * fallback), devolve o DNA do standard. Nunca lança a menos que nem o fallback
 * exista — nesse caso não há como resolver tokens e o erro é voluntariamente ruidoso.
 */
export function getThemeConfig(id: string): ThemeConfigData {
  const requested = registry.get(id);
  const std = getStandard();
  const source = requested ?? std;
  if (!source?.config) {
    throw new Error(
      `Tema "${id}" (ou fallback "${FALLBACK_THEME_ID}") não tem config válida — resolveConfig não consegue continuar.`,
    );
  }
  return source.config;
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
