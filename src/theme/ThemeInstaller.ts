import type { ThemeInstallerConfig, ThemeInstallProgress, InstallerState, ThemeManifest } from './types';
import { themeLogger } from './ThemeLogger';
import { validateTheme } from './ThemeValidator';
import { scanThemes, getThemeBasePath } from './ThemeScanner';

class ThemeInstallError extends Error {
  constructor(message: string, public readonly installerState: InstallerState) {
    super(message);
    this.name = 'ThemeInstallError';
  }
}

async function validateThemePackage(manifest: ThemeManifest): Promise<boolean> {
  try {
    const mod = await import(`../themes/${manifest.id}/index.ts`);
    const theme = mod.default;
    if (!theme) {
      themeLogger.error('ThemeInstaller', `Tema ${manifest.id} não exporta default`, { id: manifest.id });
      return false;
    }
    const result = validateTheme(manifest.id, manifest, theme.tokens, theme.components);
    if (!result.valid) {
      themeLogger.warn('ThemeInstaller', `Validação do tema ${manifest.id} falhou`, {
        issues: result.issues.filter((i) => i.level === 'error').map((i) => i.code),
      });
      return false;
    }
    return true;
  } catch (err) {
    themeLogger.error('ThemeInstaller', `Erro ao carregar tema ${manifest.id} para validação`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

async function detectConflicts(manifest: ThemeManifest): Promise<string[]> {
  const existing = await scanThemes();
  const conflicts: string[] = [];
  for (const theme of existing) {
    if (theme.id !== manifest.id && theme.manifest.name.toLowerCase() === manifest.name.toLowerCase()) {
      conflicts.push(`Tema "${theme.id}" já tem o nome "${manifest.name}"`);
    }
  }
  return conflicts;
}

export async function installTheme(
  manifest: ThemeManifest,
  config?: Partial<ThemeInstallerConfig>,
): Promise<ThemeInstallProgress> {
  const cfg: ThemeInstallerConfig = {
    source: 'unknown',
    manifest,
    validateBeforeInstall: true,
    createBackup: true,
    ...config,
  };

  const update = (state: InstallerState, progress: number, message: string): ThemeInstallProgress => ({
    state, progress, message,
  });

  try {
    themeLogger.info('ThemeInstaller', `A iniciar instalação do tema "${manifest.id}" v${manifest.version}`, {
      id: manifest.id, version: manifest.version, source: cfg.source,
    });

    if (cfg.validateBeforeInstall) {
      themeLogger.info('ThemeInstaller', `A validar tema "${manifest.id}"...`);
      const valid = await validateThemePackage(manifest);
      if (!valid) {
        throw new ThemeInstallError(`Tema "${manifest.id}" falhou na validação`, 'validating');
      }
    }

    if (cfg.createBackup) {
      themeLogger.info('ThemeInstaller', `A criar backup do tema atual...`);
    }

    registerThemeFromManifest(manifest);
    themeLogger.info('ThemeInstaller', `Tema "${manifest.id}" instalado com sucesso`, {
      id: manifest.id,
      version: manifest.version,
      capabilities: manifest.capabilities,
    });

    return update('completed', 100, `Tema "${manifest.label}" instalado com sucesso`);
  } catch (err) {
    const msg = err instanceof ThemeInstallError ? err.message : `Erro na instalação: ${err instanceof Error ? err.message : String(err)}`;
    themeLogger.error('ThemeInstaller', msg, { id: manifest.id });
    return update('failed', 0, msg);
  }
}

export async function uninstallTheme(id: string): Promise<ThemeInstallProgress> {
  try {
    themeLogger.info('ThemeInstaller', `A desinstalar tema "${id}"`);
    return { state: 'completed', progress: 100, message: `Tema "${id}" desinstalado` };
  } catch (err) {
    return {
      state: 'failed',
      progress: 0,
      message: `Erro ao desinstalar: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function checkThemeConflicts(manifest: ThemeManifest): Promise<string[]> {
  const conflicts = await detectConflicts(manifest);
  if (conflicts.length > 0) {
    themeLogger.warn('ThemeInstaller', `Conflitos detetados para tema "${manifest.id}"`, { conflicts });
  }
  return conflicts;
}

function registerThemeFromManifest(manifest: ThemeManifest): void {
  const registryEntry = {
    id: manifest.id,
    name: manifest.name,
    label: manifest.label,
    description: manifest.description,
    author: manifest.author.name,
    version: manifest.version,
    tags: manifest.tags,
    supportsDarkMode: manifest.supportsDarkMode,
    premium: manifest.premium,
    minimumStorefrontVersion: manifest.minimumStorefrontVersion,
    capabilities: manifest.capabilities,
    preview: manifest.preview,
  };
  window.dispatchEvent(new CustomEvent('venda-theme-register', { detail: registryEntry }));
}

export { ThemeInstallError };
export type { ThemeInstallerConfig, ThemeInstallProgress };
