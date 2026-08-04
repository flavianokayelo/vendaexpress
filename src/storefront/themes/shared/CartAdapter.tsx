import { CartDrawer } from "../../../components/theme/CartDrawer";
import type { ThemeCartProps } from "../../contract";

// Adapter partilhado: o CartDrawer consome o contexto de cart internamente;
// aqui apenas ligamos as props opcionais do contrato (todas opcionais) aos
// valores por omissão que o drawer exige como obrigatórios. Cada tema regista
// este Cart no slot do seu ThemeContract.
export function CartAdapter(props: ThemeCartProps) {
  return (
    <CartDrawer
      currency={props.currency}
      subtotal={props.subtotal ?? 0}
      discount={props.discount ?? 0}
      total={props.total ?? 0}
      couponCode={props.couponCode ?? ""}
      onCouponCodeChange={props.onCouponCodeChange ?? (() => {})}
      couponBusy={props.couponBusy ?? false}
      couponError={props.couponError ?? null}
      appliedCoupon={props.appliedCoupon ?? null}
      onApplyCoupon={props.onApplyCoupon ?? (() => {})}
      whatsappMissing={props.whatsappMissing ?? false}
      onCheckout={props.onCheckout ?? (() => {})}
    />
  );
}
