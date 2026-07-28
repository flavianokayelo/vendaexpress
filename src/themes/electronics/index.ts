import type { Theme } from '../../theme/types';
import { tokens, components } from './tokens';

const config = {
  name: 'electronics',
  label: 'Electronics',
  description: 'Tema tecnológico para lojas de eletrónica',
  author: 'Venda Express',
  version: '1.0.0',
};

const theme: Theme = {
  id: 'electronics',
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
    id: 'electronics', name: 'electronics', label: 'Electronics',
    description: 'Tema tecnológico para lojas de eletrónica',
    author: 'Venda Express', version: '1.0.0',
    tags: ['tech', 'modern', 'gadgets'],
  },
};

export default theme;
