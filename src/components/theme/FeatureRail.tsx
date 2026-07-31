import type { LucideIcon } from 'lucide-react';

export type FeatureItem = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
};

/** Fila de atalhos com ícone — navegação real para secções da própria página
 * (ou WhatsApp), não features fabricadas. */
export function FeatureRail({ items }: { items: FeatureItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="flex gap-1 overflow-x-auto rounded-[var(--sf-radius-sm)] border border-[var(--sf-line)] bg-[var(--sf-surface)] px-2 py-3">
      {items.map(({ icon: Icon, label, onClick, href }) => {
        const content = (
          <>
            <span
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px]"
              style={{ background: 'color-mix(in srgb, var(--sf-primary) 10%, transparent)', color: 'var(--sf-primary)' }}
            >
              <Icon size={19} strokeWidth={1.7} />
            </span>
            <span className="text-center text-[10px] font-medium leading-tight text-[var(--sf-ink-secondary)]">
              {label}
            </span>
          </>
        );
        const className = 'flex min-w-[64px] flex-1 flex-shrink-0 flex-col items-center gap-1.5';
        return href ? (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {content}
          </a>
        ) : (
          <button key={label} type="button" onClick={onClick} className={className}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
