import type { ThemeConfig } from './types';
import type { Store } from '../lib/types';
import { resolveConfig } from './resolveConfig';

/**
 * Combina o tema da loja num ThemeConfig pronto a usar. Antigo ponto único de
 * merge (defaultTheme → preset theme_id → theme_config); na engine v2 delega
 * em resolveConfig: defaultTheme → config.ts do tema → theme_config (tokens)
 * → theme_primary. Mantém a assinatura para compatibilidade com as páginas
 * (StorefrontPage, ProductDetailPage, CategoryPage).
 */
export function mergeTheme(
  store: Pick<Store, 'theme_id' | 'theme_config' | 'theme_primary'> | null | undefined
): ThemeConfig {
  return resolveConfig(store?.theme_id, store);
}
