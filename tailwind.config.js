/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--theme-colors-primary)',
        'primary-foreground': 'var(--theme-colors-primary-foreground)',
        secondary: 'var(--theme-colors-secondary)',
        'secondary-foreground': 'var(--theme-colors-secondary-foreground)',
        accent: 'var(--theme-colors-accent)',
        'accent-foreground': 'var(--theme-colors-accent-foreground)',
        surface: 'var(--theme-colors-surface)',
        muted: 'var(--theme-colors-muted)',
        'muted-foreground': 'var(--theme-colors-muted-foreground)',
        success: 'var(--theme-colors-success)',
        danger: 'var(--theme-colors-danger)',
        warning: 'var(--theme-colors-warning)',
        info: 'var(--theme-colors-info)',
        border: 'var(--theme-colors-border)',
        text: 'var(--theme-colors-text)',
        'text-secondary': 'var(--theme-colors-text-secondary)',
      },
      fontFamily: {
        storefront: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['var(--theme-typography-font-family)'],
        heading: ['var(--theme-typography-font-family-heading)'],
        mono: ['var(--theme-typography-font-family-mono)'],
      },
      fontSize: {
        'heading-1': 'var(--theme-typography-heading-1)',
        'heading-2': 'var(--theme-typography-heading-2)',
        'heading-3': 'var(--theme-typography-heading-3)',
        'heading-4': 'var(--theme-typography-heading-4)',
      },
      borderRadius: {
        none: 'var(--theme-radius-none)',
        sm: 'var(--theme-radius-sm)',
        md: 'var(--theme-radius-md)',
        lg: 'var(--theme-radius-lg)',
        xl: 'var(--theme-radius-xl)',
        '2xl': 'var(--theme-radius-2xl)',
        full: 'var(--theme-radius-full)',
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,0.05)',
        'soft-lg': '0 20px 40px rgba(0,0,0,0.08)',
        theme: 'var(--theme-shadow-md)',
        'theme-lg': 'var(--theme-shadow-lg)',
        'theme-xl': 'var(--theme-shadow-xl)',
        'theme-glass': 'var(--theme-shadow-glass)',
      },
      spacing: {
        'section-y': 'var(--theme-spacing-section-y)',
      },
      transitionDuration: {
        fast: 'var(--theme-motion-duration-fast)',
        normal: 'var(--theme-motion-duration-normal)',
        slow: 'var(--theme-motion-duration-slow)',
      },
      transitionTimingFunction: {
        theme: 'var(--theme-motion-ease)',
      },
    },
  },
  plugins: [],
};
