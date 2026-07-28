import type { ThemeConfig } from './types';

// Tokens do "Standard Ecommerce", extraídos do design real do projecto de
// referência standart-ecommerce (app/globals.css), não do design.md (que tem
// discrepâncias confirmadas com o código). --radius-sm/md nunca são definidos
// na referência (bug); aqui definimos uma escala completa e coerente.
export const defaultTheme: ThemeConfig = {
  themeVersion: 'standard-ecommerce-v1',
  colors: {
    primary: '#1C22E8',
    primaryHover: '#1519C9',
    accent: '#D4AF37',
    ink: '#111827',
    inkSecondary: '#4B5563',
    surface: '#FFFFFF',
    surfaceMuted: '#FAFAFA',
    line: '#E8ECF0',
    success: '#1F9D55',
    danger: '#DC2626',
    warning: '#D97706',
  },
  typography: {
    fontDisplay: 'font-storefront',
    fontBody: 'font-storefront',
  },
  radius: { sm: 8, md: 12, lg: 18, pill: 9999 },
  spacing: { unit: 8, sectionGap: 48 },
  buttons: { style: 'solid', radius: 'md' },
  card: { style: 'padded-tint', imageAspect: '1:1', hoverEffect: 'lift' },
  header: { variant: 'standard', showAnnouncementBar: false, showMegaMenu: false },
  footer: {
    variant: 'full',
    showPaymentBadges: true,
    showNewsletter: false,
    // Preenchido dinamicamente pelo componente Footer a partir dos dados reais
    // da loja (categorias, whatsapp) — fica vazio aqui de propósito.
    columns: [],
  },
  hero: { mode: 'carousel', slides: [] },
  banners: {},
  home: { sectionOrder: ['hero', 'promo', 'featured', 'categories', 'catalog'] },
};
