import type { ThemeButtons } from '../../storefrontTheme/types';

// Classes literais (não dinâmicas) para o Tailwind JIT as detetar. O estilo
// decide o tratamento (sólido/contorno/pílula); o token decide o raio.
const BUTTON_STYLE_PRIMARY: Record<ThemeButtons['style'], string> = {
  solid:
    'bg-[var(--sf-primary)] text-white hover:bg-[var(--sf-primary-hover)]',
  outline:
    'border border-[var(--sf-primary)] text-[var(--sf-primary)] hover:bg-[color-mix(in_srgb,var(--sf-primary)_8%,transparent)]',
  pill: 'bg-[var(--sf-primary)] text-white hover:bg-[var(--sf-primary-hover)]',
};

const BUTTON_STYLE_SECONDARY: Record<ThemeButtons['style'], string> = {
  solid:
    'border border-[var(--sf-line)] bg-[var(--sf-surface)] text-[var(--sf-ink)] hover:border-[var(--sf-primary)]',
  outline:
    'border border-[var(--sf-primary)] text-[var(--sf-primary)] hover:bg-[color-mix(in_srgb,var(--sf-primary)_8%,transparent)]',
  pill:
    'border border-[var(--sf-line)] bg-[var(--sf-surface)] text-[var(--sf-ink)] hover:border-[var(--sf-primary)]',
};

const BUTTON_RADIUS: Record<ThemeButtons['radius'], string> = {
  sm: 'rounded-[var(--sf-radius-sm)]',
  md: 'rounded-[var(--sf-radius-md)]',
  lg: 'rounded-[var(--sf-radius-lg)]',
  pill: 'rounded-[var(--sf-radius-pill)]',
};

/** Classes de botão derivadas de `theme.buttons`. `primary` = ação principal;
 * `secondary` = ação neutra/secundária. */
export function themeButton(buttons: ThemeButtons, kind: 'primary' | 'secondary' = 'primary'): string {
  const style = kind === 'primary' ? BUTTON_STYLE_PRIMARY[buttons.style] : BUTTON_STYLE_SECONDARY[buttons.style];
  return `${BUTTON_RADIUS[buttons.radius]} ${style}`;
}
