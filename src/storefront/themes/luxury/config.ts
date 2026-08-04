import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "luxury",
  tokens: {
    colors: {
      primary: "#1a1a2e",
      primaryHover: "#0f0f1a",
      accent: "#d4af37",
      ink: "#1a1a2e",
      inkSecondary: "#8a8070",
      surface: "#f8f5f0",
      surfaceMuted: "#ece8df",
      line: "#d4c9b8",
      success: "#2d6a4f",
      danger: "#9b2226",
      warning: "#e9c46a",
    },
    radius: { sm: 2, md: 4, lg: 6, pill: 9999 },
    buttons: { style: "solid", radius: "sm" },
    card: { style: "bordered" },
  },
  layout: {
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
