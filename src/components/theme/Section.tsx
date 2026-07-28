import type { ReactNode } from 'react';

export function Section({
  title,
  icon,
  children,
  dark,
  className = '',
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <div className={`py-6 ${dark ? 'bg-[var(--sf-ink)]' : ''} ${className}`}>
      <div className="mx-auto max-w-6xl px-4">
        {title && (
          <div className="mb-4 flex items-center gap-2">
            {icon}
            <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-[var(--sf-ink)]'}`}>{title}</h2>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
