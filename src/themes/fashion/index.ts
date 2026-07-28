import type { Theme } from '../../theme/types';
import { tokens, components } from './tokens';

const config = {
  name: 'fashion',
  label: 'Fashion',
  description: 'Tema moderno para lojas de moda e vestuário',
  author: 'Venda Express',
  version: '1.0.0',
};

const theme: Theme = {
  id: 'fashion',
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
    id: 'fashion', name: 'fashion', label: 'Fashion',
    description: 'Tema moderno para lojas de moda e vestuário',
    author: 'Venda Express', version: '1.0.0',
    tags: ['fashion', 'stylish', 'trendy'],
  },
};

export default theme;
