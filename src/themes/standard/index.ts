import type { Theme } from '../../theme/types';
import { tokens, components } from './tokens';

const config = {
  name: 'standard',
  label: 'Standard',
  description: 'Tema padrão universal para lojas de e-commerce',
  author: 'Venda Express',
  version: '1.0.0',
};

const theme: Theme = {
  id: 'standard',
  config,
  tokens,
  components,
  ThemeComponents: {
    Header: () => null,
    Footer: () => null,
    Hero: () => null,
    ProductCard: () => null,
    ProductGrid: () => null,
    CategoryList: () => null,
    CartDrawer: () => null,
    WishlistButton: () => null,
    SearchBar: () => null,
    Button: () => null,
    Input: () => null,
    Section: () => null,
    Banner: () => null,
  },
  registry: {
    id: 'standard',
    name: 'standard',
    label: 'Standard',
    description: 'Tema padrão universal para lojas de e-commerce',
    author: 'Venda Express',
    version: '1.0.0',
    tags: ['universal', 'clean', 'professional'],
  },
};

export default theme;
export type StandardTheme = typeof theme;
