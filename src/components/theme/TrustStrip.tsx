import { Truck, ShieldCheck, MessageCircle, RefreshCcw } from 'lucide-react';

const ITEMS = [
  { icon: Truck, label: 'Entrega combinada com o lojista' },
  { icon: ShieldCheck, label: 'Compra segura' },
  { icon: MessageCircle, label: 'Suporte directo via WhatsApp' },
  { icon: RefreshCcw, label: 'Trocas fáceis' },
];

/** Faixa decorativa de confiança — equivalente honesto ao BrandStrip/DiscountStrip
 * da referência, mas descrevendo funcionalidade real da plataforma em vez de
 * marcas/parceiros ou descontos que não existem. */
export function TrustStrip() {
  return (
    <div className="border-y border-[var(--sf-line)] bg-[var(--sf-surface-muted)] py-4">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 sm:grid-cols-4">
        {ITEMS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs font-medium text-[var(--sf-ink-secondary)]">
            <Icon size={16} className="flex-shrink-0 text-[var(--sf-primary)]" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
