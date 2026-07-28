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
  showMegaMenu: boolean;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export type FooterVariant = 'full' | 'compact';

export interface ThemeFooter {
  variant: FooterVariant;
  showPaymentBadges: boolean;
  showNewsletter: boolean;
  columns: FooterColumn[];
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

export type HomeSectionKey = 'hero' | 'promo' | 'featured' | 'categories' | 'catalog';

export interface ThemeHome {
  sectionOrder: HomeSectionKey[];
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
