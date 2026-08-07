// =============================================================================
// checkout — NO CORE do Storefront (NÃO pertence a nenhum tema).
//
// Centraliza o fluxo de checkout que antes era duplicado em todos os HomePage:
//   • subtotal / desconto / total
//   • estado + aplicação de cupom
//   • estado do formulário de pedido
//   • placeOrder (envio à API + abertura do WhatsApp) e tela de sucesso
//
// Regra: o TEMA apenas apresenta. A lógica de negócio vive aqui. Um tema que
// use este hook só difere dos outros na aparência (hero, secções, modal), nunca
// em regra de negócio.
// =============================================================================
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { formatCurrency } from "./format";
import type { StorefrontApi, AppliedCoupon } from "../storefront/contract";

export interface OrderFormState {
  name: string;
  phone: string;
  address: string;
}

export const EMPTY_ORDER_FORM: OrderFormState = { name: "", phone: "", address: "" };

export interface UseCheckoutResult {
  // totais (derivados do carrinho + cupom)
  subtotal: number;
  discount: number;
  total: number;
  // contagem de itens (para o Header)
  cartCount: number;

  // cupom
  couponCode: string;
  setCouponCode: (v: string) => void;
  couponBusy: boolean;
  couponError: string | null;
  appliedCoupon: AppliedCoupon | null;
  applyCoupon: () => Promise<void>;

  // modal de pedido
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  orderForm: OrderFormState;
  setOrderForm: React.Dispatch<React.SetStateAction<OrderFormState>>;
  placing: boolean;
  placeError: string | null;
  whatsappMissing: boolean;
  placeOrder: (e: FormEvent) => Promise<void>;

  // tela de sucesso
  orderSuccess: boolean;
  setOrderSuccess: (v: boolean) => void;

  openCheckout: () => void;
}

/**
 * Encapsula todo o fluxo de checkout do carrinho. Recebe a StorefrontApi
 * (chamada já pronta pelo engine) e devolve estados + ações puramente UI.
 */
export function useCheckout(api: StorefrontApi): UseCheckoutResult {
  const { cart, store, currency, clearCart, setCartOpen } = api;

  const [couponCode, setCouponCode] = useState("");
  const [couponBusy, setCouponBusy] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormState>(EMPTY_ORDER_FORM);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [whatsappMissing, setWhatsappMissing] = useState(false);

  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + Number(i.product.price) * i.quantity, 0),
    [cart],
  );
  const discount = appliedCoupon ? subtotal * (appliedCoupon.discount_percent / 100) : 0;
  const total = subtotal - discount;

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponBusy(true);
    setCouponError(null);
    try {
      const result = await api.validateCoupon(couponCode.trim());
      setAppliedCoupon(result);
    } catch (err) {
      setAppliedCoupon(null);
      setCouponError(err instanceof Error ? err.message : "Cupom inválido");
    } finally {
      setCouponBusy(false);
    }
  };

  const buildWhatsappMessage = () => {
    const lines: string[] = [];
    lines.push(`*Novo pedido - ${store?.name}*`);
    lines.push("");
    lines.push(`Cliente: ${orderForm.name}`);
    lines.push(`Telefone: ${orderForm.phone}`);
    lines.push(`Endereço: ${orderForm.address}`);
    lines.push("");
    lines.push("Itens:");
    cart.forEach((i) => {
      lines.push(
        `- ${i.quantity}x ${i.product.name} — ${formatCurrency(Number(i.product.price) * i.quantity, currency)}`,
      );
    });
    lines.push("");
    lines.push(`Subtotal: ${formatCurrency(subtotal, currency)}`);
    if (discount > 0 && appliedCoupon) {
      lines.push(
        `Desconto (cupom ${appliedCoupon.code}): -${formatCurrency(discount, currency)}`,
      );
    }
    lines.push(`Total: ${formatCurrency(total, currency)}`);
    return lines.join("\n");
  };

  const openCheckout = () => {
    if (!store?.whatsapp) {
      setWhatsappMissing(true);
      return;
    }
    setWhatsappMissing(false);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const placeOrder = async (e: FormEvent) => {
    e.preventDefault();
    setPlacing(true);
    setPlaceError(null);
    const whatsappMessage = buildWhatsappMessage();
    try {
      await api.placeOrder({
        name: orderForm.name,
        phone: orderForm.phone,
        address: orderForm.address,
        items: cart.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        coupon_code: appliedCoupon?.code,
      });

      const digits = store?.whatsapp ? store.whatsapp.replace(/\D/g, "") : "";
      if (digits) {
        window.open(
          `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessage)}`,
          "_blank",
        );
      }

      clearCart();
      setCheckoutOpen(false);
      setOrderSuccess(true);
      setOrderForm(EMPTY_ORDER_FORM);
      setCouponCode("");
      setAppliedCoupon(null);
    } catch (err) {
      setPlaceError(
        err instanceof Error ? err.message : "Não foi possível enviar o pedido",
      );
    } finally {
      setPlacing(false);
    }
  };

  return {
    subtotal,
    discount,
    total,
    cartCount,
    couponCode,
    setCouponCode,
    couponBusy,
    couponError,
    appliedCoupon,
    applyCoupon,
    checkoutOpen,
    setCheckoutOpen,
    orderForm,
    setOrderForm,
    placing,
    placeError,
    whatsappMissing,
    placeOrder,
    orderSuccess,
    setOrderSuccess,
    openCheckout,
  };
}