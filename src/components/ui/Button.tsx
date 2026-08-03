import {
  type ButtonHTMLAttributes,
  type ReactNode,
  useEffect,
  useRef,
  useState,
  forwardRef,
} from 'react';
import { Loader2, Check, X } from 'lucide-react';

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

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  success?: boolean;
  error?: boolean;
  children: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    success = false,
    error = false,
    className = '',
    children,
    disabled,
    ...props
  }: ButtonProps,
  ref,
) {
  const [flashDone, setFlashDone] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (success || error) {
      setFlashDone(false);
      timerRef.current = window.setTimeout(() => setFlashDone(true), 1500);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [success, error]);

  const showSuccess = success && !flashDone;
  const showError = error && !flashDone;
  const isBusy = loading || showSuccess || showError;
  const isDisabled = disabled || isBusy;

  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-[9px] font-mono font-semibold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${
        showSuccess ? '!bg-success !border-success !text-white' : ''
      } ${showError ? '!bg-danger !border-danger !text-white' : ''} ${className}`}
      style={{ borderRadius: '2px' }}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : showSuccess ? (
        <Check size={15} />
      ) : showError ? (
        <X size={15} />
      ) : (
        children
      )}
    </button>
  );
});