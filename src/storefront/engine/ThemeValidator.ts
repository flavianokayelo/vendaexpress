// =============================================================================
// ThemeValidator — valida um tema contra o ThemeContract (engine v2).
//
// Validação por 3 níveis:
//   - ERROR  → impede o registo. O ThemeRegistry ignora o tema e o storefront
//              cai para o fallback (standard) de forma previsível, em runtime,
//              sem derrubar a loja.
//   - WARNING → o tema regista-se, mas com avisos (ex: sem preview, sem author).
//   - INFO   → diagnóstico (ex: página opcional em falta → usa fallback partilhado).
import type { ThemeComponents, ThemeContract, ThemePages } from "../contract";
import { CONTRACT_VERSION, ENGINE_VERSION, OPTIONAL_PAGES, REQUIRED_PARTS } from "../contract";
import type { ThemeConfigData } from "../../storefrontTheme/types";

export type ValidationLevel = "error" | "warning" | "info";

export type ValidationIssue =
  | { level: "error"; code: "engine-version"; expected: string; received: string }
  | { level: "error"; code: "contract-version"; expected: number; received: number | null }
  | { level: "error"; code: "no-manifest" }
  | { level: "error"; code: "invalid-config"; reason: string }
  | { level: "error"; code: "id-mismatch"; id: string; received: string }
  | { level: "error"; code: "missing-part"; part: string }
  | { level: "warning"; code: "missing-preview" }
  | { level: "warning"; code: "missing-author" }
  | { level: "warning"; code: "missing-tags" }
  | { level: "info"; code: "fallback-page"; page: keyof ThemePages }
  | { level: "info"; code: "fallback-component"; name: keyof ThemeComponents };

export class ThemeValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(id: string, issues: ValidationIssue[]) {
    super(`Theme "${id}" falhou a validação: ${issues.map(shortDesc).join("; ")}`);
    this.name = "ThemeValidationError";
    this.issues = issues;
  }
}

function shortDesc(i: ValidationIssue): string {
  switch (i.code) {
    case "engine-version":
      return `engineVersion "${i.received}" != esperado "${i.expected}"`;
    case "contract-version":
      return `contractVersion "${i.received}" != esperado "${i.expected}"`;
    case "no-manifest":
      return `manifest em falta`;
    case "invalid-config":
      return `config inválida: ${i.reason}`;
    case "id-mismatch":
      return `id "${i.received}" != esperado "${i.id}"`;
    case "missing-part":
      return `parte obrigatória "${i.part}" em falta`;
    case "missing-preview":
      return `preview em falta (WARNING)`;
    case "missing-author":
      return `author em falta (WARNING)`;
    case "missing-tags":
      return `tags em falta (WARNING)`;
    case "fallback-page":
      return `página "${String(i.page)}" em falta → fallback partilhado (INFO)`;
    case "fallback-component":
      return `componente "${String(i.name)}" em falta → fallback do standard (INFO)`;
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Devolve erros de config (invalid-config) se o ThemeConfigData estiver quebrado. */
export function validateThemeConfig(
  config: ThemeConfigData | null | undefined,
  expectedId?: string
): ValidationIssue[] {
  if (!config || !isObject(config)) {
    return [{ level: "error", code: "invalid-config", reason: "ausente ou não-objecto" }];
  }
  const reasons: string[] = [];
  if (!config.id || (expectedId && config.id !== expectedId)) {
    reasons.push(`id da config (${config.id ?? "sem id"}) != id do tema (${expectedId ?? "sem id"})`);
  }
  if (!isObject(config.tokens)) reasons.push("tokens em falta");
  if (!isObject(config.layout)) reasons.push("layout em falta");
  if (!isObject(config.capabilities)) reasons.push("capabilities em falta");
  return reasons.length > 0
    ? [{ level: "error", code: "invalid-config", reason: reasons.join("; ") }]
    : [];
}

/** Devolve a lista de issues (ERROR+WARNING+INFO); vazia = tema impecável. */
export function validateTheme(theme: ThemeContract, expectedId?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!theme || typeof theme !== "object") {
    return [{ level: "error", code: "no-manifest" }];
  }

  if (expectedId && theme.id !== expectedId) {
    issues.push({ level: "error", code: "id-mismatch", id: expectedId, received: theme.id });
  }

  if (!theme.manifest) {
    issues.push({ level: "error", code: "no-manifest" });
  } else {
    if (theme.manifest.engineVersion !== ENGINE_VERSION) {
      issues.push({
        level: "error",
        code: "engine-version",
        expected: ENGINE_VERSION,
        received: theme.manifest.engineVersion ?? "none",
      });
    }
    if ((theme.manifest.contractVersion ?? CONTRACT_VERSION) !== CONTRACT_VERSION) {
      issues.push({
        level: "error",
        code: "contract-version",
        expected: CONTRACT_VERSION,
        received: theme.manifest.contractVersion ?? null,
      });
    }
    if (!theme.manifest.preview) issues.push({ level: "warning", code: "missing-preview" });
    if (!theme.manifest.author) issues.push({ level: "warning", code: "missing-author" });
    if (!theme.manifest.tags || theme.manifest.tags.length === 0) {
      issues.push({ level: "warning", code: "missing-tags" });
    }
  }

  issues.push(...validateThemeConfig(theme.config, theme.id));

  for (const name of REQUIRED_PARTS.components) {
    if (typeof theme.components?.[name] !== "function") {
      issues.push({ level: "error", code: "missing-part", part: `componentes.${name}` });
      // INFO: se estivesse registado, o registry faria fallback componente-a-componente.
      issues.push({ level: "info", code: "fallback-component", name });
    }
  }

  for (const name of REQUIRED_PARTS.pages) {
    if (typeof theme.pages?.[name] !== "function") {
      issues.push({ level: "error", code: "missing-part", part: `pages.${name}` });
    }
  }

  // INFO: páginas abertas em falta → fallback partilhado. Só reporta quando o
  // tema já implementa pelo menos uma página opcional (senão é um tema
  // single-page e o fallback silencioso é o comportamento esperado).
  const hasAnyOptional = OPTIONAL_PAGES.some((name) => typeof theme.pages?.[name] === "function");
  if (hasAnyOptional) {
    for (const name of OPTIONAL_PAGES) {
      if (typeof theme.pages?.[name] !== "function") {
        issues.push({ level: "info", code: "fallback-page", page: name });
      }
    }
  }

  return issues;
}

/** Conveniência: só as issues que bloqueiam o registo (ERROR). */
export function validateThemeErrors(theme: ThemeContract, expectedId?: string): ValidationIssue[] {
  return validateTheme(theme, expectedId).filter((issue) => issue.level === "error");
}

export function hasBlockingIssues(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.level === "error");
}

/** Conveniência: devolve true se o tema não tem erros (WARNING/INFO são tolerados). */
export function assertValidTheme(theme: ThemeContract, expectedId?: string): void {
  const errors = validateThemeErrors(theme, expectedId);
  if (errors.length > 0) {
    throw new ThemeValidationError(theme.id ?? "(sem id)", errors);
  }
}
