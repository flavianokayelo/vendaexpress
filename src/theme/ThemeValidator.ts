import type {
  ThemeManifest,
  ThemeValidationResult,
  ThemeValidationIssue,
  FullTokenSet,
  ComponentTokens,
} from './types';

const REQUIRED_MANIFEST_FIELDS: (keyof ThemeManifest)[] = [
  'id', 'name', 'label', 'description', 'version',
  'minimumStorefrontVersion', 'tags',
];

const REQUIRED_TOKEN_GROUPS: (keyof FullTokenSet)[] = [
  'colors', 'radius', 'shadows', 'typography', 'spacing', 'motion',
];

const REQUIRED_COMPONENTS: (keyof ComponentTokens)[] = [
  'button', 'card', 'form', 'header', 'footer', 'hero', 'banner', 'section', 'animation',
];

const REQUIRED_THEME_COLORS: (keyof FullTokenSet['colors'])[] = [
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
  'accent', 'accent-foreground', 'surface', 'background',
  'muted', 'muted-foreground', 'border', 'text', 'text-secondary',
];

function checkManifest(manifest: ThemeManifest | null | undefined): ThemeValidationIssue[] {
  const issues: ThemeValidationIssue[] = [];

  if (!manifest) {
    issues.push({ level: 'error', code: 'MANIFEST_MISSING', message: 'theme.json não encontrado ou inválido' });
    return issues;
  }

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    const value = manifest[field];
    if (value === undefined || value === null || value === '') {
      issues.push({
        level: 'error',
        code: `MANIFEST_MISSING_${field.toUpperCase()}`,
        message: `Campo obrigatório "${field}" em falta no theme.json`,
        field,
      });
    }
  }

  if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id)) {
    issues.push({
      level: 'error',
      code: 'MANIFEST_INVALID_ID',
      message: 'O id do tema deve conter apenas letras minúsculas, números e hífen',
      field: 'id',
    });
  }

  if (manifest.version && !/^\d+\.\d+\.\d+$/.test(manifest.version)) {
    issues.push({
      level: 'warn',
      code: 'MANIFEST_INVALID_VERSION',
      message: `Version "${manifest.version}" não segue semver (X.Y.Z)`,
      field: 'version',
    });
  }

  if (!manifest.author || (!manifest.author.name && typeof manifest.author === 'string')) {
    issues.push({
      level: 'info',
      code: 'MANIFEST_MISSING_AUTHOR_URL',
      message: 'Autor sem URL ou email — considera adicionar "author.name"',
      field: 'author',
    });
  }

  if (!manifest.preview) {
    issues.push({
      level: 'warn',
      code: 'MANIFEST_MISSING_PREVIEW',
      message: 'Sem imagem de preview — o tema não terá thumbnail na galeria',
      field: 'preview',
    });
  }

  return issues;
}

function checkTokens(tokens: FullTokenSet | null | undefined): ThemeValidationIssue[] {
  const issues: ThemeValidationIssue[] = [];

  if (!tokens) {
    issues.push({ level: 'error', code: 'TOKENS_MISSING', message: 'Tokens não definidos' });
    return issues;
  }

  for (const group of REQUIRED_TOKEN_GROUPS) {
    if (!tokens[group] || typeof tokens[group] !== 'object') {
      issues.push({
        level: 'error',
        code: `TOKENS_MISSING_${String(group).toUpperCase()}`,
        message: `Token group "${String(group)}" em falta ou inválido`,
      });
      continue;
    }
  }

  if (tokens.colors) {
    for (const color of REQUIRED_THEME_COLORS) {
      if (!tokens.colors[color]) {
        issues.push({
          level: 'error',
          code: `TOKENS_MISSING_COLOR_${color.toUpperCase()}`,
          message: `Cor "${color}" em falta nos tokens de cores`,
          field: `colors.${color}`,
        });
      }
    }
  }

  return issues;
}

function checkComponents(components: ComponentTokens | null | undefined): ThemeValidationIssue[] {
  const issues: ThemeValidationIssue[] = [];

  if (!components) {
    issues.push({ level: 'error', code: 'COMPONENTS_MISSING', message: 'Component tokens não definidos' });
    return issues;
  }

  for (const comp of REQUIRED_COMPONENTS) {
    if (!components[comp] || typeof components[comp] !== 'object') {
      issues.push({
        level: 'error',
        code: `COMPONENTS_MISSING_${String(comp).toUpperCase()}`,
        message: `Component "${String(comp)}" em falta nos component tokens`,
      });
    }
  }

  return issues;
}

function validateRequiredFiles(themeId: string): ThemeValidationIssue[] {
  const issues: ThemeValidationIssue[] = [];
  try {
    const modules = import.meta.glob('../themes/*/index.ts', { eager: false });
    const found = Object.keys(modules).some((p) => p.includes(`/themes/${themeId}/index.ts`));
    if (!found) {
      issues.push({
        level: 'error',
        code: 'REQUIRED_FILE_INDEX',
        message: `src/themes/${themeId}/index.ts não encontrado`,
      });
    }
  } catch {
    issues.push({
      level: 'warn',
      code: 'REQUIRED_FILES_UNCHECKABLE',
      message: 'Não foi possível verificar ficheiros obrigatórios (ambiente de build)',
    });
  }
  return issues;
}

export function validateTheme(
  themeId: string,
  manifest: ThemeManifest | null | undefined,
  tokens: FullTokenSet | null | undefined,
  components: ComponentTokens | null | undefined,
): ThemeValidationResult {
  const manifestIssues = checkManifest(manifest);
  const tokensIssues = checkTokens(tokens);
  const componentsIssues = checkComponents(components);
  const filesIssues = validateRequiredFiles(themeId);

  const allIssues = [...manifestIssues, ...tokensIssues, ...componentsIssues, ...filesIssues];

  const hasErrors = allIssues.some((i) => i.level === 'error');

  return {
    valid: !hasErrors,
    themeId,
    issues: allIssues,
    manifestValid: manifestIssues.filter((i) => i.level === 'error').length === 0,
    tokensValid: tokensIssues.filter((i) => i.level === 'error').length === 0,
    componentsValid: componentsIssues.filter((i) => i.level === 'error').length === 0,
    requiredFilesPresent: filesIssues.filter((i) => i.level === 'error').length === 0,
  };
}

export function formatValidationResult(result: ThemeValidationResult): string {
  const parts = [`Theme "${result.themeId}": ${result.valid ? 'PASS' : 'FAIL'}`];
  for (const issue of result.issues) {
    const icon = issue.level === 'error' ? '❌' : issue.level === 'warn' ? '⚠️' : 'ℹ️';
    const field = issue.field ? ` (${issue.field})` : '';
    parts.push(`  ${icon} [${issue.code}]${field} ${issue.message}`);
  }
  return parts.join('\n');
}
