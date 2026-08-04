// =============================================================================
// resolveConfig — resolve o ThemeConfig final de uma loja (engine v2).
//
// Fonte de verdade por ordem de precedência:
//   1. defaultTheme (tokens base "Aurora");
//   2. config.ts do tema escolhido (DNA tripartido: tokens + layout) — o tema;
//   3. theme_config da loja — SÓ tokens.* e capabilities.* (o layout é LOCKED
//      pelo tema, o lojista não o altera);
//   4. theme_primary como atalho de cor (só se theme_config não definir colors.primary).
import type { Store } from '../lib/types';
import { FALLBACK_THEME_ID, getThemeConfig } from '../storefront/engine/ThemeRegistry';
import { defaultTheme } from './defaultTheme';
import type {
  DeepPartial,
  ThemeCapabilities,
  ThemeConfig,
  ThemeConfigOverride,
  ThemeLayout,
  ThemeTokens,
} from './types';

/** Chaves de tokens que a loja pode sobrescrever — tudo o resto é LOCKED. */
const TOKEN_KEYS = [
  'themeVersion',
  'colors',
  'typography',
  'radius',
  'spacing',
  'shadow',
  'buttons',
  'card',
] as const;

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// Arrays (ex: footer.columns, hero.slides, home.sections) são sempre
// substituídos inteiros, nunca fundidos — por isso só faz deepMerge em objectos.
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

/** Mapeia os tokens de um tema (DeepPartial) para o shape do ThemeConfig. Os
 *  objectos aninhados (colors, etc.) fundem-se sobre o defaultTheme no deepMerge. */
function tokensToConfig(tokens: DeepPartial<ThemeTokens>): DeepPartial<ThemeConfig> {
  const out: DeepPartial<ThemeConfig> = {};
  if (tokens.colors !== undefined) out.colors = tokens.colors;
  if (tokens.typography !== undefined) out.typography = tokens.typography;
  if (tokens.radius !== undefined) out.radius = tokens.radius;
  if (tokens.spacing !== undefined) out.spacing = tokens.spacing;
  if (tokens.shadow !== undefined) out.shadow = tokens.shadow;
  if (tokens.buttons !== undefined) out.buttons = tokens.buttons;
  if (tokens.card !== undefined) out.card = tokens.card;
  return out;
}

/** Mapeia o layout de um tema (DeepPartial) para o shape do ThemeConfig. */
function layoutToConfig(layout: DeepPartial<ThemeLayout>): DeepPartial<ThemeConfig> {
  const out: DeepPartial<ThemeConfig> = {};
  if (layout.header !== undefined) out.header = layout.header;
  if (layout.footer !== undefined) out.footer = layout.footer;
  if (layout.hero !== undefined) out.hero = layout.hero;
  if (layout.banners !== undefined) out.banners = layout.banners;
  if (layout.home !== undefined) out.home = layout.home;
  if (layout.productCardVariant !== undefined) out.productCardVariant = layout.productCardVariant;
  if (layout.productGridVariant !== undefined) out.productGridVariant = layout.productGridVariant;
  return out;
}

/** Lê theme_config da loja com segurança (string JSON, objecto, ou nada). */
export function parseStoreThemeConfig(raw: Store['theme_config']): ThemeConfigOverride {
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
 * Resolve o ThemeConfig final. `store` é opcional — sem loja usa apenas o tema
 * por omissão (standard/Aurora).
 */
export function resolveConfig(
  themeId: string | null | undefined,
  store?: Pick<Store, 'theme_config' | 'theme_primary'> | null | undefined
): ThemeConfig {
  const id = themeId ?? FALLBACK_THEME_ID;
  const data = getThemeConfig(id);

  // 1 + 2: base + DNA do tema (tokens e layout).
  let merged = deepMerge(defaultTheme, tokensToConfig(data.tokens));
  merged = deepMerge(merged, layoutToConfig(data.layout));
  merged = deepMerge(merged, { capabilities: data.capabilities });

  // 3: overrides da loja — SÓ tokens.* (layout é LOCKED). Ignora tudo o resto.
  const storeOverride = parseStoreThemeConfig(store?.theme_config);
  const tokenOverride: Record<string, unknown> = {};
  for (const key of TOKEN_KEYS) {
    const value = (storeOverride as Record<string, unknown>)?.[key];
    if (value !== undefined) tokenOverride[key] = value;
  }
  merged = deepMerge(merged, tokenOverride);

  // capabilities também são overridable pela loja (info de runtime).
  if (isPlainObject(storeOverride.capabilities)) {
    merged = deepMerge(merged, {
      capabilities: storeOverride.capabilities as DeepPartial<ThemeCapabilities>,
    });
  }

  // 4: theme_primary como atalho de cor, só se theme_config não definir colors.primary.
  if (!storeOverride.colors?.primary && store?.theme_primary) {
    merged = { ...merged, colors: { ...merged.colors, primary: store.theme_primary } };
  }

  return merged;
}