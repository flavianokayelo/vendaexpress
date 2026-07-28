import type { Theme, ThemeId } from './types';
import { scanThemes } from './ThemeScanner';
import { themeLogger } from './ThemeLogger';

export class ThemeLoadError extends Error {
  constructor(themeId: string, cause?: unknown) {
    super(
      `Falha ao carregar tema "${themeId}": ${cause instanceof Error ? cause.message : 'Erro desconhecido'}`,
    );
    this.name = 'ThemeLoadError';
  }
}

type ThemeModule = { default: Theme };
type GlobThemeModules = Record<string, () => Promise<ThemeModule>>;

let dynamicImportMap: Record<string, () => Promise<ThemeModule>> | null = null;

async function buildDynamicImportMap(): Promise<Record<string, () => Promise<ThemeModule>>> {
  if (dynamicImportMap) return dynamicImportMap;

  const modules: GlobThemeModules = import.meta.glob('../themes/*/index.ts', { eager: false });
  const map: Record<string, () => Promise<ThemeModule>> = {};

  for (const [filePath, loader] of Object.entries(modules)) {
    const match = filePath.match(/\/themes\/([^/]+)\/index\.ts$/);
    if (match) {
      map[match[1]] = loader;
    }
  }

  dynamicImportMap = map;

  const ids = Object.keys(map);
  themeLogger.info('ThemeLoader', `Mapa de imports construído: ${ids.length} temas detetados`, {
    themes: ids,
    files: Object.keys(modules),
  });

  return map;
}

export async function loadTheme(themeId: ThemeId): Promise<Theme> {
  const id = typeof themeId === 'string' ? themeId : 'standard';
  themeLogger.debug('ThemeLoader', `A carregar tema "${id}"`);

  try {
    const importMap = await buildDynamicImportMap();
    const loader = importMap[id];

    if (!loader) {
      themeLogger.warn('ThemeLoader', `Tema "${id}" não encontrado na descoberta automática`, {
        knownThemes: Object.keys(importMap),
      });
      throw new ThemeLoadError(id, new Error(`Tema "${id}" não encontrado — verifica se a pasta existe em src/themes/`));
    }

    const mod = await loader();
    const theme = mod.default;

    if (!theme || !theme.tokens || !theme.components) {
      throw new ThemeLoadError(id, new Error('Tema não exporta "tokens" ou "components" no index.ts'));
    }

    themeLogger.info('ThemeLoader', `Tema "${id}" v${theme.config?.version ?? '?'} carregado`, {
      id,
      version: theme.config?.version,
      hasComponents: Object.keys(theme.ThemeComponents ?? {}).length,
    });

    return theme;
  } catch (cause) {
    if (cause instanceof ThemeLoadError) throw cause;
    throw new ThemeLoadError(id, cause);
  }
}

export function clearLoaderCache(): void {
  dynamicImportMap = null;
  themeLogger.debug('ThemeLoader', 'Cache de imports limpo');
}
