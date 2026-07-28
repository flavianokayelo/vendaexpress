import type { FullTokenSet, ComponentTokens } from '../../theme/types';

export const tokens: FullTokenSet = {
  colors: {
    primary: '#2563eb',
    'primary-foreground': '#ffffff',
    secondary: '#0f172a',
    'secondary-foreground': '#e2e8f0',
    accent: '#06b6d4',
    'accent-foreground': '#ffffff',
    surface: '#ffffff',
    background: '#0a0a0f',
    muted: '#1e293b',
    'muted-foreground': '#94a3b8',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    border: '#1e293b',
    text: '#f1f5f9',
    'text-secondary': '#94a3b8',
  },
  radius: { none: '0', sm: '0.125rem', md: '0.25rem', lg: '0.375rem', xl: '0.5rem', '2xl': '0.75rem', full: '9999px' },
  shadows: { sm: '0 1px 2px 0 rgba(0,0,0,0.3)', md: '0 4px 6px -1px rgba(0,0,0,0.4)', lg: '0 10px 15px -3px rgba(0,0,0,0.5)', xl: '0 20px 25px -5px rgba(0,0,0,0.6)', glass: '0 8px 32px 0 rgba(37,99,235,0.15)' },
  typography: {
    'font-family': "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    'font-family-heading': "'Space Grotesk', ui-sans-serif, system-ui, sans-serif",
    'font-family-mono': "'JetBrains Mono', ui-monospace, monospace",
    'heading-1': '2.75rem', 'heading-2': '2rem', 'heading-3': '1.25rem', 'heading-4': '1rem',
    body: '1rem', small: '0.875rem', xs: '0.75rem',
    'line-height-tight': '1.1', 'line-height-normal': '1.5', 'line-height-relaxed': '1.7',
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '5rem', 'section-y': '5rem' },
  motion: {
    'duration-fast': '150ms', 'duration-normal': '300ms', 'duration-slow': '500ms',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)', 'ease-in': 'cubic-bezier(0.4, 0, 1, 1)', 'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
    'delay-none': '0ms', 'delay-sm': '100ms', 'delay-md': '200ms',
    'transition-base': 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    'hover-lift': 'translateY(-2px)', 'hover-scale': 'scale(1.02)',
  },
};

export const components: ComponentTokens = {
  button: { 'border-radius': '0.25rem', 'font-size': '0.875rem', 'font-weight': '500', 'padding-x': '1.25rem', 'padding-y': '0.625rem', gap: '0.5rem', 'icon-size': '1rem' },
  card: { 'border-radius': '0.375rem', padding: '1.25rem', shadow: '0 4px 6px -1px rgba(0,0,0,0.4)', background: '#1e293b', 'border-color': '#334155' },
  form: { 'input-border-radius': '0.25rem', 'input-border-color': '#334155', 'input-focus-ring': '0 0 0 2px rgba(37,99,235,0.4)', 'input-padding-x': '0.75rem', 'input-padding-y': '0.625rem', 'label-font-size': '0.875rem', 'label-font-weight': '500' },
  header: { height: '4rem', background: '#0a0a0f', 'text-color': '#f1f5f9', 'border-color': '#1e293b', 'sticky-background': 'rgba(10,10,15,0.98)' },
  footer: { background: '#000000', 'text-color': '#64748b', 'link-color': '#38bdf8', 'padding-y': '3rem' },
  hero: { 'min-height': '80vh', 'overlay-color': 'rgba(0,0,0,0.6)', 'title-font-size': '3rem', 'title-font-weight': '700', 'subtitle-font-size': '1.125rem' },
  banner: { 'border-radius': '0.375rem', 'aspect-ratio': '21 / 9' },
  section: { 'padding-y': '5rem', 'padding-y-mobile': '3rem', 'title-size': '1.75rem', gap: '1.5rem' },
  animation: { 'hero-fade-duration': '0.8s', 'card-hover-scale': '1.02', 'stagger-delay': '0.1s', 'slide-distance': '30px' },
};
