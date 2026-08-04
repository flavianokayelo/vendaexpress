import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "electronics",
  tokens: {
    colors: {
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      accent: "#06b6d4",
      ink: "#0f172a",
      inkSecondary: "#64748b",
      surface: "#ffffff",
      surfaceMuted: "#f1f5f9",
      line: "#cbd5e1",
      success: "#10b981",
      danger: "#ef4444",
      warning: "#f59e0b",
    },
    radius: { sm: 2, md: 4, lg: 6, pill: 9999 },
    buttons: { style: "solid", radius: "sm" },
    card: { style: "padded-tint" },
  },
  layout: {
    home: {
      sections: [
        { id: "announcement", enabled: true },
        { id: "hero", enabled: true },
        { id: "promo-banners", enabled: true },
        { id: "profile-bar", enabled: true },
        { id: "tabs", enabled: true },
        { id: "feature-rail", enabled: true },
        { id: "categories", enabled: true },
        { id: "promo", enabled: true, layout: "grid", limit: 8 },
        { id: "featured", enabled: true, layout: "grid", limit: 8 },
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