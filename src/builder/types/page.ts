export type PageStatus = 'draft' | 'published' | 'archived';
export type PageTemplate = 'blank' | 'home' | 'about' | 'contact' | 'custom';

export interface PageMeta {
  description?: string;
  keywords?: string[];
  ogImage?: string;
  themeId?: string;
}

export interface PageSection {
  id: string;
  type: string;
  settings: Record<string, unknown>;
  style: Record<string, unknown>;
  children?: PageSection[];
}

export interface Page {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  template: PageTemplate;
  status: PageStatus;
  sections: PageSection[];
  meta?: PageMeta;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface PageCreate {
  storeId: string;
  title: string;
  slug: string;
  template?: PageTemplate;
  sections?: PageSection[];
  meta?: PageMeta;
}

export interface PageUpdate {
  title?: string;
  slug?: string;
  status?: PageStatus;
  sections?: PageSection[];
  meta?: PageMeta;
}

export interface PageExport {
  version: string;
  generator: string;
  page: {
    title: string;
    slug: string;
    template: PageTemplate;
    meta?: PageMeta;
    sections: PageSection[];
  };
}

export const PAGE_TEMPLATES: Record<PageTemplate, { label: string; description: string; defaultSections: string[] }> = {
  blank: { label: 'Página em branco', description: 'Começa do zero', defaultSections: [] },
  home: { label: 'Página inicial', description: 'Layout completo de homepage', defaultSections: ['hero', 'product-grid', 'promo-banner', 'testimonials', 'newsletter', 'footer-links'] },
  about: { label: 'Sobre nós', description: 'Página institucional', defaultSections: ['hero', 'text-block', 'image-text', 'testimonials'] },
  contact: { label: 'Contactos', description: 'Página de contacto', defaultSections: ['text-block', 'footer-links'] },
  custom: { label: 'Personalizado', description: 'Layout personalizado', defaultSections: [] },
};
