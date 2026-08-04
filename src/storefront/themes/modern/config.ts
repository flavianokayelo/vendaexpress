import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "modern",
  tokens: {
    colors: {
      primary: "#111827",
      primaryHover: "#030712",
      accent: "#2563EB",
      ink: "#0F172A",
      inkSecondary: "#64748B",
      surface: "#FFFFFF",
      surfaceMuted: "#F8FAFC",
      line: "#E2E8F0",
      success: "#16A34A",
      danger: "#E11D48",
      warning: "#F59E0B",
    },
    typography: {
      fontDisplay: "'Inter', ui-sans-serif, system-ui, sans-serif",
      fontBody: "'Inter', ui-sans-serif, system-ui, sans-serif",
    },
    radius: { sm: 8, md: 14, lg: 20, pill: 9999 },
    spacing: { unit: 8, sectionGap: 72 },
    buttons: { style: "solid", radius: "md" },
    card: { style: "flat", imageAspect: "1:1", hoverEffect: "lift" },
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