import type { ReactNode } from 'react';
import { Reveal } from './Reveal';

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
    <div className={`py-3 ${dark ? 'bg-[var(--sf-ink)]' : ''} ${className}`}>
      <div className="mx-auto max-w-[1240px] px-2 sm:px-4">
        {title && (
          <Reveal className="mb-2.5 flex items-center gap-2">
            {icon && (
              <span className={dark ? 'text-white' : 'text-[var(--sf-primary)]'}>{icon}</span>
            )}
            <h2 className={`text-[15px] font-bold ${dark ? 'text-white' : 'text-[var(--sf-ink)]'}`}>{title}</h2>
          </Reveal>
        )}
        {!title && icon && <Reveal className="mb-2.5 flex items-center gap-2">{icon}</Reveal>}
        {children}
      </div>
    </div>
  );
}
