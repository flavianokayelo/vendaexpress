import { ShoppingCart, Minus, Plus, Trash2, X } from 'lucide-react';
import { resolveMediaUrl } from '../../lib/api';
import { formatCurrency, placeholderImage } from '../../lib/format';
import { Button } from '../ui/Button';
import { Input } from '../ui/Field';
import { EmptyState } from '../ui/Feedback';
import { useCart } from '../../lib/cart';
import type { Product } from '../../lib/types';

function productThumb(p: Product) {
  return resolveMediaUrl(p.images?.[0]?.url ?? p.image_url) || placeholderImage(p.name);
}

export function CartDrawer({
  currency,
  subtotal,
  discount,
  total,
  couponCode,
  onCouponCodeChange,
  couponBusy,
  couponError,
  appliedCoupon,
  onApplyCoupon,
  whatsappMissing,
  onCheckout,
}: {
  currency?: string;
  subtotal: number;
  discount: number;
  total: number;
  couponCode: string;
  onCouponCodeChange: (v: string) => void;
  couponBusy: boolean;
  couponError: string | null;
  appliedCoupon: { code: string; discount_percent: number } | null;
  onApplyCoupon: () => void;
  whatsappMissing: boolean;
  onCheckout: () => void;
}) {
  const { cart, cartOpen, setCartOpen, updateQty, removeFromCart } = useCart();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={() => setCartOpen(false)} />
      <div className="relative h-full w-full max-w-md bg-[var(--sf-surface)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[var(--sf-line)] px-5 py-4">
          <h2 className="text-lg font-bold text-[var(--sf-ink)]">Carrinho</h2>
          <button onClick={() => setCartOpen(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>
        <div className="flex flex-col" style={{ height: 'calc(100% - 64px)' }}>
          <div className="flex-1 overflow-y-auto p-5">
            {cart.length === 0 ? (
              <EmptyState icon={<ShoppingCart size={28} />} title="Carrinho vazio" description="Adiciona produtos para continuar." />
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 rounded-[var(--sf-radius-md)] border border-[var(--sf-line)] p-3">
                    <img src={productThumb(item.product)} alt={item.product.name} className="h-14 w-14 rounded-[var(--sf-radius-sm)] object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-[var(--sf-ink)]">{item.product.name}</div>
                      <div className="text-xs text-[var(--sf-ink-secondary)]">{formatCurrency(Number(item.product.price), currency)}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <button onClick={() => updateQty(item.product.id, -1)} className="rounded p-1 hover:bg-slate-100"><Minus size={14} /></button>
                        <span className="text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product.id, 1)} className="rounded p-1 hover:bg-slate-100"><Plus size={14} /></button>
                        <button onClick={() => removeFromCart(item.product.id)} className="ml-auto rounded p-1 text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className="border-t border-[var(--sf-line)] p-5">
              <div className="mb-3 flex gap-2">
                <Input className="flex-1" placeholder="Cupom" value={couponCode} onChange={(e) => onCouponCodeChange(e.target.value)} />
                <Button variant="outline" onClick={onApplyCoupon} disabled={couponBusy}>
                  {couponBusy ? '...' : 'Aplicar'}
                </Button>
              </div>
              {couponError && <p className="mb-2 text-xs text-red-600">{couponError}</p>}
              {appliedCoupon && <p className="mb-2 text-xs text-green-600">Cupom {appliedCoupon.code} aplicado: {appliedCoupon.discount_percent}%</p>}
              <div className="mb-3 space-y-1 text-sm">
                <div className="flex justify-between text-[var(--sf-ink-secondary)]"><span>Subtotal</span><span>{formatCurrency(subtotal, currency)}</span></div>
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{formatCurrency(discount, currency)}</span></div>}
                <div className="flex justify-between text-base font-bold text-[var(--sf-ink)]"><span>Total</span><span>{formatCurrency(total, currency)}</span></div>
              </div>
              {whatsappMissing && (
                <p className="mb-2 text-xs text-red-600">
                  Esta loja ainda não tem um número de WhatsApp configurado para receber pedidos. Contacte o lojista diretamente.
                </p>
              )}
              <Button className="w-full !rounded-[var(--sf-radius-md)] !bg-[var(--sf-primary)] hover:!bg-[var(--sf-primary-hover)]" size="lg" onClick={onCheckout}>
                Finalizar pedido
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
