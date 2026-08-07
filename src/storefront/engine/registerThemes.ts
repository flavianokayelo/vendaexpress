// =============================================================================
// registerThemes — registo dos temas da engine v2, com lazy loading.
//
// O tema standard é importado estaticamente e registado já no load do módulo:
// é o fallback obrigatório (qualquer loja/tema usa-o se o pedido falhar) e o
// "zero" garantido para as rotas públicas.
//
// Os restantes 9 temas são carregados SOB DEMANDA via ensureThemeLoaded(id)
// (dynamic import → cada tema no seu chunk). Isto evita que o bundle inicial
// arraste os componentes de todos os temas.
//
// As rotas públicas (home, produto, categoria, pesquisa) chamam registerThemes()
// para garantir o fallback, e ensureThemeLoaded(store.theme_id) antes de
// renderizar, para que o registry tenha sempre o tema pedido disponível.

import { registerTheme } from "./ThemeRegistry";
import { standardTheme } from "../themes/standard";
import type { ThemeContract } from "../contract";

// Loaders sob demanda, um por chunk. O import dinâmico usa caminhos estáticos
// para o bundler conseguir fazer code-split e tipar as entradas.
const LAZY_THEME_LOADERS: Record<string, () => Promise<ThemeContract>> = {
  luxury: () => import("../themes/luxury").then((m) => m.luxuryTheme),
  minimal: () => import("../themes/minimal").then((m) => m.minimalTheme),
  fashion: () => import("../themes/fashion").then((m) => m.fashionTheme),
  electronics: () => import("../themes/electronics").then((m) => m.electronicsTheme),
  modern: () => import("../themes/modern").then((m) => m.modernTheme),
  "fashion-luxe": () => import("../themes/fashion-luxe").then((m) => m.fashionLuxeTheme),
  "fresh-market": () => import("../themes/fresh-market").then((m) => m.freshMarketTheme),
  "auto-pro": () => import("../themes/auto-pro").then((m) => m.autoProTheme),
  "food-express": () => import("../themes/food-express").then((m) => m.foodExpressTheme),
};

let registered = false;
const loaded = new Set<string>();

export function registerThemes(): void {
  if (registered) return;
  registered = true;
  registerTheme(standardTheme);
}

/**
 * Garante que o tema pedido está registado no ThemeRegistry. O standard é
 * sempre registado (fallback); os restantes são importados dinamicamente na
 * primeira utilização e o resultado é reutilizado nas seguintes.
 *
 * Não lança: temas desconhecidos ou com falha de rede ficam no fallback
 * (standard), que o ThemeRegistry resolve automaticamente.
 */
export async function ensureThemeLoaded(id: string): Promise<void> {
  if (loaded.has(id)) return;
  const loader = LAZY_THEME_LOADERS[id];
  if (!loader) return;
  try {
    const theme = await loader();
    registerTheme(theme);
    loaded.add(id);
  } catch (err) {
    console.warn(`Falha ao carregar o tema "${id}" — usa-se o fallback.`, err);
  }
}
