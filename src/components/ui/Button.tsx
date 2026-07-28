import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

// bg-[var(--sf-primary,#1d4ed8)] usa a cor do tema quando está dentro da loja
// pública (StorefrontThemeProvider define --sf-primary); fora dela (dashboard,
// signup, etc.) a variável não existe e cai no azul por omissão do fallback.
const variants: Record<Variant, string> = {
  primary: 'bg-[var(--sf-primary,#1d4ed8)] text-white hover:bg-[var(--sf-primary-hover,#1e40af)] shadow-sm',
  secondary: 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
  ghost: 'text-slate-700 hover:bg-slate-100',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 bg-white',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--sf-radius-md,0.5rem)] font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--sf-primary,#2563eb)] focus:ring-offset-1 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
