import type { FullTokenSet, ComponentTokens } from '../../theme/types';

export const tokens: FullTokenSet = {
  colors: {
    primary: '#1a1a2e',
    'primary-foreground': '#f8f5f0',
    secondary: '#c9a96e',
    'secondary-foreground': '#ffffff',
    accent: '#d4af37',
    'accent-foreground': '#1a1a2e',
    surface: '#f8f5f0',
    background: '#ece8df',
    muted: '#e8e3d8',
    'muted-foreground': '#8a8070',
    success: '#2d6a4f',
    danger: '#9b2226',
    warning: '#e9c46a',
    info: '#457b9d',
    border: '#d4c9b8',
    text: '#1a1a2e',
    'text-secondary': '#8a8070',
  },
  radius: { none: '0', sm: '0.125rem', md: '0.25rem', lg: '0.375rem', xl: '0.5rem', '2xl': '0.75rem', full: '9999px' },
  shadows: { sm: '0 1px 3px 0 rgba(0,0,0,0.06)', md: '0 4px 12px 0 rgba(0,0,0,0.08)', lg: '0 8px 24px 0 rgba(0,0,0,0.1)', xl: '0 16px 48px 0 rgba(0,0,0,0.12)', glass: '0 8px 32px 0 rgba(26,26,46,0.12)' },
  typography: {
    'font-family': "'Playfair Display', Georgia, serif",
    'font-family-heading': "'Playfair Display', Georgia, serif",
    'font-family-mono': "'Cormorant Garamond', Georgia, serif",
    'heading-1': '3rem', 'heading-2': '2.25rem', 'heading-3': '1.75rem', 'heading-4': '1.25rem',
    body: '1.0625rem', small: '0.9375rem', xs: '0.8125rem',
    'line-height-tight': '1.15', 'line-height-normal': '1.5', 'line-height-relaxed': '1.7',
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '2rem', xl: '3rem', '2xl': '4rem', '3xl': '6rem', 'section-y': '6rem' },
  motion: {
    'duration-fast': '200ms', 'duration-normal': '400ms', 'duration-slow': '700ms',
    ease: 'cubic-bezier(0.22, 1, 0.36, 1)', 'ease-in': 'cubic-bezier(0.55, 0, 1, 0.45)', 'ease-out': 'cubic-bezier(0, 0.55, 0.45, 1)',
    'delay-none': '0ms', 'delay-sm': '150ms', 'delay-md': '300ms',
    'transition-base': 'all 400ms cubic-bezier(0.22, 1, 0.36, 1)',
    'hover-lift': 'translateY(-4px)', 'hover-scale': 'scale(1.03)',
  },
};

export const components: ComponentTokens = {
  button: { 'border-radius': '0.125rem', 'font-size': '0.8125rem', 'font-weight': '400', 'padding-x': '2rem', 'padding-y': '0.75rem', gap: '0.75rem', 'icon-size': '1rem' },
  card: { 'border-radius': '0.25rem', padding: '1.5rem', shadow: '0 4px 12px 0 rgba(0,0,0,0.08)', background: '#f8f5f0', 'border-color': '#d4c9b8' },
  form: { 'input-border-radius': '0.125rem', 'input-border-color': '#d4c9b8', 'input-focus-ring': '0 0 0 2px rgba(201,169,110,0.3)', 'input-padding-x': '1rem', 'input-padding-y': '0.75rem', 'label-font-size': '0.8125rem', 'label-font-weight': '500' },
  header: { height: '5rem', background: '#1a1a2e', 'text-color': '#f8f5f0', 'border-color': 'rgba(248,245,240,0.1)', 'sticky-background': 'rgba(26,26,46,0.98)' },
  footer: { background: '#0f0f1a', 'text-color': '#a09888', 'link-color': '#c9a96e', 'padding-y': '4rem' },
  hero: { 'min-height': '85vh', 'overlay-color': 'rgba(26,26,46,0.5)', 'title-font-size': '4rem', 'title-font-weight': '400', 'subtitle-font-size': '1.25rem' },
  banner: { 'border-radius': '0.25rem', 'aspect-ratio': '21 / 9' },
  section: { 'padding-y': '6rem', 'padding-y-mobile': '3rem', 'title-size': '2.25rem', gap: '3rem' },
  animation: { 'hero-fade-duration': '1s', 'card-hover-scale': '1.03', 'stagger-delay': '0.15s', 'slide-distance': '40px' },
};
