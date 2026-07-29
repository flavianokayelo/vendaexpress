import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-primary border-ink',
  secondary: 'bg-ink text-paper hover:bg-ink/80 border-ink',
  ghost: 'text-ink-2 hover:text-ink hover:bg-black/5 border-transparent',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-paper bg-transparent',
  danger: 'bg-danger text-white hover:bg-red-700 border-danger',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-[18px] py-[11px] text-[13px]',
  lg: 'px-6 py-3.5 text-sm',
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
      className={`inline-flex items-center justify-center gap-[9px] font-mono font-semibold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      style={{ borderRadius: '2px' }}
      {...props}
    >
      {children}
    </button>
  );
}
