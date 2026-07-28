import type { FullTokenSet, ComponentTokens } from '../../theme/types';

export const tokens: FullTokenSet = {
  colors: {
    primary: '#18181b',
    'primary-foreground': '#fafafa',
    secondary: '#f4f4f5',
    'secondary-foreground': '#18181b',
    accent: '#000000',
    'accent-foreground': '#ffffff',
    surface: '#ffffff',
    background: '#fafafa',
    muted: '#f4f4f5',
    'muted-foreground': '#71717a',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#d97706',
    info: '#2563eb',
    border: '#e4e4e7',
    text: '#09090b',
    'text-secondary': '#71717a',
  },
  radius: { none: '0', sm: '0', md: '0', lg: '0', xl: '0', '2xl': '0', full: '0' },
  shadows: { sm: 'none', md: 'none', lg: 'none', xl: 'none', glass: 'none' },
  typography: {
    'font-family': "'Inter', ui-sans-serif, system-ui, sans-serif",
    'font-family-heading': "'Inter', ui-sans-serif, system-ui, sans-serif",
    'font-family-mono': "'JetBrains Mono', ui-monospace, monospace",
    'heading-1': '3rem', 'heading-2': '2rem', 'heading-3': '1.25rem', 'heading-4': '1rem',
    body: '1rem', small: '0.875rem', xs: '0.75rem',
    'line-height-tight': '1.1', 'line-height-normal': '1.5', 'line-height-relaxed': '1.75',
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '2rem', xl: '3rem', '2xl': '5rem', '3xl': '8rem', 'section-y': '8rem' },
  motion: {
    'duration-fast': '100ms', 'duration-normal': '200ms', 'duration-slow': '400ms',
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)', 'ease-in': 'cubic-bezier(0.4, 0, 1, 1)', 'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'delay-none': '0ms', 'delay-sm': '50ms', 'delay-md': '100ms',
    'transition-base': 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
    'hover-lift': 'translateY(-1px)', 'hover-scale': 'scale(1.01)',
  },
};

export const components: ComponentTokens = {
  button: { 'border-radius': '0', 'font-size': '0.875rem', 'font-weight': '500', 'padding-x': '1.5rem', 'padding-y': '0.75rem', gap: '0.5rem', 'icon-size': '1rem' },
  card: { 'border-radius': '0', padding: '0', shadow: 'none', background: 'transparent', 'border-color': '#e4e4e7' },
  form: { 'input-border-radius': '0', 'input-border-color': '#e4e4e7', 'input-focus-ring': '0 0 0 1px #18181b', 'input-padding-x': '0.75rem', 'input-padding-y': '0.75rem', 'label-font-size': '0.8125rem', 'label-font-weight': '500' },
  header: { height: '3.5rem', background: '#ffffff', 'text-color': '#09090b', 'border-color': '#e4e4e7', 'sticky-background': 'rgba(255,255,255,0.9)' },
  footer: { background: '#09090b', 'text-color': '#a1a1aa', 'link-color': '#f4f4f5', 'padding-y': '4rem' },
  hero: { 'min-height': '60vh', 'overlay-color': 'rgba(0,0,0,0.2)', 'title-font-size': '4rem', 'title-font-weight': '900', 'subtitle-font-size': '1.125rem' },
  banner: { 'border-radius': '0', 'aspect-ratio': '21 / 9' },
  section: { 'padding-y': '8rem', 'padding-y-mobile': '4rem', 'title-size': '1.5rem', gap: '3rem' },
  animation: { 'hero-fade-duration': '0.6s', 'card-hover-scale': '1.01', 'stagger-delay': '0.05s', 'slide-distance': '20px' },
};
