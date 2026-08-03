import { Header } from "../../../components/theme/Header";
import { Footer } from "../../../components/theme/Footer";
import { ProductCard } from "../../../components/theme/ProductCard";
import { ProductGrid } from "../../../components/theme/ProductGrid";
import { CartDrawer } from "../../../components/theme/CartDrawer";
import { HomePage } from "./HomePage";
import type { ThemeComponents, ThemeContract, ThemeCartProps } from "../../contract";
import { ENGINE_VERSION } from "../../contract";
import manifest from "./theme.json";

// Adapter: o CartDrawer consome o contexto de cart internamente; aqui apenas
// ligamos as props opcionais do contrato (todas opcionais) aos valores por
// omissão que o drawer exige como obrigatórios.
function CartAdapter(props: ThemeCartProps) {
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

export const standardTheme: ThemeContract = {
  id: "standard",
  manifest: {
    ...manifest,
    engineVersion: ENGINE_VERSION,
  },
  components: {
    Header,
    Footer,
    ProductCard,
    ProductGrid,
    Cart: CartAdapter,
  } as ThemeComponents,
  pages: {
    Home: HomePage,
  },
};

export default standardTheme;