import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "fashion",
  tokens: {
    colors: {
      primary: "#2F7D4F",
      primaryHover: "#266843",
      accent: "#2F7D4F",
      ink: "#191919",
      inkSecondary: "#8C8C8C",
      surface: "#FFFFFF",
      surfaceMuted: "#F2F0ED",
      line: "#E7E4E0",
      success: "#2F7D4F",
      danger: "#C0322B",
      warning: "#D97706",
    },
    typography: {
      fontDisplay: "'Archivo', ui-sans-serif, system-ui, sans-serif",
      fontBody: "'Jost', ui-sans-serif, system-ui, sans-serif",
    },
    radius: { sm: 2, md: 4, lg: 8, pill: 9999 },
    spacing: { unit: 8, sectionGap: 48 },
    shadow: {
      sm: "0 2px 8px rgba(25,25,25,0.06)",
      md: "0 8px 24px rgba(25,25,25,0.10)",
      lg: "0 16px 40px rgba(25,25,25,0.14)",
      xl: "0 24px 60px rgba(25,25,25,0.18)",
    },
    buttons: { style: "solid", radius: "sm" },
    card: { style: "flat", imageAspect: "4:5", hoverEffect: "zoom" },
  },
  layout: {
    header: { variant: "centered-logo", showAnnouncementBar: true },
    productCardVariant: "fashion",
    productGridVariant: "fashion",
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