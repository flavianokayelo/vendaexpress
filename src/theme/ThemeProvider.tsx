'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ThemeContext } from './ThemeContext';
import { loadTheme, ThemeLoadError } from './ThemeLoader';
import { getRegistryEntry, getAvailableThemes, buildRegistry } from './ThemeRegistry';
import { mergeTokenVars, injectCSSVars } from './tokens';
import { themeLogger } from './ThemeLogger';
import { validateTheme } from './ThemeValidator';
import { scanThemes } from './ThemeScanner';
import type { ThemeProviderProps, ThemeId, ThemeDefinition, Theme, ThemeManifest } from './types';

function themeToDefinition(theme: Theme): ThemeDefinition {
  return {
    id: theme.id,
    config: theme.config,
    tokens: theme.tokens,
    components: theme.components,
  };
}

export function ThemeProvider({
  initialThemeId = 'standard',
  colorMode: initialColorMode = 'light',
  children,
}: ThemeProviderProps) {
  const [themeId, setThemeIdState] = useState<ThemeId>(initialThemeId);
  const [theme, setThemeData] = useState<ThemeDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>(initialColorMode);
  const prevThemeIdRef = useRef(themeId);
  const registryBuiltRef = useRef(false);

  useEffect(() => {
    if (registryBuiltRef.current) return;
    registryBuiltRef.current = true;
    buildRegistry().then(() => {
      themeLogger.info('ThemeProvider', 'Registo de temas construído automaticamente');
    });
  }, []);

  const applyTheme = useCallback(async (id: ThemeId) => {
    setIsLoading(true);
    setError(null);
    themeLogger.info('ThemeProvider', `A aplicar tema "${id}"`);

    try {
      const loaded = await loadTheme(id);
      const def = themeToDefinition(loaded);

      const manifests = await scanThemes();
      const manifest = manifests.find((m) => m.id === id)?.manifest as ThemeManifest | undefined;
      const validation = validateTheme(id, manifest ?? null, loaded.tokens, loaded.components);

      if (!validation.valid) {
        const errors = validation.issues.filter((i) => i.level === 'error');
        themeLogger.warn('ThemeProvider', `Tema "${id}" carregado com erros de validação`, {
          errors: errors.map((e) => e.code),
        });
      } else {
        themeLogger.info('ThemeProvider', `Tema "${id}" validado com sucesso`);
      }

      const vars = mergeTokenVars(def.tokens, def.components);
      injectCSSVars(vars);
      setThemeData(def);
      setThemeIdState(id);
      themeLogger.info('ThemeProvider', `Tema "${id}" aplicado com ${Object.keys(vars).length} variáveis CSS`);
    } catch (err) {
      const msg = err instanceof ThemeLoadError ? err.message : `Erro inesperado ao carregar tema "${id}"`;
      setError(msg);
      themeLogger.error('ThemeProvider', msg, { themeId: id });

      if (id !== 'standard') {
        themeLogger.warn('ThemeProvider', `Fallback para tema standard após falha do tema "${id}"`);
        try {
          const fallback = await loadTheme('standard');
          const def = themeToDefinition(fallback);
          const vars = mergeTokenVars(def.tokens, def.components);
          injectCSSVars(vars);
          setThemeData(def);
          setThemeIdState('standard');
          themeLogger.info('ThemeProvider', 'Fallback para standard executado com sucesso');
        } catch {
          setThemeData(null);
          setThemeIdState('standard');
          themeLogger.error('ThemeProvider', 'Fallback para standard também falhou');
        }
      } else {
        setThemeData(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    applyTheme(themeId);
  }, [themeId, applyTheme]);

  useEffect(() => {
    const onThemeChange = () => applyTheme(themeId);
    window.addEventListener('venda-theme-change', onThemeChange as EventListener);
    return () => window.removeEventListener('venda-theme-change', onThemeChange as EventListener);
  }, [themeId, applyTheme]);

  const resolvedTheme = useMemo<ThemeDefinition>(() => {
    if (theme) return theme;
    const entry = getRegistryEntry(themeId);
    return {
      id: themeId,
      config: {
        name: themeId,
        label: entry?.label ?? themeId,
        description: entry?.description ?? '',
        version: entry?.version ?? '1.0.0',
      },
      tokens: {
        colors: {
          primary: '#6366f1', 'primary-foreground': '#ffffff',
          secondary: '#f1f5f9', 'secondary-foreground': '#1e293b',
          accent: '#f59e0b', 'accent-foreground': '#ffffff',
          surface: '#ffffff', background: '#f8fafc',
          muted: '#f1f5f9', 'muted-foreground': '#64748b',
          success: '#22c55e', danger: '#ef4444',
          warning: '#f59e0b', info: '#3b82f6',
          border: '#e2e8f0', text: '#0f172a', 'text-secondary': '#64748b',
        },
        radius: { none: '0', sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', '2xl': '1.5rem', full: '9999px' },
        shadows: { sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)', md: '0 4px 6px -1px rgb(0 0 0 / 0.1)', lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', glass: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' },
        typography: {
          'font-family': "'Inter', ui-sans-serif, system-ui, sans-serif",
          'font-family-heading': "'Inter', ui-sans-serif, system-ui, sans-serif",
          'font-family-mono': "'JetBrains Mono', ui-monospace, monospace",
          'heading-1': '2.5rem', 'heading-2': '2rem', 'heading-3': '1.5rem', 'heading-4': '1.125rem',
          body: '1rem', small: '0.875rem', xs: '0.75rem',
          'line-height-tight': '1.2', 'line-height-normal': '1.5', 'line-height-relaxed': '1.75',
        },
        spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem', 'section-y': '5rem' },
        motion: {
          'duration-fast': '150ms', 'duration-normal': '300ms', 'duration-slow': '500ms',
          ease: 'cubic-bezier(0.4, 0, 0.2, 1)', 'ease-in': 'cubic-bezier(0.4, 0, 1, 1)', 'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
          'delay-none': '0ms', 'delay-sm': '100ms', 'delay-md': '200ms',
          'transition-base': 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          'hover-lift': 'translateY(-2px)', 'hover-scale': 'scale(1.02)',
        },
      },
      components: {
        button: { 'border-radius': '0.5rem', 'font-size': '0.875rem', 'font-weight': '600', 'padding-x': '1.25rem', 'padding-y': '0.625rem', gap: '0.5rem', 'icon-size': '1rem' },
        card: { 'border-radius': '0.75rem', padding: '1rem', shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)', background: '#ffffff', 'border-color': '#e2e8f0' },
        form: { 'input-border-radius': '0.5rem', 'input-border-color': '#e2e8f0', 'input-focus-ring': '0 0 0 3px rgba(99, 102, 241, 0.2)', 'input-padding-x': '0.75rem', 'input-padding-y': '0.625rem', 'label-font-size': '0.875rem', 'label-font-weight': '500' },
        header: { height: '4rem', background: '#ffffff', 'text-color': '#0f172a', 'border-color': '#e2e8f0', 'sticky-background': 'rgba(255,255,255,0.95)' },
        footer: { background: '#0f172a', 'text-color': '#cbd5e1', 'link-color': '#94a3b8', 'padding-y': '3rem' },
        hero: { 'min-height': '70vh', 'overlay-color': 'rgba(0,0,0,0.4)', 'title-font-size': '3.5rem', 'title-font-weight': '800', 'subtitle-font-size': '1.25rem' },
        banner: { 'border-radius': '0.75rem', 'aspect-ratio': '21 / 9' },
        section: { 'padding-y': '5rem', 'padding-y-mobile': '3rem', 'title-size': '2rem', gap: '2rem' },
        animation: { 'hero-fade-duration': '0.8s', 'card-hover-scale': '1.03', 'stagger-delay': '0.1s', 'slide-distance': '30px' },
      },
    };
  }, [theme, themeId]);

  const setTheme = useCallback(async (id: ThemeId) => {
    if (id === prevThemeIdRef.current) return;
    prevThemeIdRef.current = id;
    setThemeIdState(id);
  }, []);

  const availableThemes = useMemo(() => getAvailableThemes(), []);

  const value = useMemo(() => ({
    themeId,
    theme,
    resolvedTheme,
    isLoading,
    error,
    setTheme,
    availableThemes,
    colorMode,
  }), [themeId, theme, resolvedTheme, isLoading, error, setTheme, availableThemes, colorMode]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function injectThemeVars(themeId: ThemeId): void {
  loadTheme(themeId).then((loaded) => {
    const def = themeToDefinition(loaded);
    const vars = mergeTokenVars(def.tokens, def.components);
    injectCSSVars(vars);
    themeLogger.info('ThemeProvider', `Variáveis CSS do tema "${themeId}" injetadas manualmente`);
    window.dispatchEvent(new CustomEvent('venda-theme-change', { detail: { themeId } }));
  });
}
