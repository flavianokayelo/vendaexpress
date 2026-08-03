import type { LucideIcon } from 'lucide-react';

export type FeatureItem = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  href?: string;
};

/** Fila de atalhos com ícone — navegação real para secções da própria página
 * (ou WhatsApp), não features fabricadas. Cada atalho é o seu próprio
 * cartão (estilo "app moderno"), não uma tira única partilhada. */
export function FeatureRail({ items }: { items: FeatureItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {items.map(({ icon: Icon, label, onClick, href }) => {
        const content = (
          <>
            <span
              className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[13px] transition-transform duration-200 group-hover:scale-110"
              style={{ background: 'color-mix(in srgb, var(--sf-primary) 11%, transparent)', color: 'var(--sf-primary)' }}
            >
              <Icon size={20} strokeWidth={1.7} />
            </span>
            <span className="text-center text-[10.5px] font-semibold leading-tight text-[var(--sf-ink-secondary)] transition-colors duration-150 group-hover:text-[var(--sf-primary)]">
              {label}
            </span>
          </>
        );
        const className =
          'group flex min-w-[76px] flex-1 flex-shrink-0 flex-col items-center gap-1.5 rounded-[var(--sf-radius-md)] border border-[var(--sf-line)]/70 bg-white/70 px-2 py-3 shadow-[var(--sf-shadow-sm)] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[var(--sf-primary)]/30 hover:shadow-[var(--sf-shadow-md)]';
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
