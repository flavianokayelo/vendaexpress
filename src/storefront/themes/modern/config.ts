import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "modern",
  tokens: {
    colors: {
      primary: "#FB7701",
      primaryHover: "#E56A00",
      accent: "#FB7701",
      ink: "#1F1F1F",
      inkSecondary: "#767676",
      surface: "#FFFFFF",
      surfaceMuted: "#F6F6F6",
      line: "#ECECEC",
      success: "#0A8C4B",
      danger: "#E43F3F",
      warning: "#C99A1E",
    },
    typography: {
      fontDisplay: "'Inter', ui-sans-serif, system-ui, sans-serif",
      fontBody: "'Inter', ui-sans-serif, system-ui, sans-serif",
    },
    radius: { sm: 6, md: 10, lg: 16, pill: 9999 },
    spacing: { unit: 8, sectionGap: 56 },
    buttons: { style: "solid", radius: "sm" },
    card: { style: "flat", imageAspect: "1:1", hoverEffect: "lift" },
  },
  layout: {
    productCardVariant: "dense",
    productGridVariant: "dense",
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
