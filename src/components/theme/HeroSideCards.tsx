import { MessageCircle, ShieldCheck, Truck, Ticket } from 'lucide-react';
import type { PublicCoupon } from '../../lib/types';

/** Cartões laterais do hero — só usam dados reais: desconto máximo entre os
 * produtos em promoção (se houver), o primeiro cupão público (se houver) e um
 * cartão de confiança/entrega/WhatsApp. Sem números inventados (sem "vendidos
 * hoje", sem contagem de stock fake). As células reorganizam-se sozinhas
 * conforme o que existe de facto para a loja. */
export function HeroSideCards({
  maxDiscount,
  publicCoupons,
  whatsapp,
  onPromoClick,
}: {
  maxDiscount: number;
  publicCoupons?: PublicCoupon[];
  whatsapp?: string | null;
  onPromoClick: () => void;
}) {
  const waDigits = whatsapp ? whatsapp.replace(/\D/g, '') : '';
  const bestCoupon = publicCoupons?.[0];

  // Suporte (WhatsApp) só aparece uma vez — na célula do cupão se não houver
  // cupão real, senão no cartão largo de baixo.
  const supportInTopCell = !bestCoupon && !!waDigits;

  return (
    <div className="grid h-full grid-rows-[1fr_auto] gap-1.5">
      <div className={`grid gap-1.5 ${bestCoupon || supportInTopCell ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {maxDiscount > 0 ? (
          <button
            type="button"
            onClick={onPromoClick}
            className="flex flex-col justify-center gap-0.5 rounded-[var(--sf-radius-md)] p-3 text-left text-white shadow-[var(--sf-shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-md)] hover:brightness-110"
            style={{
              background:
                'linear-gradient(135deg, var(--sf-primary), color-mix(in srgb, var(--sf-primary) 55%, black))',
            }}
          >
            <span className="text-[24px] font-extrabold leading-none [font-feature-settings:'tnum'_1]">-{maxDiscount}%</span>
            <strong className="block text-[12px] font-bold leading-tight">Oferta do dia</strong>
            <span className="block truncate text-[10.5px] opacity-85">Por tempo limitado</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 rounded-[var(--sf-radius-md)] border border-[var(--sf-line)] bg-[var(--sf-surface)] p-3 shadow-[var(--sf-shadow-sm)]">
            <ShieldCheck size={19} strokeWidth={1.7} className="flex-shrink-0 text-[var(--sf-primary)]" />
            <span className="text-[11.5px] font-semibold leading-tight text-[var(--sf-ink)]">Compra segura, direto com o lojista</span>
          </div>
        )}

        {bestCoupon && (
          <div className="flex flex-col justify-center gap-0.5 rounded-[var(--sf-radius-md)] border border-dashed border-[var(--sf-primary)] bg-[color-mix(in_srgb,var(--sf-primary)_6%,white)] p-3">
            <span className="flex items-center gap-1 text-[20px] font-extrabold leading-none text-[var(--sf-primary)] [font-feature-settings:'tnum'_1]">
              <Ticket size={16} strokeWidth={2} />-{bestCoupon.discount_percent}%
            </span>
            <strong className="block text-[12px] font-bold leading-tight text-[var(--sf-ink)]">Cupão</strong>
            <span className="block truncate font-mono text-[10.5px] text-[var(--sf-ink-secondary)]">{bestCoupon.code}</span>
          </div>
        )}

        {supportInTopCell && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col justify-center gap-1 rounded-[var(--sf-radius-md)] p-3 text-white shadow-[var(--sf-shadow-sm)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[var(--sf-shadow-md)]"
            style={{ background: 'linear-gradient(135deg, var(--sf-ink), color-mix(in srgb, var(--sf-ink) 65%, black))' }}
          >
            <MessageCircle size={19} strokeWidth={1.7} />
            <strong className="block text-[12px] font-bold leading-tight">Suporte</strong>
            <span className="block truncate text-[10.5px] opacity-85">Falar no WhatsApp</span>
          </a>
        )}
      </div>

      <div
        className="flex items-center justify-between gap-2 rounded-[var(--sf-radius-md)] p-3 text-white"
        style={{ background: 'linear-gradient(135deg, var(--sf-ink), color-mix(in srgb, var(--sf-ink) 65%, black))' }}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-medium opacity-90">
          <Truck size={14} strokeWidth={1.8} className="flex-shrink-0" /> Entrega combinada com o lojista
        </span>
        {waDigits && !supportInTopCell && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-shrink-0 items-center justify-center gap-1.5 rounded-[var(--sf-radius-sm)] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[var(--sf-ink)] transition-colors duration-150 hover:bg-white/90"
          >
            <MessageCircle size={12} strokeWidth={2} /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
