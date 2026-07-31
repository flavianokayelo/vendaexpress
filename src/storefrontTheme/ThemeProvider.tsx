import { createContext, useContext, useMemo, type CSSProperties, type ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import type { ThemeConfig } from './types';

const ThemeContext = createContext<ThemeConfig | null>(null);

export function useStorefrontTheme(): ThemeConfig {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useStorefrontTheme() só pode ser usado dentro de <StorefrontThemeProvider>');
  return ctx;
}

function px(value: number) {
  return value >= 9999 ? '9999px' : `${value}px`;
}

/**
 * Aplica o ThemeConfig como CSS custom properties num wrapper, para que os
 * componentes de src/components/theme/ as consumam via classes Tailwind
 * arbitrárias (ex: bg-[var(--sf-primary)]) em vez de props soltas tipo
 * `accent` espalhadas por toda a árvore, como acontecia antes.
 */
export function StorefrontThemeProvider({
  theme,
  className = '',
  children,
}: {
  theme: ThemeConfig;
  className?: string;
  children: ReactNode;
}) {
  const style = useMemo<CSSProperties>(
    () => ({
      '--sf-primary': theme.colors.primary,
      '--sf-primary-hover': theme.colors.primaryHover ?? theme.colors.primary,
      '--sf-accent': theme.colors.accent ?? theme.colors.primary,
      '--sf-ink': theme.colors.ink,
      '--sf-ink-secondary': theme.colors.inkSecondary,
      '--sf-surface': theme.colors.surface,
      '--sf-surface-muted': theme.colors.surfaceMuted,
      '--sf-line': theme.colors.line,
      '--sf-success': theme.colors.success,
      '--sf-danger': theme.colors.danger,
      '--sf-warning': theme.colors.warning,
      '--sf-font-heading': theme.typography.fontDisplay,
      '--sf-font-body': theme.typography.fontBody,
      '--sf-radius-sm': px(theme.radius.sm),
      '--sf-radius-md': px(theme.radius.md),
      '--sf-radius-lg': px(theme.radius.lg),
      '--sf-radius-pill': px(theme.radius.pill),
    } as CSSProperties),
    [theme]
  );

  return (
    <ThemeContext.Provider value={theme}>
      <MotionConfig reducedMotion="user">
        <div className={`font-storefront ${className}`} style={style}>
          {children}
        </div>
      </MotionConfig>
    </ThemeContext.Provider>
  );
}
