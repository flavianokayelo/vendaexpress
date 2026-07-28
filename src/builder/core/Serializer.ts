import type { Page, PageExport, PageSection } from '../types/page';

export class Serializer {
  static serialize(page: Page): PageExport {
    return {
      version: '1.0',
      generator: 'Venda Express Page Builder',
      page: {
        title: page.title,
        slug: page.slug,
        template: page.template,
        meta: page.meta,
        sections: page.sections,
      },
    };
  }

  static exportToJson(page: Page): string {
    return JSON.stringify(Serializer.serialize(page), null, 2);
  }

  static importFromJson(json: string): { title: string; slug: string; template: Page['template']; meta?: Page['meta']; sections: PageSection[] } {
    let data: PageExport;
    try {
      data = JSON.parse(json);
    } catch {
      throw new Error('JSON inválido');
    }

    if (!data.version || !data.page) {
      throw new Error('Formato de exportação inválido');
    }

    if (!Array.isArray(data.page.sections)) {
      throw new Error('O ficheiro não contém secções válidas');
    }

    return {
      title: data.page.title,
      slug: data.page.slug,
      template: data.page.template ?? 'custom',
      meta: data.page.meta,
      sections: data.page.sections.map((s) => ({
        ...s,
        id: s.id || `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        settings: s.settings ?? {},
        style: s.style ?? {},
      })),
    };
  }

  static validateSections(sections: PageSection[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      if (!s.id) errors.push(`Secção ${i}: falta id`);
      if (!s.type) errors.push(`Secção ${i}: falta type`);
      if (s.settings && typeof s.settings !== 'object') errors.push(`Secção ${i}: settings inválido`);
      if (s.style && typeof s.style !== 'object') errors.push(`Secção ${i}: style inválido`);
    }
    return { valid: errors.length === 0, errors };
  }

  static createExportBlob(page: Page): Blob {
    return new Blob([Serializer.exportToJson(page)], { type: 'application/json' });
  }

  static downloadExport(page: Page, filename?: string): void {
    const blob = Serializer.createExportBlob(page);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename ?? `${page.slug}-page.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
