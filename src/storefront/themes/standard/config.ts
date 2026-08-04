import type { ThemeConfigData } from "../../../storefrontTheme/types";

// Tema standard = identidade "Aurora" (defaultTheme). Os tokens ficam vazios
// de propósito: o resolveConfig funde sobre o defaultTheme, logo este tema
// É a base — só define o que o distingue (nada, por agora).
export const config: ThemeConfigData = {
  id: "standard",
  tokens: {},
  layout: {
    hero: { mode: "carousel" },
    home: {
      sections: [
        { id: "announcement", enabled: true },
        { id: "hero", enabled: true },
        { id: "promo-banners", enabled: true },
        { id: "profile-bar", enabled: true },
        { id: "tabs", enabled: true },
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
