const API_URL = 'http://localhost:4000/api';
export const BACKEND_ORIGIN = 'http://localhost:4000';
const TOKEN_KEY = 've_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_ORIGIN}${path}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Erro na comunicação com o servidor');
  }
  return data as T;
}

// Upload de ficheiros usa FormData, por isso não passa pelo request() genérico (que força JSON)
export async function uploadCategoryIcon(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/uploads/category-icon`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao enviar imagem');
  }
  return data;
}

export type UploadedPhoto = { url: string; hash: string };

export async function uploadProductImages(files: File[]): Promise<{ photos: UploadedPhoto[] }> {
  const token = getToken();
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const res = await fetch(`${API_URL}/uploads/product-images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao enviar imagens');
  }
  return data;
}

export async function uploadProductVideo(
  file: File,
  thumbnail: Blob | null
): Promise<{ url: string; thumbnail_url: string | null }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('video', file);
  if (thumbnail) formData.append('thumbnail', thumbnail, 'thumb.jpg');

  const res = await fetch(`${API_URL}/uploads/product-video`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao enviar vídeo');
  }
  return data;
}

export async function uploadStoreLogo(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_URL}/uploads/store-logo`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao enviar logótipo');
  }
  return data;
}

export async function uploadStoreBanner(files: File[]): Promise<{ urls: string[] }> {
  const token = getToken();
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const res = await fetch(`${API_URL}/uploads/store-banner`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao enviar banner');
  }
  return data;
}

export async function aiAssistImage(
  file: File
): Promise<{ name: string; description: string; color: string; category?: string; from_cache: boolean }> {
  const token = getToken();
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${API_URL}/products/ai-assist-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao analisar imagem');
  }
  return data;
}

export const api = {
  auth: {
    signup: (email: string, password: string) =>
      request<{ user: { id: string; email: string }; token: string }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email: string, password: string) =>
      request<{ user: { id: string; email: string }; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: { id: string; email: string } }>('/auth/me'),
  },
  plans: {
    list: () => request<any[]>('/plans'),
  },
  stores: {
    getMine: () => request<any>('/stores/mine'),
    getStats: () =>
      request<{ products: number; orders: number; customers: number; revenue: number; recentOrders: any[] }>(
        '/stores/mine/stats'
      ),
    create: (payload: { name: string; slug: string; plan_id: string | null }) =>
      request<any>('/stores', { method: 'POST', body: JSON.stringify(payload) }),
    update: (payload: { theme_primary: string; description: string | null; logo_url: string | null; banner_urls: string[] }) =>
      request<any>('/stores/mine', { method: 'PUT', body: JSON.stringify(payload) }),
  },
  admin: {
    listStores: () => request<any[]>('/admin/stores'),
    getStats: () => request<{ stores: number; products: number; orders: number; revenue: number }>('/admin/stats'),
  },
  categories: {
    list: () => request<any[]>('/categories'),
    create: (name: string, icon_url?: string | null) =>
      request<any>('/categories', { method: 'POST', body: JSON.stringify({ name, icon_url }) }),
    update: (id: string, name: string, icon_url?: string | null) =>
      request<any>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify({ name, icon_url }) }),
    remove: (id: string) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
  },
  subcategories: {
    list: (categoryId?: string) =>
      request<any[]>(`/subcategories${categoryId ? `?category_id=${categoryId}` : ''}`),
    create: (categoryId: string, name: string) =>
      request<any>('/subcategories', { method: 'POST', body: JSON.stringify({ category_id: categoryId, name }) }),
    update: (id: string, name: string) =>
      request<any>(`/subcategories/${id}`, { method: 'PUT', body: JSON.stringify({ name }) }),
    remove: (id: string) => request<void>(`/subcategories/${id}`, { method: 'DELETE' }),
  },
  products: {
    list: () => request<any[]>('/products'),
    create: (payload: Record<string, any>) =>
      request<any>('/products', { method: 'POST', body: JSON.stringify(payload) }),
    update: (id: string, payload: Record<string, any>) =>
      request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    remove: (id: string) => request<void>(`/products/${id}`, { method: 'DELETE' }),
    aiAssist: (keywords: string, category?: string) =>
      request<{ name: string; description: string }>('/products/ai-assist', {
        method: 'POST',
        body: JSON.stringify({ keywords, category }),
      }),
    searchByHash: (hash: string) =>
      request<{ match: { product_id: string; name: string } | null }>(`/products/search-by-hash?hash=${hash}`),
  },
  orders: {
    list: () => request<any[]>('/orders'),
    getItems: (orderId: string) => request<any[]>(`/orders/${orderId}/items`),
    updateStatus: (orderId: string, status: string) =>
      request<any>(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  },
  customers: {
    list: () => request<any[]>('/customers'),
  },
  storefront: {
    get: (slug: string) =>
      request<{ store: any; categories: any[]; products: any[] }>(`/storefront/${slug}`),
    getProduct: (slug: string, id: string) =>
      request<{ store: any; product: any; category: any | null; related: any[] }>(
        `/storefront/${slug}/products/${id}`
      ),
    validateCoupon: (slug: string, code: string) =>
      request<any>(`/storefront/${slug}/coupons/validate`, { method: 'POST', body: JSON.stringify({ code }) }),
    placeOrder: (
      slug: string,
      payload: { name: string; phone: string; address: string; items: { product_id: string; quantity: number }[]; coupon_code?: string }
    ) => request<{ order_id: string; total: number }>(`/storefront/${slug}/orders`, { method: 'POST', body: JSON.stringify(payload) }),
    getCart: (slug: string, guestId: string) =>
      request<{ product: any; quantity: number }[]>(`/storefront/${slug}/cart?guest_id=${guestId}`),
    syncCart: (slug: string, guestId: string, items: { product_id: string; quantity: number }[]) =>
      request<void>(`/storefront/${slug}/cart`, { method: 'PUT', body: JSON.stringify({ guest_id: guestId, items }) }),
    getWishlist: (slug: string, guestId: string) =>
      request<any[]>(`/storefront/${slug}/wishlist?guest_id=${guestId}`),
    syncWishlist: (slug: string, guestId: string, productIds: string[]) =>
      request<void>(`/storefront/${slug}/wishlist`, { method: 'PUT', body: JSON.stringify({ guest_id: guestId, product_ids: productIds }) }),
  },
};

// --- Cache de sessão local ---
const SESSION_KEY = 've_session_v1';

export type CachedSession = {
  user: { id: string; email: string };
  store: any | null;
};

export function getCachedSession(): CachedSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCachedSession(session: CachedSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearCachedSession() {
  localStorage.removeItem(SESSION_KEY);
}