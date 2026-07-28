import type { FullTokenSet, ComponentTokens } from '../../theme/types';

export const tokens: FullTokenSet = {
  colors: {
    primary: '#be123c',
    'primary-foreground': '#ffffff',
    secondary: '#fdf2f8',
    'secondary-foreground': '#831843',
    accent: '#f43f5e',
    'accent-foreground': '#ffffff',
    surface: '#ffffff',
    background: '#fff5f8',
    muted: '#fdf2f8',
    'muted-foreground': '#9d174d',
    success: '#16a34a',
    danger: '#e11d48',
    warning: '#f59e0b',
    info: '#7c3aed',
    border: '#fce7f3',
    text: '#4c0519',
    'text-secondary': '#9d174d',
  },
  radius: { none: '0', sm: '0.375rem', md: '0.75rem', lg: '1rem', xl: '1.5rem', '2xl': '2rem', full: '9999px' },
  shadows: { sm: '0 1px 3px 0 rgba(190,18,60,0.06)', md: '0 4px 14px 0 rgba(190,18,60,0.1)', lg: '0 10px 30px 0 rgba(190,18,60,0.12)', xl: '0 20px 60px 0 rgba(190,18,60,0.15)', glass: '0 8px 32px 0 rgba(190,18,60,0.08)' },
  typography: {
    'font-family': "'Outfit', ui-sans-serif, system-ui, sans-serif",
    'font-family-heading': "'Outfit', ui-sans-serif, system-ui, sans-serif",
    'font-family-mono': "'JetBrains Mono', ui-monospace, monospace",
    'heading-1': '2.75rem', 'heading-2': '2rem', 'heading-3': '1.375rem', 'heading-4': '1.125rem',
    body: '1rem', small: '0.875rem', xs: '0.75rem',
    'line-height-tight': '1.15', 'line-height-normal': '1.5', 'line-height-relaxed': '1.7',
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2.5rem', '2xl': '4rem', '3xl': '6rem', 'section-y': '6rem' },
  motion: {
    'duration-fast': '200ms', 'duration-normal': '350ms', 'duration-slow': '600ms',
    ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)', 'ease-in': 'cubic-bezier(0.36, 0, 0.66, -0.56)', 'ease-out': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    'delay-none': '0ms', 'delay-sm': '100ms', 'delay-md': '200ms',
    'transition-base': 'all 350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    'hover-lift': 'translateY(-3px)', 'hover-scale': 'scale(1.04)',
  },
};

export const components: ComponentTokens = {
  button: { 'border-radius': '9999px', 'font-size': '0.875rem', 'font-weight': '600', 'padding-x': '1.5rem', 'padding-y': '0.75rem', gap: '0.5rem', 'icon-size': '1rem' },
  card: { 'border-radius': '1rem', padding: '1.25rem', shadow: '0 4px 14px 0 rgba(190,18,60,0.1)', background: '#ffffff', 'border-color': '#fce7f3' },
  form: { 'input-border-radius': '9999px', 'input-border-color': '#fce7f3', 'input-focus-ring': '0 0 0 3px rgba(190,18,60,0.15)', 'input-padding-x': '1rem', 'input-padding-y': '0.75rem', 'label-font-size': '0.875rem', 'label-font-weight': '600' },
  header: { height: '4rem', background: '#ffffff', 'text-color': '#4c0519', 'border-color': '#fce7f3', 'sticky-background': 'rgba(255,255,255,0.95)' },
  footer: { background: '#4c0519', 'text-color': '#fdf2f8', 'link-color': '#f43f5e', 'padding-y': '4rem' },
  hero: { 'min-height': '80vh', 'overlay-color': 'rgba(190,18,60,0.3)', 'title-font-size': '3.5rem', 'title-font-weight': '700', 'subtitle-font-size': '1.125rem' },
  banner: { 'border-radius': '1rem', 'aspect-ratio': '21 / 9' },
  section: { 'padding-y': '6rem', 'padding-y-mobile': '3rem', 'title-size': '2rem', gap: '2rem' },
  animation: { 'hero-fade-duration': '0.9s', 'card-hover-scale': '1.04', 'stagger-delay': '0.08s', 'slide-distance': '35px' },
};
