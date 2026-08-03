// Tipos do sistema de tema "Standard Ecommerce" — a camada visual configurável
// da loja pública do Venda Express. Os valores por omissão vivem em
// defaultTheme.ts; cada loja pode sobrepor uma parte via stores.theme_config
// (ver mergeTheme.ts). Os tokens de estilo usam enums fechados (não CSS livre)
// para manter a superfície de personalização/QA controlada.
//
// Nota: esta pasta chama-se "storefrontTheme" (não "theme") de propósito —
// existe já um scaffold multi-tema em src/theme/ e src/themes/ criado por
// outra ferramenta em paralelo; este sistema é independente e não deve colidir
// com esses ficheiros.

export interface ThemeColors {
  primary: string;
  primaryHover?: string;
  accent?: string;
  ink: string;
  inkSecondary: string;
  surface: string;
  surfaceMuted: string;
  line: string;
  success: string;
  danger: string;
  warning: string;
}

export interface ThemeRadius {
  sm: number;
  md: number;
  lg: number;
  pill: number;
}

export interface ThemeSpacing {
  unit: number;
  sectionGap: number;
}

/** Sombras — strings de box-shadow completas, em camadas (não um único
 * blur), para uma sensação de profundidade suave em vez de sombra "chapada". */
export interface ThemeShadow {
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export type ButtonStyle = 'solid' | 'outline' | 'pill';
export type RadiusToken = 'sm' | 'md' | 'lg' | 'pill';

export interface ThemeButtons {
  style: ButtonStyle;
  radius: RadiusToken;
}

export type CardStyle = 'padded-tint' | 'flat' | 'bordered';
export type CardImageAspect = '1:1' | '4:5' | '3:2';
export type CardHoverEffect = 'lift' | 'zoom' | 'none';

export interface ThemeCard {
  style: CardStyle;
  imageAspect: CardImageAspect;
  hoverEffect: CardHoverEffect;
}

export type HeaderVariant = 'standard' | 'centered-logo' | 'minimal';

export interface ThemeHeader {
  variant: HeaderVariant;
  showAnnouncementBar: boolean;
  announcementText?: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

/** Item de apoio ao cliente (entrega, trocas, garantia, FAQ) — texto real
 * escrito pelo lojista, mostrado como acordeão no rodapé da loja. */
export interface SupportItem {
  title: string;
  content: string;
}

export type FooterVariant = 'full' | 'compact';

export interface ThemeFooter {
  variant: FooterVariant;
  showPaymentBadges: boolean;
  showNewsletter: boolean;
  columns: FooterColumn[];
  supportItems: SupportItem[];
}

export interface HeroSlideConfig {
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
}

export type HeroMode = 'carousel' | 'static' | 'none';

export interface ThemeHero {
  mode: HeroMode;
  // Fase 1: ignorado — os slides continuam a vir de store.banner_urls/produtos
  // em promoção, tal como hoje. Fica reservado para quando o hero passar a ser
  // editável directamente via configuração de tema.
  slides: HeroSlideConfig[];
}

export interface BannerItem {
  image: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
}

export interface ThemeBanners {
  promoGrid?: BannerItem[];
  discountStrip?: BannerItem;
}

export type HomeSectionKey =
  | 'announcement'
  | 'hero'
  | 'promo-banners'
  | 'profile-bar'
  | 'tabs'
  | 'feature-rail'
  | 'vouchers'
  | 'categories'
  | 'promo'
  | 'featured'
  | 'catalog';

/** Configuração declarativa de uma secção da página inicial. Cada bloco do
 *  layout é um item aqui: o `HomePage` renderiza os itens por ordem, e um tema
 *  (ou uma loja via theme_config) pode reordenar, ocultar ou re-intitular cada
 *  um sem tocar em código React. */
export interface HomeSectionConfig {
  /** id único da secção — mapeia para um renderer no HomePage */
  id: HomeSectionKey;
  /** false oculta a secção sem a remover da config */
  enabled?: boolean;
  /** título alternativo (usa o default do bloco se omitido) */
  title?: string;
  /** layout dos grids de produtos (promo/featured/catalog) */
  layout?: 'rail' | 'grid';
  /** limita o número de produtos em grids (promo/featured) */
  limit?: number;
}

export interface ThemeHome {
  /** ordem + configuração das secções da home. A ORDEM aqui é a ordem real de
   *  render (Header e Footer são chrome fixo, não entram na lista). */
  sections: HomeSectionConfig[];
}

export interface ThemeTypography {
  fontDisplay: string;
  fontBody: string;
}

export interface ThemeConfig {
  themeVersion: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  radius: ThemeRadius;
  spacing: ThemeSpacing;
  shadow: ThemeShadow;
  buttons: ThemeButtons;
  card: ThemeCard;
  header: ThemeHeader;
  footer: ThemeFooter;
  hero: ThemeHero;
  banners: ThemeBanners;
  home: ThemeHome;
}

export type DeepPartial<T> = T extends (infer U)[]
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

export type ThemeConfigOverride = DeepPartial<ThemeConfig>;
