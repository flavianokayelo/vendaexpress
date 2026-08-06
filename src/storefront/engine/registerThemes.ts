// =============================================================================
// registerThemes — registo único de todos os temas da engine v2.
//
// Centraliza o import estático dos 10 temas e o registo no ThemeRegistry.
// As rotas públicas (home, produto, categoria, pesquisa) chamam registerThemes()
// para que o registry esteja sempre povoado, mesmo quando se entra direto numa
// rota sem passar pela home.

import { registerTheme } from "./ThemeRegistry";
import { standardTheme } from "../themes/standard";
import { luxuryTheme } from "../themes/luxury";
import { minimalTheme } from "../themes/minimal";
import { fashionTheme } from "../themes/fashion";
import { electronicsTheme } from "../themes/electronics";
import { modernTheme } from "../themes/modern";
import { fashionLuxeTheme } from "../themes/fashion-luxe";
import { freshMarketTheme } from "../themes/fresh-market";
import { autoProTheme } from "../themes/auto-pro";
import { foodExpressTheme } from "../themes/food-express";

const ALL_THEMES = [
  standardTheme,
  luxuryTheme,
  minimalTheme,
  fashionTheme,
  electronicsTheme,
  modernTheme,
  fashionLuxeTheme,
  freshMarketTheme,
  autoProTheme,
  foodExpressTheme,
];

let registered = false;

export function registerThemes(): void {
  if (registered) return;
  registered = true;
  for (const theme of ALL_THEMES) {
    registerTheme(theme);
  }
}
