import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

export type ShopTab = {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
};

/** Barra de separadores tipo "shop page" da Shopee (Início/Produtos/Categorias)
 * — navegação por scroll para as secções da própria página, sem rotas novas.
 * A barra activa desliza com uma animação partilhada (layoutId) entre as tabs. */
export function ShopTabs({
  tabs,
  activeLabel,
}: {
  tabs: ShopTab[];
  /** Tab realçada como activa (secção actualmente visível) — opcional. */
  activeLabel?: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[1240px] px-2 sm:px-4">
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-[var(--sf-line)]">
        {tabs.map((t) => {
          const active = activeLabel === t.label;
          const Icon = t.icon;
          return (
            <button
              key={t.label}
              type="button"
              onClick={t.onClick}
              className={`group relative flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-[13px] font-semibold transition-colors duration-150 ${
                active ? 'text-[var(--sf-primary)]' : 'text-[var(--sf-ink-secondary)] hover:text-[var(--sf-ink)]'
              }`}
            >
              {Icon && <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />}
              {t.label}
              {active && (
                <motion.span
                  layoutId="shop-tabs-underline"
                  className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-[var(--sf-primary)]"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
