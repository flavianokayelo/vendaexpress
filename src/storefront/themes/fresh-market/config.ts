import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "fresh-market",
  tokens: {
    colors: {
      primary: "#15803D",
      primaryHover: "#166534",
      accent: "#F97316",
      ink: "#172033",
      inkSecondary: "#5F6C7B",
      surface: "#FFFFFF",
      surfaceMuted: "#F4F8EA",
      line: "#D9EBC0",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#F59E0B",
    },
    radius: { sm: 8, md: 14, lg: 20, pill: 9999 },
    spacing: { unit: 8, sectionGap: 56 },
    buttons: { style: "pill", radius: "pill" },
    card: { style: "padded-tint", imageAspect: "1:1", hoverEffect: "zoom" },
  },
  layout: {
    home: {
      sections: [
        { id: "announcement", enabled: true },
        { id: "hero", enabled: true },
        { id: "tabs", enabled: true },
        { id: "categories", enabled: true },
        { id: "promo-banners", enabled: true },
        { id: "vouchers", enabled: true },
        { id: "promo", enabled: true, layout: "rail", limit: 10 },
        { id: "featured", enabled: true, layout: "rail", limit: 10 },
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