import type { FullTokenSet, ComponentTokens } from './types';

type CSSVars = Record<string, string>;

function flattenTokens(obj: Record<string, Record<string, string>>, prefix: string): CSSVars {
  const result: CSSVars = {};
  for (const [group, values] of Object.entries(obj)) {
    for (const [key, value] of Object.entries(values)) {
      result[`--${prefix}-${group}-${key}`] = value;
    }
  }
  return result;
}

function flattenSingles(obj: Record<string, string>, prefix: string): CSSVars {
  const result: CSSVars = {};
  for (const [key, value] of Object.entries(obj)) {
    result[`--${prefix}-${key}`] = value;
  }
  return result;
}

export function tokensToCSSVars(tokens: FullTokenSet): CSSVars {
  return {
    ...flattenTokens({ colors: tokens.colors } as Record<string, Record<string, string>>, 'theme'),
    ...flattenTokens({ radius: tokens.radius } as Record<string, Record<string, string>>, 'theme'),
    ...flattenTokens({ shadow: tokens.shadows } as Record<string, Record<string, string>>, 'theme'),
    ...flattenTokens({ typography: tokens.typography } as Record<string, Record<string, string>>, 'theme'),
    ...flattenTokens({ spacing: tokens.spacing } as Record<string, Record<string, string>>, 'theme'),
    ...flattenTokens({ motion: tokens.motion } as Record<string, Record<string, string>>, 'theme'),
  };
}

export function componentTokensToCSSVars(components: ComponentTokens): CSSVars {
  const result: CSSVars = {};
  for (const [component, values] of Object.entries(components)) {
    Object.assign(result, flattenSingles(values as Record<string, string>, `theme-${component}`));
  }
  return result;
}

export function mergeTokenVars(tokens: FullTokenSet, components: ComponentTokens): CSSVars {
  return { ...tokensToCSSVars(tokens), ...componentTokensToCSSVars(components) };
}

export function injectCSSVars(vars: CSSVars, element: HTMLElement = document.documentElement): void {
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}
