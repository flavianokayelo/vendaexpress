// Mapa theme_id → ThemeConfigOverride. Liga os temas multi-tema antigos
// (src/themes/*/tokens.ts) ao sistema ativo do storefront (src/storefrontTheme).
// O dashboard grava theme_id na loja (api.stores.update) mas o mergeTheme
// ignorava-o; estes presets traduzem cada tema para o contrato do storefront
// (cores + radius) para que a escolha do tema mude realmente a loja pública.
//
// Nota sobre o contrato de cores: --sf-ink é usado como texto escuro E como
// fundo escuro (barra de categorias + footer com texto branco/slate). Por isso
// ink tem sempre de ser escuro; temas que no pack antigo eram dark (electronics)
// são aqui adaptados para o design claro do storefront.
import type { ThemeConfigOverride } from './types';

export const THEME_IDS = ['standard', 'luxury', 'minimal', 'fashion', 'electronics'] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const themePresets: Record<string, ThemeConfigOverride> = {
  // Indigo — o pack "standard" original (src/themes/standard/tokens.ts)
  standard: {
    colors: {
      primary: '#6366f1',
      primaryHover: '#4f46e5',
      accent: '#f59e0b',
      ink: '#0f172a',
      inkSecondary: '#64748b',
      surface: '#ffffff',
      surfaceMuted: '#f1f5f9',
      line: '#e2e8f0',
      success: '#22c55e',
      danger: '#ef4444',
      warning: '#f59e0b',
    },
    radius: { sm: 4, md: 8, lg: 12, pill: 9999 },
    buttons: { style: 'solid', radius: 'md' },
    card: { style: 'padded-tint' },
  },

  // Navy + dourado, serif, cantos curtos (src/themes/luxury/tokens.ts)
  luxury: {
    colors: {
      primary: '#1a1a2e',
      primaryHover: '#0f0f1a',
      accent: '#d4af37',
      ink: '#1a1a2e',
      inkSecondary: '#8a8070',
      surface: '#f8f5f0',
      surfaceMuted: '#ece8df',
      line: '#d4c9b8',
      success: '#2d6a4f',
      danger: '#9b2226',
      warning: '#e9c46a',
    },
    radius: { sm: 2, md: 4, lg: 6, pill: 9999 },
    buttons: { style: 'solid', radius: 'sm' },
    card: { style: 'bordered' },
  },

  // Preto/branco, sem radius nem sombras (src/themes/minimal/tokens.ts)
  minimal: {
    colors: {
      primary: '#18181b',
      primaryHover: '#000000',
      accent: '#000000',
      ink: '#09090b',
      inkSecondary: '#71717a',
      surface: '#ffffff',
      surfaceMuted: '#fafafa',
      line: '#e4e4e7',
      success: '#16a34a',
      danger: '#dc2626',
      warning: '#d97706',
    },
    radius: { sm: 0, md: 0, lg: 0, pill: 0 },
    buttons: { style: 'solid', radius: 'sm' },
    card: { style: 'flat' },
  },

  // Rosa/rose, cantos generosos, botões pill (src/themes/fashion/tokens.ts)
  fashion: {
    colors: {
      primary: '#be123c',
      primaryHover: '#9f1239',
      accent: '#f43f5e',
      ink: '#4c0519',
      inkSecondary: '#9d174d',
      surface: '#ffffff',
      surfaceMuted: '#fff5f8',
      line: '#fce7f3',
      success: '#16a34a',
      danger: '#e11d48',
      warning: '#f59e0b',
    },
    radius: { sm: 6, md: 12, lg: 16, pill: 9999 },
    buttons: { style: 'pill', radius: 'pill' },
    card: { style: 'padded-tint' },
  },

  // Azul + ciano, cantos curtos — pack antigo era dark, adaptado ao contrato claro
  // do storefront (src/themes/electronics/tokens.ts)
  electronics: {
    colors: {
      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      accent: '#06b6d4',
      ink: '#0f172a',
      inkSecondary: '#64748b',
      surface: '#ffffff',
      surfaceMuted: '#f1f5f9',
      line: '#cbd5e1',
      success: '#10b981',
      danger: '#ef4444',
      warning: '#f59e0b',
    },
    radius: { sm: 2, md: 4, lg: 6, pill: 9999 },
    buttons: { style: 'solid', radius: 'sm' },
    card: { style: 'padded-tint' },
  },
};
