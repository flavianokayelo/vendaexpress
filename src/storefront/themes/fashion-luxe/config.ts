import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "fashion-luxe",
  tokens: {
    colors: {
      primary: "#111111",
      primaryHover: "#000000",
      accent: "#B68A35",
      ink: "#18181B",
      inkSecondary: "#78716C",
      surface: "#FFFFFF",
      surfaceMuted: "#F7F3EE",
      line: "#E7DED2",
      success: "#15803D",
      danger: "#BE123C",
      warning: "#B45309",
    },
    typography: {
      fontDisplay: "'Bricolage Grotesque', Georgia, serif",
      fontBody: "'Inter', ui-sans-serif, system-ui, sans-serif",
    },
    radius: { sm: 2, md: 4, lg: 8, pill: 9999 },
    spacing: { unit: 8, sectionGap: 88 },
    buttons: { style: "outline", radius: "sm" },
    card: { style: "bordered", imageAspect: "4:5", hoverEffect: "lift" },
  },
  layout: {
    hero: { mode: "carousel" },
    home: {
      sections: [
        { id: "hero", enabled: true },
        { id: "promo-banners", enabled: true },
        { id: "categories", enabled: true },
        { id: "featured", enabled: true, layout: "grid", limit: 4 },
        { id: "catalog", enabled: true },
      ],
    },
    productCardVariant: "default",
    productGridVariant: "default",
  },
  capabilities: {
    multiLanguage: false,
    multiCurrency: false,
    wishlist: true,
    quickView: true,
    liveSearch: true,
  },
};

export default config;