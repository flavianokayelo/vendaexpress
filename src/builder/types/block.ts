import type { ComponentType, ReactNode } from 'react';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'color'
  | 'image'
  | 'select'
  | 'number'
  | 'boolean'
  | 'range'
  | 'link'
  | 'icon'
  | 'date'
  | 'url';

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldSchema {
  type: FieldType;
  label: string;
  default: unknown;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  hint?: string;
  section?: string;
  required?: boolean;
  validate?: (value: unknown) => string | null;
}

export interface SectionSchema {
  title?: string;
  fields: FieldSchema[];
}

export interface BlockSchema {
  sections?: SectionSchema[];
  fields?: FieldSchema[];
  styleFields?: FieldSchema[];
  supportsChildren?: boolean;
  maxChildren?: number;
}

export interface BlockSettings {
  [key: string]: unknown;
}

export interface BlockStyles {
  [key: string]: unknown;
}

export interface BlockProps {
  id: string;
  type: string;
  settings: BlockSettings;
  style?: BlockStyles;
  isEditing?: boolean;
  onSelect?: (id: string) => void;
  onChangeSettings?: (settings: BlockSettings) => void;
  children?: ReactNode;
}

export interface EditorProps {
  id: string;
  type: string;
  settings: BlockSettings;
  style: BlockStyles;
  onChangeSettings: (settings: BlockSettings) => void;
  onChangeStyle: (style: BlockStyles) => void;
}

export type BlockComponent = ComponentType<BlockProps>;
export type EditorComponent = ComponentType<EditorProps>;

export type BlockCategory =
  | 'hero'
  | 'products'
  | 'marketing'
  | 'content'
  | 'footer'
  | 'layout';

export const BLOCK_CATEGORIES: Record<BlockCategory, { label: string; description: string }> = {
  hero: { label: 'Hero', description: 'Secções de cabeçalho e destaque' },
  products: { label: 'Produtos', description: 'Secções de catálogo e produtos' },
  marketing: { label: 'Marketing', description: 'Secções promocionais e conversão' },
  content: { label: 'Conteúdo', description: 'Blocos de texto e media' },
  footer: { label: 'Rodapé', description: 'Secções de footer' },
  layout: { label: 'Layout', description: 'Blocos estruturais' },
};

export interface BlockDefinition {
  type: string;
  label: string;
  icon: string;
  category: BlockCategory;
  schema: BlockSchema;
  defaults: BlockSettings;
  component: BlockComponent;
  editor?: EditorComponent;
  description?: string;
  preview?: string;
  storefrontOnly?: boolean;
}

export interface BlockInstance {
  id: string;
  type: string;
  settings: BlockSettings;
  style: BlockStyles;
  children?: BlockInstance[];
}
