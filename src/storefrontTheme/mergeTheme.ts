import type { ThemeConfig, ThemeConfigOverride } from './types';
import { defaultTheme } from './defaultTheme';
import { themePresets } from './themePresets';
import type { Store } from '../lib/types';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Só é chamada quando base e override são ambos objectos simples (isPlainObject
// filtra arrays antes de recursar), por isso não precisa de tratar arrays aqui —
// arrays (ex: footer.columns, hero.slides) são sempre substituídos inteiros, nunca fundidos.
function deepMerge<T>(base: T, override: unknown): T {
  if (!isPlainObject(override)) return base;
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override)) {
    const baseValue = (base as Record<string, unknown>)?.[key];
    const overrideValue = override[key];
    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      result[key] = deepMerge(baseValue, overrideValue);
    } else if (overrideValue !== undefined) {
      result[key] = overrideValue;
    }
  }
  return result as T;
}

/** Lê theme_config da loja com segurança (pode vir como string JSON, objecto já parseado, ou nada). */
function parseStoreThemeConfig(raw: Store['theme_config']): ThemeConfigOverride {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw as ThemeConfigOverride;
}

/**
 * Combina o tema por omissão ("Standard Ecommerce") com, por ordem de
 * precedência:
 *   1. o preset do tema escolhido no dashboard (theme_id) — dá a identidade
 *      base do tema multi-tema antigo;
 *   2. o override guardado na loja (theme_config) — personalização fina da loja,
 *      vence sempre o preset;
 *   3. theme_primary como atalho de cor, apenas se theme_config não definir
 *      colors.primary explicitamente.
 */
export function mergeTheme(
  store: Pick<Store, 'theme_id' | 'theme_config' | 'theme_primary'> | null | undefined
): ThemeConfig {
  const override = parseStoreThemeConfig(store?.theme_config);
  const preset = store?.theme_id ? themePresets[store.theme_id] : undefined;
  let merged = deepMerge(defaultTheme, preset as unknown);
  merged = deepMerge(merged, override as unknown);
  if (!override.colors?.primary && store?.theme_primary) {
    merged = { ...merged, colors: { ...merged.colors, primary: store.theme_primary } };
  }
  return merged;
}
