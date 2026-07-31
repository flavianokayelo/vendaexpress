import { useState } from 'react';
import { Check, Copy, Ticket } from 'lucide-react';
import type { PublicCoupon } from '../../lib/types';

/** Faixa de cupões reais (criados e marcados como públicos no dashboard) —
 * só código e percentagem, sem prazos/limites fabricados. */
export function VoucherStrip({ coupons }: { coupons: PublicCoupon[] }) {
  const [copied, setCopied] = useState<string | null>(null);

  if (coupons.length === 0) return null;

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied((c) => (c === code ? null : c)), 1500);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {coupons.map((c) => {
        const isCopied = copied === c.code;
        return (
          <button
            key={c.code}
            type="button"
            onClick={() => copy(c.code)}
            className="flex flex-shrink-0 items-center gap-2.5 rounded-[var(--sf-radius-sm)] border border-dashed border-[var(--sf-primary)] bg-[color-mix(in_srgb,var(--sf-primary)_6%,white)] py-2 pl-2.5 pr-3"
          >
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--sf-primary)] text-white">
              <Ticket size={15} strokeWidth={1.8} />
            </span>
            <span className="text-left">
              <span className="block text-[13px] font-bold leading-tight text-[var(--sf-primary)]">
                -{c.discount_percent}%
              </span>
              <span className="block text-[10px] font-mono leading-tight text-[var(--sf-ink-secondary)]">
                {c.code}
              </span>
            </span>
            {isCopied ? (
              <Check size={14} className="flex-shrink-0 text-[var(--sf-success)]" />
            ) : (
              <Copy size={14} className="flex-shrink-0 text-[var(--sf-ink-secondary)]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
