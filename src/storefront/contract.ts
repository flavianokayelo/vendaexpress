// =============================================================================
// ThemeContract — a API fixa que TODOS os temas do Storefront implementam.
//
// Regra central: o TEMA nunca controla dados. Não faz fetch, não chama a API,
// não calcula carrinho nem checkout. Recebe tudo do StorefrontEngine sob a
// forma de props tipadas (StorefrontApi) e apenas apresenta.
//
// O contrato garante a "porta de entrada" igual para qualquer tema. Se um tema
// não implementar uma parte obrigatória, o ThemeValidator rejeita-o e o
// ThemeRegistry usa fallback (standard).
import type { ComponentType } from "react";
import type { Category, Product, PublicCoupon, Store } from "../lib/types";
import type { CartItem } from "../lib/cart";

// Versão do motor que os temas devem indicar no manifesto. Temas com
// engineVersion != ENGINE_VERSION são bloqueados pelo validator (versionamento de tema).
export const ENGINE_VERSION = "1.0";

export interface ThemeManifest {
  /** id técnico único, ex: "standard" */
  id: string;
  /** nome técnico, ex: "standard" */
  name: string;
  /** nome de apresentação, ex: "Standard Store" */
  label: string;
  description?: string;
  version: string;
  /** versão do motor com a qual o tema foi construído — ver ENGINE_VERSION */
  engineVersion: string;
  preview?: string;
}

// ---------------------------------------------------------------------------
// Data API (governada pelo Store Engine, nunca pelo tema)
// ---------------------------------------------------------------------------

export interface PlaceOrderInput {
  name: string;
  phone: string;
  address: string;
  items: { product_id: string; quantity: number }[];
  coupon_code?: string;
}

export interface CheckoutResult {
  order_id: string;
  total: number;
}

export interface AppliedCoupon {
  code: string;
  discount_percent: number;
}

/** Tudo o que uma página de tema pode consumir. Nada aqui é controlado pelo tema. */
export interface StorefrontApi {
  slug: string;
  navigate: (to: string) => void;

  store: Store;
  products: Product[];
  categories: Category[];
  publicCoupons: PublicCoupon[];
  currency: string;

  cart: CartItem[];
  addToCart: (p: Product) => void;
  clearCart: () => void;
  setCartOpen: (open: boolean) => void;

  wishlist: Product[];
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (p: Product) => void;
  setWishlistOpen: (open: boolean) => void;

  validateCoupon: (code: string) => Promise<AppliedCoupon>;
  placeOrder: (order: PlaceOrderInput) => Promise<CheckoutResult>;
}

// ---------------------------------------------------------------------------
// Componentes que cada TEMA deve expor (Header / Footer / ProductGrid / Cart)
// ---------------------------------------------------------------------------

export interface ThemeHeaderProps {
  store: Store;
  search: string;
  onSearchChange: (v: string) => void;
  cartCount: number;
  onCartClick: () => void;
  wishlistCount: number;
  onWishlistClick: () => void;
  categories?: Category[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
  onHelpClick?: () => void;
}

export interface ThemeFooterProps {
  store: Store;
  categories?: Category[];
  onSelectCategory?: (id: string) => void;
}

export interface ThemeProductCardProps {
  p: Product;
  currency?: string;
  categoryName?: string;
  index?: number;
  compact?: boolean;
  onAdd: (p: Product) => void;
  onView?: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (p: Product) => void;
}

export interface ThemeProductGridProps {
  products: Product[];
  currency?: string;
  categoryNames?: Map<string, string>;
  layout?: "grid" | "rail";
  compact?: boolean;
  paginate?: boolean;
  onAdd: (p: Product) => void;
  onView?: (p: Product) => void;
  isWishlisted?: (id: string) => boolean;
  onToggleWishlist?: (p: Product) => void;
}

export interface ThemeCartProps {
  currency?: string;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  onCouponCodeChange?: (v: string) => void;
  couponBusy?: boolean;
  couponError?: string | null;
  appliedCoupon?: AppliedCoupon | null;
  onApplyCoupon?: () => void;
  whatsappMissing?: boolean;
  onCheckout?: () => void;
}

/** Contrato de componentes de cada tema. Cada um é swappable no registry. */
export interface ThemeComponents {
  Header: ComponentType<ThemeHeaderProps>;
  Footer: ComponentType<ThemeFooterProps>;
  ProductCard: ComponentType<ThemeProductCardProps>;
  ProductGrid: ComponentType<ThemeProductGridProps>;
  Cart: ComponentType<ThemeCartProps>;
}

// ---------------------------------------------------------------------------
// Páginas que cada tema pode implementar
// ---------------------------------------------------------------------------

/** Página de entrada (a loja em si). Consome StorefrontApi — nunca faz fetch. */
export type ThemeHomePage = ComponentType<StorefrontApi>;

export interface ThemePages {
  Home: ThemeHomePage;
}

// ---------------------------------------------------------------------------
// O contrato final de um Tema
// ---------------------------------------------------------------------------
export interface ThemeContract {
  id: string;
  manifest: ThemeManifest;
  components: ThemeComponents;
  pages: ThemePages;
}

/** Partes obrigatórias validadas pelo ThemeValidator. */
export const REQUIRED_PARTS = {
  components: ["Header", "Footer", "ProductCard", "ProductGrid", "Cart"] as (keyof ThemeComponents)[],
  pages: ["Home"] as (keyof ThemePages)[],
};
