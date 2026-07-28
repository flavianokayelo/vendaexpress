export type ThemeId = 'standard' | 'luxury' | 'minimal' | 'fashion' | 'electronics' | (string & {});

export interface ColorTokens {
  primary: string;
  'primary-foreground': string;
  secondary: string;
  'secondary-foreground': string;
  accent: string;
  'accent-foreground': string;
  surface: string;
  background: string;
  muted: string;
  'muted-foreground': string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  border: string;
  text: string;
  'text-secondary': string;
}

export interface RadiusTokens {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

export interface ShadowTokens {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glass: string;
}

export interface TypographyTokens {
  'font-family': string;
  'font-family-heading': string;
  'font-family-mono': string;
  'heading-1': string;
  'heading-2': string;
  'heading-3': string;
  'heading-4': string;
  body: string;
  small: string;
  xs: string;
  'line-height-tight': string;
  'line-height-normal': string;
  'line-height-relaxed': string;
}

export interface SpacingTokens {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  'section-y': string;
}

export interface MotionTokens {
  'duration-fast': string;
  'duration-normal': string;
  'duration-slow': string;
  ease: string;
  'ease-in': string;
  'ease-out': string;
  'delay-none': string;
  'delay-sm': string;
  'delay-md': string;
  'transition-base': string;
  'hover-lift': string;
  'hover-scale': string;
}

export interface FullTokenSet {
  colors: ColorTokens;
  radius: RadiusTokens;
  shadows: ShadowTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  motion: MotionTokens;
}

export interface ButtonTokens {
  'border-radius': string;
  'font-size': string;
  'font-weight': string;
  'padding-x': string;
  'padding-y': string;
  'gap': string;
  'icon-size': string;
}

export interface CardTokens {
  'border-radius': string;
  'padding': string;
  'shadow': string;
  'background': string;
  'border-color': string;
}

export interface FormTokens {
  'input-border-radius': string;
  'input-border-color': string;
  'input-focus-ring': string;
  'input-padding-x': string;
  'input-padding-y': string;
  'label-font-size': string;
  'label-font-weight': string;
}

export interface HeaderTokens {
  height: string;
  background: string;
  'text-color': string;
  'border-color': string;
  'sticky-background': string;
}

export interface FooterTokens {
  'background': string;
  'text-color': string;
  'link-color': string;
  'padding-y': string;
}

export interface HeroTokens {
  'min-height': string;
  'overlay-color': string;
  'title-font-size': string;
  'title-font-weight': string;
  'subtitle-font-size': string;
}

export interface BannerTokens {
  'border-radius': string;
  'aspect-ratio': string;
}

export interface SectionTokens {
  'padding-y': string;
  'padding-y-mobile': string;
  'title-size': string;
  'gap': string;
}

export interface AnimationTokens {
  'hero-fade-duration': string;
  'card-hover-scale': string;
  'stagger-delay': string;
  'slide-distance': string;
}

export interface ComponentTokens {
  button: ButtonTokens;
  card: CardTokens;
  form: FormTokens;
  header: HeaderTokens;
  footer: FooterTokens;
  hero: HeroTokens;
  banner: BannerTokens;
  section: SectionTokens;
  animation: AnimationTokens;
}

export interface ThemeAuthor {
  name: string;
  url?: string;
  email?: string;
}

export interface ThemeCapabilities {
  multiLanguage: boolean;
  multiCurrency: boolean;
  wishlist: boolean;
  quickView: boolean;
  compareProducts: boolean;
  liveSearch: boolean;
  infiniteScroll: boolean;
}

export interface ThemeCompatibility {
  node?: string;
  browsers?: string[];
}

export interface ThemeManifest {
  id: string;
  name: string;
  label: string;
  description: string;
  author: ThemeAuthor;
  version: string;
  minimumStorefrontVersion: string;
  tags: string[];
  supportsDarkMode: boolean;
  supportsRTL: boolean;
  premium: boolean;
  preview: string;
  compatibility: ThemeCompatibility;
  capabilities: ThemeCapabilities;
}

export type ThemePreviewSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ThemePreview {
  src: string;
  alt: string;
  size?: ThemePreviewSize;
  type?: 'gradient' | 'image' | 'screenshot';
}

export interface ThemeConfig {
  name: string;
  label: string;
  description: string;
  preview?: string;
  author?: string | ThemeAuthor;
  version: string;
}

export interface ThemeDefinition {
  id: ThemeId;
  config: ThemeConfig;
  tokens: FullTokenSet;
  components: ComponentTokens;
}

export interface ThemeComponentMap {
  Header: React.ComponentType<unknown>;
  Footer: React.ComponentType<unknown>;
  Hero: React.ComponentType<unknown>;
  ProductCard: React.ComponentType<unknown>;
  ProductGrid: React.ComponentType<unknown>;
  CategoryList: React.ComponentType<unknown>;
  CartDrawer: React.ComponentType<unknown>;
  WishlistButton: React.ComponentType<unknown>;
  SearchBar: React.ComponentType<unknown>;
  Button: React.ComponentType<unknown>;
  Input: React.ComponentType<unknown>;
  Section: React.ComponentType<unknown>;
  Banner: React.ComponentType<unknown>;
  NewsletterForm?: React.ComponentType<unknown>;
  SocialLinks?: React.ComponentType<unknown>;
}

export interface Theme {
  id: ThemeId;
  config: ThemeConfig;
  tokens: FullTokenSet;
  components: ComponentTokens;
  ThemeComponents: ThemeComponentMap;
  registry: ThemeRegistryEntry;
}

export interface ThemeRegistryEntry {
  id: ThemeId;
  name: string;
  label: string;
  description: string;
  preview?: string;
  author?: string;
  version: string;
  tags?: string[];
  supportsDarkMode?: boolean;
  premium?: boolean;
  minimumStorefrontVersion?: string;
  capabilities?: ThemeCapabilities;
}

export type ThemeRegistry = Record<ThemeId, ThemeRegistryEntry>;

export interface ThemeState {
  themeId: ThemeId;
  theme: ThemeDefinition | null;
  resolvedTheme: ThemeDefinition;
  isLoading: boolean;
  error: string | null;
}

export type ColorMode = 'light' | 'dark';

export interface ThemeContextValue {
  themeId: ThemeId;
  theme: ThemeDefinition | null;
  resolvedTheme: ThemeDefinition;
  isLoading: boolean;
  error: string | null;
  setTheme: (themeId: ThemeId) => Promise<void>;
  availableThemes: ThemeRegistryEntry[];
  colorMode: ColorMode;
}

export interface ThemeProviderProps {
  initialThemeId?: ThemeId;
  colorMode?: ColorMode;
  children: React.ReactNode;
}

export interface ThemeScannerResult {
  id: string;
  manifest: ThemeManifest;
  basePath: string;
}

export type ThemeValidationLevel = 'error' | 'warn' | 'info';

export interface ThemeValidationIssue {
  level: ThemeValidationLevel;
  code: string;
  message: string;
  field?: string;
}

export interface ThemeValidationResult {
  valid: boolean;
  themeId: string;
  issues: ThemeValidationIssue[];
  manifestValid: boolean;
  tokensValid: boolean;
  componentsValid: boolean;
  requiredFilesPresent: boolean;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface ThemeLogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface ThemeInstallerConfig {
  source: string;
  manifest: ThemeManifest;
  validateBeforeInstall: boolean;
  createBackup: boolean;
}

export type InstallerState = 'idle' | 'validating' | 'installing' | 'backing_up' | 'completed' | 'failed';

export interface ThemeInstallProgress {
  state: InstallerState;
  progress: number;
  message: string;
  error?: string;
}
