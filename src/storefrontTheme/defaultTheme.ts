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
    fontDisplay: "'Inter', ui-sans-serif, system-ui, sans-serif",
    fontBody: "'Inter', ui-sans-serif, system-ui, sans-serif",
  },
  radius: { sm: 8, md: 12, lg: 18, pill: 9999 },
  spacing: { unit: 8, sectionGap: 48 },
  // Sombras em camadas (blur pequeno e nítido + blur largo e suave) — a
  // técnica que dá sensação de profundidade "premium" em vez de sombra chapada.
  shadow: {
    sm: '0 1px 2px rgba(15,15,15,0.05), 0 1px 1px rgba(15,15,15,0.04)',
    md: '0 1px 2px rgba(15,15,15,0.04), 0 6px 16px -4px rgba(15,15,15,0.10)',
    lg: '0 2px 6px rgba(15,15,15,0.05), 0 16px 32px -8px rgba(15,15,15,0.14)',
    xl: '0 4px 12px rgba(15,15,15,0.06), 0 24px 48px -12px rgba(15,15,15,0.20)',
  },
  buttons: { style: 'solid', radius: 'md' },
  card: { style: 'padded-tint', imageAspect: '1:1', hoverEffect: 'lift' },
  header: { variant: 'standard', showAnnouncementBar: false },
  footer: {
    variant: 'full',
    showPaymentBadges: true,
    showNewsletter: false,
    // Preenchido dinamicamente pelo componente Footer a partir dos dados reais
    // da loja (categorias, whatsapp) — fica vazio aqui de propósito.
    columns: [],
    // Texto real de apoio (entrega, trocas, garantia, FAQ) — escrito pelo
    // lojista no dashboard e guardado em stores.theme_config.footer.supportItems.
    supportItems: [],
  },
  hero: { mode: 'carousel', slides: [] },
  banners: {},
  home: {
    sections: [
      { id: 'announcement', enabled: true },
      { id: 'hero', enabled: true },
      { id: 'promo-banners', enabled: true },
      { id: 'profile-bar', enabled: true },
      { id: 'tabs', enabled: true },
      { id: 'feature-rail', enabled: true },
      { id: 'vouchers', enabled: true },
      { id: 'categories', enabled: true },
      { id: 'promo', enabled: true },
      { id: 'featured', enabled: true },
      { id: 'catalog', enabled: true },
    ],
  },
};
