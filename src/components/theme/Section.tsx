import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { Reveal } from './Reveal';

export function Section({
  title,
  icon,
  children,
  dark,
  className = '',
  onViewAll,
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  dark?: boolean;
  className?: string;
  /** Link "Ver tudo" no canto direito do título — omitido se não fizer sentido pra secção. */
  onViewAll?: () => void;
}) {
  return (
    <div className={`py-[var(--sf-section-gap)] ${dark ? 'bg-[var(--sf-ink)]' : ''} ${className}`}>
      <div className="mx-auto max-w-[1240px] px-2 sm:px-4">
        {title && (
          <Reveal className="mb-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className={`h-5 w-[3px] flex-shrink-0 rounded-full ${dark ? 'bg-white/40' : 'bg-[var(--sf-primary)]'}`} />
              {icon && (
                <span
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[var(--sf-radius-sm)] ${
                    dark ? 'bg-white/10 text-white' : 'text-[var(--sf-primary)]'
                  }`}
                  style={dark ? undefined : { background: 'color-mix(in srgb, var(--sf-primary) 10%, transparent)' }}
                >
                  {icon}
                </span>
              )}
              <h2
                className={`text-[17px] font-bold tracking-[-0.012em] ${dark ? 'text-white' : 'text-[var(--sf-ink)]'}`}
              >
                {title}
              </h2>
            </div>
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className={`group flex flex-shrink-0 items-center gap-0.5 text-[12px] font-semibold transition-colors duration-150 ${
                  dark ? 'text-white/70 hover:text-white' : 'text-[var(--sf-ink-secondary)] hover:text-[var(--sf-primary)]'
                }`}
              >
                Ver tudo
                <ChevronRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
            )}
          </Reveal>
        )}
        {!title && icon && <Reveal className="mb-2.5 flex items-center gap-2">{icon}</Reveal>}
        {children}
      </div>
    </div>
  );
}
