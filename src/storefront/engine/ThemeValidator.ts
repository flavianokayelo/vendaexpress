// =============================================================================
// ThemeValidator — valida um tema contra o ThemeContract.
//
// Rejeita um tema quebrado com uma mensagem estruturada (ThemeValidationError)
// para que o ThemeRegistry consiga cair para o fallback (standard) de forma
// previsível, em runtime, sem derrubar o storefront.
import type { ThemeComponents, ThemeContract, ThemePages } from "../contract";
import { ENGINE_VERSION, REQUIRED_PARTS } from "../contract";

export type ValidationIssue =
  | { kind: "engine-version"; expected: string; received: string }
  | { kind: "missing-component"; name: keyof ThemeComponents }
  | { kind: "missing-page"; name: keyof ThemePages }
  | { kind: "id-mismatch"; id: string; received: string };

export class ThemeValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(id: string, issues: ValidationIssue[]) {
    super(`Theme "${id}" falhou a validação: ${issues.map(shortDesc).join("; ")}`);
    this.name = "ThemeValidationError";
    this.issues = issues;
  }
}

function shortDesc(i: ValidationIssue): string {
  switch (i.kind) {
    case "engine-version":
      return `engineVersion "${i.received}" != esperado "${i.expected}"`;
    case "missing-component":
      return `componente "${i.name}" em falta`;
    case "missing-page":
      return `página "${i.name}" em falta`;
    case "id-mismatch":
      return `id "${i.received}" != esperado "${i.id}"`;
  }
}

/** Devolve a lista de problemas; vazia = tema válido. */
export function validateTheme(theme: ThemeContract, expectedId?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (expectedId && theme.id !== expectedId) {
    issues.push({ kind: "id-mismatch", id: expectedId, received: theme.id });
  }

  if (!theme.manifest || theme.manifest.engineVersion !== ENGINE_VERSION) {
    issues.push({
      kind: "engine-version",
      expected: ENGINE_VERSION,
      received: theme.manifest?.engineVersion ?? "none",
    });
  }

  for (const name of REQUIRED_PARTS.components) {
    if (typeof theme.components?.[name] !== "function") {
      issues.push({ kind: "missing-component", name });
    }
  }

  for (const name of REQUIRED_PARTS.pages) {
    if (typeof theme.pages?.[name] !== "function") {
      issues.push({ kind: "missing-page", name });
    }
  }

  return issues;
}

/** Conveniência: devolve true se o tema é válido (ou lança ThemeValidationError). */
export function assertValidTheme(theme: ThemeContract, expectedId?: string): void {
  const issues = validateTheme(theme, expectedId);
  if (issues.length > 0) {
    throw new ThemeValidationError(theme.id ?? "(sem id)", issues);
  }
}