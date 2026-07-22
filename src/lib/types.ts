export type Plan = {
  id: string;
  name: string;
  price: number;
  product_limit: number | null;
  features: string[];
  sort_order: number;
};

export type Store = {
  id: string;
  owner_id: string;
  plan_id: string | null;
  name: string;
  slug: string;
  status: 'trial' | 'active' | 'suspended';
  theme_primary: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp: string | null;
  currency: string;
  created_at: string;
  banner_urls?: string[] | null;   // <-- ADICIONAR ESTA LINHA
};

export type Category = {
  id: string;
  store_id: string;
  name: string;
  icon_url: string | null;
  created_at: string;
};

export type Subcategory = {
  id: string;
  store_id: string;
  category_id: string;
  name: string;
  created_at: string;
};

export type ProductCondition = 'novo' | 'usado' | 'recondicionado';

export type ProductPhoto = {
  url: string;
  hash: string;
};

export type ProductVideo = {
  url: string;
  thumbnail_url: string | null;
};

export type Product = {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  color: string | null;
  color_hex: string | null;
  size: string | null;
  item_condition: ProductCondition;
  image_url: string | null;
  images: ProductPhoto[];
  video: ProductVideo | null;
  active: boolean;
  return_policy: string | null;
  created_at: string;
};

export type Customer = {
  id: string;
  store_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  created_at: string;
};

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  store_id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price: number;
  quantity: number;
};

export type Coupon = {
  id: string;
  store_id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  created_at: string;
};

export type StoreStaff = {
  id: string;
  store_id: string;
  email: string;
  role: string;
  created_at: string;
};