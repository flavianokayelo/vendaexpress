import type { FieldSchema, BlockSchema } from '../types/block';
import type { PageSection } from '../types/page';

export function mergeDefaults(schema: BlockSchema, overrides?: Record<string, unknown>): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};
  const allFields = [...(schema.fields ?? []), ...(schema.styleFields ?? [])];
  for (const field of allFields) {
    defaults[field.label] = field.default;
  }
  for (const section of schema.sections ?? []) {
    for (const field of section.fields) {
      defaults[field.label] = field.default;
    }
  }
  return { ...defaults, ...overrides };
}

export function createSection(type: string, schema?: BlockSchema, overrides?: Record<string, unknown>): PageSection {
  const defaults = schema ? mergeDefaults(schema, overrides) : (overrides ?? {});
  const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    type,
    settings: defaults,
    style: {},
  };
}

export function cloneSection(section: PageSection): PageSection {
  return {
    ...structuredClone(section),
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
}

export function getFieldDefault(field: FieldSchema): unknown {
  return field.default;
}
