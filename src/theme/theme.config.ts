import type { ThemeConfig, ComponentTokens, FullTokenSet, ThemeDefinition } from './types';

export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export interface ThemeOverride {
  config?: DeepPartial<ThemeConfig>;
  tokens?: DeepPartial<FullTokenSet>;
  components?: DeepPartial<ComponentTokens>;
}

export function resolveTheme(theme: ThemeDefinition, override?: ThemeOverride): ThemeDefinition {
  if (!override) return theme;

  const resolved: ThemeDefinition = {
    ...theme,
    config: { ...theme.config, ...override.config } as ThemeConfig,
    tokens: deepMerge(theme.tokens, override.tokens ?? {}) as FullTokenSet,
    components: deepMerge(theme.components, override.components ?? {}) as ComponentTokens,
  };
  return resolved;
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: DeepPartial<T>): T {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const k = key as keyof T;
    if (
      override[k] !== null &&
      override[k] !== undefined &&
      typeof override[k] === 'object' &&
      !Array.isArray(override[k]) &&
      typeof base[k] === 'object' &&
      !Array.isArray(base[k])
    ) {
      result[k] = deepMerge(
        base[k] as Record<string, unknown>,
        override[k] as Record<string, unknown>,
      ) as T[keyof T];
    } else if (override[k] !== undefined) {
      result[k] = override[k] as T[keyof T];
    }
  }
  return result;
}
