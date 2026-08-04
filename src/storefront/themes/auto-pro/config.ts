import type { ThemeConfigData } from "../../../storefrontTheme/types";

export const config: ThemeConfigData = {
  id: "auto-pro",
  tokens: {
    colors: {
      primary: "#B91C1C",
      primaryHover: "#991B1B",
      accent: "#FACC15",
      ink: "#111827",
      inkSecondary: "#4B5563",
      surface: "#FFFFFF",
      surfaceMuted: "#F3F4F6",
      line: "#D1D5DB",
      success: "#16A34A",
      danger: "#DC2626",
      warning: "#F59E0B",
    },
    typography: {
      fontDisplay: "'Bricolage Grotesque', 'Inter', ui-sans-serif, system-ui, sans-serif",
      fontBody: "'Inter', ui-sans-serif, system-ui, sans-serif",
    },
    radius: { sm: 2, md: 6, lg: 10, pill: 9999 },
    buttons: { style: "solid", radius: "sm" },
    card: { style: "bordered", imageAspect: "3:2", hoverEffect: "lift" },
  },
  layout: {
    home: {
      sections: [
        { id: "announcement", enabled: true },
        { id: "hero", enabled: true },
        { id: "profile-bar", enabled: true },
        { id: "feature-rail", enabled: true },
        { id: "categories", enabled: true },
        { id: "promo", enabled: true, layout: "rail", limit: 10 },
        { id: "featured", enabled: true, layout: "grid", limit: 6 },
        { id: "vouchers", enabled: true },
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