import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "fashion",
  tokens: {
    colors: {
      primary: "#be123c",
      primaryHover: "#9f1239",
      accent: "#f43f5e",
      ink: "#4c0519",
      inkSecondary: "#9d174d",
      surface: "#ffffff",
      surfaceMuted: "#fff5f8",
      line: "#fce7f3",
      success: "#16a34a",
      danger: "#e11d48",
      warning: "#f59e0b",
    },
    radius: { sm: 6, md: 12, lg: 16, pill: 9999 },
    buttons: { style: "pill", radius: "pill" },
    card: { style: "padded-tint" },
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