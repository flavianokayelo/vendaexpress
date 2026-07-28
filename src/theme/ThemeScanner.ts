import type { ThemeManifest, ThemeScannerResult } from './types';

type GlobManifest = Record<string, () => Promise<{ default: ThemeManifest }>>;

let scanned: ThemeScannerResult[] | null = null;

function extractThemeId(filePath: string): string | null {
  const match = filePath.match(/\/themes\/([^/]+)\/theme\.json$/);
  return match ? match[1] : null;
}

async function scanViaGlob(): Promise<ThemeScannerResult[]> {
  const modules: GlobManifest = import.meta.glob('../themes/*/theme.json', { eager: false });
  const entries = Object.entries(modules);
  const results: ThemeScannerResult[] = [];

  for (const [filePath, loader] of entries) {
    const id = extractThemeId(filePath);
    if (!id) continue;
    try {
      const mod = await loader();
      const manifest = mod.default as ThemeManifest;
      if (!manifest || !manifest.id) continue;
      results.push({
        id: manifest.id,
        manifest,
        basePath: filePath.replace('/theme.json', ''),
      });
    } catch {
      continue;
    }
  }

  return results;
}

export async function scanThemes(): Promise<ThemeScannerResult[]> {
  if (scanned) return scanned;
  scanned = await scanViaGlob();
  return scanned;
}

export function getCachedScannedThemes(): ThemeScannerResult[] | null {
  return scanned;
}

export function clearThemeScanCache(): void {
  scanned = null;
}

export async function getThemeManifest(id: string): Promise<ThemeManifest | null> {
  const themes = await scanThemes();
  return themes.find((t) => t.id === id)?.manifest ?? null;
}

export async function getThemeBasePath(id: string): Promise<string | null> {
  const themes = await scanThemes();
  return themes.find((t) => t.id === id)?.basePath ?? null;
}

export async function getAllThemeIds(): Promise<string[]> {
  const themes = await scanThemes();
  return themes.map((t) => t.id);
}
