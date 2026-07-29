import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';

const baseInput =
  'w-full border border-border-2 bg-white px-3 py-[11px] text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none transition-colors';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseInput} ${className}`} style={{ borderRadius: '2px' }} {...props} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseInput} ${className}`} style={{ borderRadius: '2px' }} {...props} />;
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select className={`${baseInput} ${className}`} style={{ borderRadius: '2px' }} {...props}>{children}</select>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[13px] font-semibold text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block font-mono text-[11px] text-ink-2">{hint}</span>}
    </label>
  );
}
