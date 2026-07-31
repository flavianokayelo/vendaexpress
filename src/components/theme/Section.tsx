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
    <div className={`py-[26px] ${dark ? 'bg-[#2f3b46]' : ''} ${className}`}>
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        {title && (
          <div className="mb-[22px] flex items-center gap-3.5">
            {icon && (
              <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] ${
                  dark
                    ? 'bg-white/10 text-white'
                    : 'bg-[var(--sf-primary)]/[0.1] text-[var(--sf-primary)]'
                }`}
              >
                {icon}
              </span>
            )}
            <h2
              className={`font-display text-[28px] font-semibold leading-none tracking-[-0.015em] ${
                dark ? 'text-white' : 'text-[var(--sf-ink)]'
              }`}
            >
              {title}
            </h2>
          </div>
        )}
        {!title && icon && (
          <div className="mb-[22px] flex items-center gap-2.5">
            {icon}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
