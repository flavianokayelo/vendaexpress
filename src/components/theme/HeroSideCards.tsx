import { MessageCircle, ShieldCheck, Truck } from 'lucide-react';

/** Cartões laterais do hero — só usam dados reais: desconto máximo entre os
 * produtos em promoção (se houver) e um cartão de confiança com WhatsApp.
 * Sem números inventados (sem "vendidos hoje", sem contagem de stock fake). */
export function HeroSideCards({
  maxDiscount,
  whatsapp,
  onPromoClick,
}: {
  maxDiscount: number;
  whatsapp?: string | null;
  onPromoClick: () => void;
}) {
  const waDigits = whatsapp ? whatsapp.replace(/\D/g, '') : '';

  return (
    <div className="grid h-full grid-rows-2 gap-1.5">
      {maxDiscount > 0 ? (
        <button
          type="button"
          onClick={onPromoClick}
          className="flex items-center gap-3 rounded-[var(--sf-radius-md)] p-3 text-left text-white"
          style={{
            background:
              'linear-gradient(135deg, var(--sf-primary), color-mix(in srgb, var(--sf-primary) 55%, black))',
          }}
        >
          <span className="text-[26px] font-extrabold leading-none">-{maxDiscount}%</span>
          <span className="min-w-0">
            <strong className="block text-[13px] font-bold leading-tight">Ofertas relâmpago</strong>
            <span className="block text-[11px] opacity-90">Descontos por tempo limitado</span>
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-[var(--sf-radius-md)] border border-[var(--sf-line)] bg-[var(--sf-surface)] p-3">
          <ShieldCheck size={20} strokeWidth={1.7} className="flex-shrink-0 text-[var(--sf-primary)]" />
          <span className="text-[12px] font-semibold text-[var(--sf-ink)]">Compra segura, direto com o lojista</span>
        </div>
      )}

      <div
        className="flex flex-col justify-center gap-1.5 rounded-[var(--sf-radius-md)] p-3 text-white"
        style={{ background: 'linear-gradient(135deg, var(--sf-ink), color-mix(in srgb, var(--sf-ink) 65%, black))' }}
      >
        <span className="flex items-center gap-1.5 text-[11px] font-medium opacity-90">
          <Truck size={13} strokeWidth={1.8} /> Entrega combinada com o lojista
        </span>
        {waDigits && (
          <a
            href={`https://wa.me/${waDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-[var(--sf-radius-sm)] bg-white py-1.5 text-[12px] font-bold text-[var(--sf-ink)]"
          >
            <MessageCircle size={13} strokeWidth={2} /> Falar no WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
