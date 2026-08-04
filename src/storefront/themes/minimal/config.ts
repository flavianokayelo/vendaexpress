import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "minimal",
  tokens: {
    colors: {
      primary: "#18181b",
      primaryHover: "#000000",
      accent: "#000000",
      ink: "#09090b",
      inkSecondary: "#71717a",
      surface: "#ffffff",
      surfaceMuted: "#fafafa",
      line: "#e4e4e7",
      success: "#16a34a",
      danger: "#dc2626",
      warning: "#d97706",
    },
    radius: { sm: 0, md: 0, lg: 0, pill: 0 },
    buttons: { style: "solid", radius: "sm" },
    card: { style: "flat" },
  },
  layout: {
    hero: { mode: "static" },
    home: {
      sections: [
        { id: "hero", enabled: true },
        { id: "categories", enabled: true },
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