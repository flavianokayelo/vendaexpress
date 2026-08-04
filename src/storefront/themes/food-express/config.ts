import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "food-express",
  tokens: {
    colors: {
      primary: "#EA580C",
      primaryHover: "#C2410C",
      accent: "#16A34A",
      ink: "#1F2933",
      inkSecondary: "#6B7280",
      surface: "#FFFFFF",
      surfaceMuted: "#FFF7ED",
      line: "#FED7AA",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#F59E0B",
    },
    radius: { sm: 10, md: 16, lg: 24, pill: 9999 },
    spacing: { unit: 8, sectionGap: 52 },
    buttons: { style: "pill", radius: "pill" },
    card: { style: "padded-tint", imageAspect: "1:1", hoverEffect: "zoom" },
  },
  layout: {
    home: {
      sections: [
        { id: "announcement", enabled: true },
        { id: "hero", enabled: true },
        { id: "categories", enabled: true },
        { id: "promo", enabled: true, layout: "rail", limit: 12 },
        { id: "featured", enabled: true, layout: "rail", limit: 12 },
        { id: "catalog", enabled: true },
        { id: "vouchers", enabled: true },
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