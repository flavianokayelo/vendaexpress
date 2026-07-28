import type { Theme } from '../../theme/types';
import { tokens, components } from './tokens';

const config = {
  name: 'luxury',
  label: 'Luxury',
  description: 'Tema premium para marcas de luxo e alto padrão',
  author: 'Venda Express',
  version: '1.0.0',
  preview: '/previews/luxury.png',
};

const theme: Theme = {
  id: 'luxury',
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
    id: 'luxury',
    name: 'luxury',
    label: 'Luxury',
    description: 'Tema premium para marcas de luxo e alto padrão',
    author: 'Venda Express',
    version: '1.0.0',
    tags: ['premium', 'elegant', 'sophisticated'],
  },
};

export default theme;
export type LuxuryTheme = typeof theme;
