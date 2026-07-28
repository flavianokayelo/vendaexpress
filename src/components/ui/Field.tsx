import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from 'react';

const baseInput =
  'w-full rounded-[var(--sf-radius-md,0.5rem)] border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[var(--sf-primary,#2563eb)] focus:outline-none focus:ring-1 focus:ring-[var(--sf-primary,#2563eb)] transition-colors';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${baseInput} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${baseInput} ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select className={`${baseInput} ${className}`} {...props}>{children}</select>;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}
