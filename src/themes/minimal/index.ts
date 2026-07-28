import type { Theme } from '../../theme/types';
import { tokens, components } from './tokens';

const config = {
  name: 'minimal',
  label: 'Minimal',
  description: 'Tema minimalista com foco no produto',
  author: 'Venda Express',
  version: '1.0.0',
};

const theme: Theme = {
  id: 'minimal',
  config,
  tokens,
  components,
  ThemeComponents: {
    Header: () => null, Footer: () => null, Hero: () => null,
    ProductCard: () => null, ProductGrid: () => null, CategoryList: () => null,
    CartDrawer: () => null, WishlistButton: () => null, SearchBar: () => null,
    Button: () => null, Input: () => null, Section: () => null, Banner: () => null,
  },
  registry: {
    id: 'minimal', name: 'minimal', label: 'Minimal',
    description: 'Tema minimalista com foco no produto',
    author: 'Venda Express', version: '1.0.0',
    tags: ['minimal', 'clean', 'modern'],
  },
};

export default theme;
