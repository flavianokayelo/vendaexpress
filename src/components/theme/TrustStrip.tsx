import { Truck, ShieldCheck, MessageCircle, RefreshCcw } from 'lucide-react';

const ITEMS = [
  { icon: Truck, title: 'Entrega combinada', subtitle: 'Directo com o lojista' },
  { icon: ShieldCheck, title: 'Compra segura', subtitle: 'Pagamento protegido' },
  { icon: MessageCircle, title: 'Suporte via WhatsApp', subtitle: 'Resposta em minutos', whatsapp: true },
  { icon: RefreshCcw, title: 'Trocas fáceis', subtitle: 'Até 7 dias' },
];

/** Faixa decorativa de confiança — equivalente honesto ao BrandStrip/DiscountStrip
 * da referência, mas descrevendo funcionalidade real da plataforma em vez de
 * marcas/parceiros ou descontos que não existem. */
export function TrustStrip() {
  return (
    <section className="mx-auto w-full max-w-[1240px] px-4 py-[26px] sm:px-6">
      <div className="grid grid-cols-2 overflow-hidden rounded-[16px] border border-[var(--sf-line)] bg-[var(--sf-surface)] shadow-[0_2px_6px_rgba(29,31,32,0.05)] lg:grid-cols-4">
        {ITEMS.map(({ icon: Icon, title, subtitle, whatsapp }, i) => (
          <div
            key={title}
            className={`flex items-center gap-3.5 px-6 py-[22px] ${whatsapp ? 'bg-[#e7f8ee]' : ''} ${
              i === 0 || i === 2 ? 'border-r border-[var(--sf-line)]' : ''
            } ${i <= 1 ? 'border-b border-[var(--sf-line)] lg:border-b-0' : ''} ${
              i <= 2 ? 'lg:border-r' : ''
            }`}
          >
            <span
              className={`flex h-[40px] w-[40px] flex-shrink-0 items-center justify-center rounded-[var(--sf-radius-pill)] ${
                whatsapp ? 'bg-[#25D366]' : 'bg-[var(--sf-accent)]/10'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} className={whatsapp ? 'text-white' : 'text-[var(--sf-accent)]'} />
            </span>
            <div className="min-w-0">
              <div className={`truncate font-display text-[16px] font-semibold leading-tight ${whatsapp ? 'text-[#0f7a43]' : 'text-[var(--sf-ink)]'}`}>
                {title}
              </div>
              <div className={`truncate text-[13px] ${whatsapp ? 'text-[#128a4e]' : 'text-[var(--sf-ink-secondary)]'}`}>{subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
