import type { ThemeRegistry, ThemeRegistryEntry, ThemeId, ThemeManifest } from './types';
import { scanThemes } from './ThemeScanner';
import { themeLogger } from './ThemeLogger';

const dynamicRegistry: ThemeRegistry = {};

function manifestToEntry(manifest: ThemeManifest): ThemeRegistryEntry {
  return {
    id: manifest.id,
    name: manifest.name,
    label: manifest.label,
    description: manifest.description,
    preview: manifest.preview,
    author: manifest.author?.name ?? 'Desconhecido',
    version: manifest.version,
    tags: manifest.tags ?? [],
    supportsDarkMode: manifest.supportsDarkMode,
    premium: manifest.premium,
    minimumStorefrontVersion: manifest.minimumStorefrontVersion,
    capabilities: manifest.capabilities,
  };
}

export async function buildRegistry(): Promise<ThemeRegistry> {
  try {
    const scanned = await scanThemes();
    const registry: ThemeRegistry = {};
    for (const result of scanned) {
      registry[result.id] = manifestToEntry(result.manifest);
      dynamicRegistry[result.id] = manifestToEntry(result.manifest);
    }
    themeLogger.info('ThemeRegistry', `Registo construído com ${Object.keys(registry).length} temas`, {
      themes: Object.keys(registry),
    });
    return registry;
  } catch (err) {
    themeLogger.error('ThemeRegistry', 'Falha ao construir registo de temas', {
      error: err instanceof Error ? err.message : String(err),
    });
    return { ...dynamicRegistry };
  }
}

export function getRegistry(): ThemeRegistry {
  return { ...dynamicRegistry };
}

export function getRegistryEntry(id: ThemeId): ThemeRegistryEntry | null {
  return dynamicRegistry[id] ?? null;
}

export function getAvailableThemes(): ThemeRegistryEntry[] {
  return Object.values(dynamicRegistry);
}

export function isThemeRegistered(id: string): id is ThemeId {
  return id in dynamicRegistry;
}

export function registerTheme(id: ThemeId, entry: ThemeRegistryEntry): void {
  dynamicRegistry[id] = entry;
  themeLogger.info('ThemeRegistry', `Tema "${id}" registado manualmente`, { id, label: entry.label });
}

if (typeof window !== 'undefined') {
  window.addEventListener('venda-theme-register', ((e: CustomEvent) => {
    const entry = e.detail as ThemeRegistryEntry;
    dynamicRegistry[entry.id] = entry;
    themeLogger.info('ThemeRegistry', `Tema "${entry.id}" registado via evento`, { id: entry.id });
  }) as EventListener);
}
