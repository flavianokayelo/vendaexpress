import type { ThemeConfig, ThemeConfigOverride } from './types';
import { defaultTheme } from './defaultTheme';
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
 * Combina o tema por omissão ("Standard Ecommerce") com o override guardado na
 * loja (theme_config), e por fim aplica theme_primary como atalho de cor caso
 * a loja não tenha definido colors.primary explicitamente dentro de theme_config.
 */
export function mergeTheme(store: Pick<Store, 'theme_config' | 'theme_primary'> | null | undefined): ThemeConfig {
  const override = parseStoreThemeConfig(store?.theme_config);
  let merged = deepMerge(defaultTheme, override as unknown);
  if (!override.colors?.primary && store?.theme_primary) {
    merged = { ...merged, colors: { ...merged.colors, primary: store.theme_primary } };
  }
  return merged;
}
