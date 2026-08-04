import type { ThemeConfigData } from "../../../storefrontTheme/types";

// Tema standard = identidade "Aurora" (defaultTheme). Os tokens ficam vazios
// de propósito: o resolveConfig funde sobre o defaultTheme, logo este tema
// É a base — só define o que o distingue (nada, por agora).
export const config: ThemeConfigData = {
  id: "standard",
  tokens: {},
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
