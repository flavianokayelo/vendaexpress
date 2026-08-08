const API_URL = "http://192.168.100.196:4000/api";
export const BACKEND_ORIGIN = "http://192.168.100.196:4000";
const TOKEN_KEY = "ve_token";

import type { Order } from "./types";
import type { Plan } from "./types";
import type { Store, Payment, Category, Subcategory, Product, Customer, OrderItem } from "./types";
import type { PublicCoupon } from "./types";
import type { Page, PageCreate, PageUpdate } from "../builder/types/page";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function resolveMediaUrl(
  path: string | null | undefined,
): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BACKEND_ORIGIN}${path}`;
}

/**
 * Erro da API que preserva o status HTTP e o código do backend.
 * Serve para o frontend distinguir, por exemplo, um 402 SUBSCRIPTION_REQUIRED
 * (abrir modal EMIS) de um 401 (mandar para o login).
 */

export class ApiError extends Error {
  status: number;
  code?: string;
  payload: unknown;

  constructor(message: string, status: number, code?: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.payload = payload;
  }

  get isSubscriptionRequired() {
    return this.status === 402 || this.code === "SUBSCRIPTION_REQUIRED";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      data.error || "Erro na comunicação com o servidor",
      res.status,
      data.code,
      data,
    );
  }
  return data as T;
}

// O backend devolve listas paginadas como { <key>: [...], total, page, limit }.
// Aceita também array puro (forma antiga) para compatibilidade.
function unwrapList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  const rows = (data as Record<string, unknown> | null)?.[key];
  return Array.isArray(rows) ? (rows as T[]) : [];
}

// Upload de ficheiros usa FormData, por isso não passa pelo request() genérico (que força JSON)
export async function uploadCategoryIcon(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/uploads/category-icon`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.error || "Erro ao enviar imagem",
      res.status,
      data.code,
      data,
    );
  }
  return data;
}

export type UploadedPhoto = { url: string; hash: string };

export async function uploadProductImages(
  files: File[],
): Promise<{ photos: UploadedPhoto[] }> {
  const token = getToken();
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(`${API_URL}/uploads/product-images`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.error || "Erro ao enviar imagens",
      res.status,
      data.code,
      data,
    );
  }
  return data;
}

export async function uploadProductVideo(
  file: File,
  thumbnail: Blob | null,
): Promise<{ url: string; thumbnail_url: string | null }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("video", file);
  if (thumbnail) formData.append("thumbnail", thumbnail, "thumb.jpg");

  const res = await fetch(`${API_URL}/uploads/product-video`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.error || "Erro ao enviar vídeo",
      res.status,
      data.code,
      data,
    );
  }
  return data;
}

export async function uploadStoreLogo(file: File): Promise<{ url: string }> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/uploads/store-logo`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.error || "Erro ao enviar logótipo",
      res.status,
      data.code,
      data,
    );
  }
  return data;
}

export async function uploadStoreBanner(
  files: File[],
): Promise<{ urls: string[] }> {
  const token = getToken();
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(`${API_URL}/uploads/store-banner`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.error || "Erro ao enviar banner",
      res.status,
      data.code,
      data,
    );
  }
  return data;
}

export async function aiAssistImage(
  file: File,
): Promise<{
  name: string;
  description: string;
  color: string;
  category?: string;
  from_cache: boolean;
}> {
  const token = getToken();
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/products/ai-assist-image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(
      data.error || "Erro ao analisar imagem",
      res.status,
      data.code,
      data,
    );
  }
  return data;
}

export const api = {
  pages: {
    list: () => request<Page[]>("/pages"),
    get: (id: string) => request<Page>(`/pages/${id}`),
    create: (payload: PageCreate) =>
      request<Page>("/pages", { method: "POST", body: JSON.stringify(payload) }),
    update: (id: string, payload: PageUpdate) =>
      request<Page>(`/pages/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id: string) => request<void>(`/pages/${id}`, { method: "DELETE" }),
  },
  auth: {
    signup: (email: string, password: string) =>
      request<{ user: { id: string; email: string }; token: string }>(
        "/auth/signup",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      ),
    login: (email: string, password: string) =>
      request<{ user: { id: string; email: string }; token: string }>(
        "/auth/login",
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      ),
    me: () => request<{ user: { id: string; email: string } }>("/auth/me"),
  },
  plans: {
    list: () => request<Plan[]>("/plans"),
  },
  // Registo pago: a conta só nasce depois da EMIS confirmar.
  signup: {
    start: (payload: {
      email: string;
      password: string;
      store_name: string;
      slug: string;
      plan_id: string;
    }) =>
      request<{
        reference: string;
        payment_id: string;
        gpo_token: string | null;
        frame_url: string | null;
        amount: number;
        plan_name: string;
        mocked: boolean;
        expires_in_minutes: number;
      }>("/signup/start", { method: "POST", body: JSON.stringify(payload) }),
    status: (reference: string) =>
      request<{
        status: "pending" | "paid" | "failed" | "cancelled" | "expired";
        ready: boolean;
      }>(`/signup/status?reference=${encodeURIComponent(reference)}`),
    complete: (reference: string) =>
      request<{ user: { id: string; email: string }; token: string }>(
        "/signup/complete",
        {
          method: "POST",
          body: JSON.stringify({ reference }),
        },
      ),
    // Só funciona com EMIS_ALLOW_MANUAL=true no backend (a EMIS não chama localhost)
    confirmManual: (reference: string) =>
      request<{ ok: boolean; already: boolean }>("/signup/confirm-manual", {
        method: "POST",
        body: JSON.stringify({ reference }),
      }),
    /** Fecha a tentativa (modal fechado ou pagamento recusado) e devolve a elegibilidade */
    abandon: (reference: string, reason?: string) =>
      request<{
        ok: boolean;
        status: string;
        failed_attempts: number;
        needed: number;
        trial_days: number;
        eligible: boolean;
        already_registered: boolean;
      }>("/signup/abandon", {
        method: "POST",
        body: JSON.stringify({ reference, reason }),
      }),
    trialEligibility: (email: string) =>
      request<{
        failed_attempts: number;
        needed: number;
        trial_days: number;
        eligible: boolean;
        already_registered: boolean;
      }>(`/signup/trial-eligibility?email=${encodeURIComponent(email)}`),
    /** Cria a conta em modo de teste (7 dias), só se elegível */
    startTrial: (payload: {
      email: string;
      password: string;
      store_name: string;
      slug: string;
      plan_id: string;
    }) =>
      request<{
        user: { id: string; email: string };
        token: string;
        trial_days: number;
      }>("/signup/trial", { method: "POST", body: JSON.stringify(payload) }),
  },
  stores: {
    getMine: () => request<Store>("/stores/mine"),
    getStats: () =>
      request<{
        products: number;
        orders: number;
        customers: number;
        revenue: number;
        revenueByMonth: number[];
        recentOrders: Order[];
      }>("/stores/mine/stats"),
    create: (payload: { name: string; slug: string; plan_id: string }) =>
      request<Store>("/stores", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (payload: {
      name?: string;
      whatsapp?: string | null;
      currency?: string;
      theme_primary?: string;
      theme_id?: string;
      description?: string | null;
      logo_url?: string | null;
      banner_urls?: import("./types").BannerSlide[];
      theme_config?: {
        footer?: {
          supportItems?: import("../storefrontTheme/types").SupportItem[];
        };
        header?: {
          showAnnouncementBar?: boolean;
          announcementText?: string;
        };
      };
    }) =>
      request<Store>("/stores/mine", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  },
  themes: {
    list: () =>
      request<
        {
          id: string;
          name: string;
          label: string;
          description: string;
          tags: string[];
          version: string;
          author: string;
          accent: string;
          in_use: number;
        }[]
      >("/themes"),
  },
  subscription: {
    status: () =>
      request<{
        active: boolean;
        reason:
          | "plan"
          | "trial"
          | "trial_expired"
          | "plan_expired"
          | "no_store";
        expires_at: string | null;
        days_left: number;
        plan: Plan | null;
        store_status?: string;
      }>("/subscription/status"),
  },
  payments: {
    start: (planId: string) =>
      request<{
        payment: Payment;
        emis: {
          token: string | null;
          frame_url: string | null;
          mocked: boolean;
          error?: string;
        };
      }>("/payments/start", {
        method: "POST",
        body: JSON.stringify({ plan_id: planId }),
      }),
    status: (paymentId: string) =>
      request<{ payment: Payment; store: Store }>(`/payments/${paymentId}/status`),
    listMine: () => request<Payment[]>("/payments/mine"),
    // Só funciona com EMIS_ALLOW_MANUAL=true no .env do backend (para testes locais)
    confirmManual: (paymentId: string) =>
      request<{ payment: Payment }>(`/payments/${paymentId}/confirm-manual`, {
        method: "POST",
      }),
  },
  admin: {
    listStores: () =>
      request<Array<Store & { owner_email: string; plan_name: string | null }>>(
        "/admin/stores",
      ),
    getStats: () =>
      request<{
        stores: number;
        products: number;
        orders: number;
        revenue: number;
      }>("/admin/stats"),
  },
  categories: {
    list: () => request<Category[]>("/categories"),
    create: (name: string, icon_url?: string | null) =>
      request<Category>("/categories", {
        method: "POST",
        body: JSON.stringify({ name, icon_url }),
      }),
    update: (id: string, name: string, icon_url?: string | null) =>
      request<Category>(`/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name, icon_url }),
      }),
    remove: (id: string) =>
      request<void>(`/categories/${id}`, { method: "DELETE" }),
  },
  subcategories: {
    list: (categoryId?: string) =>
      request<Subcategory[]>(
        `/subcategories${categoryId ? `?category_id=${categoryId}` : ""}`,
      ),
    create: (categoryId: string, name: string) =>
      request<Subcategory>("/subcategories", {
        method: "POST",
        body: JSON.stringify({ category_id: categoryId, name }),
      }),
    update: (id: string, name: string) =>
      request<Subcategory>(`/subcategories/${id}`, {
        method: "PUT",
        body: JSON.stringify({ name }),
      }),
    remove: (id: string) =>
      request<void>(`/subcategories/${id}`, { method: "DELETE" }),
  },
  coupons: {
    list: () => request<import("./types").Coupon[]>("/coupons"),
    create: (payload: {
      code: string;
      discount_percent: number;
      active?: boolean;
      is_public?: boolean;
    }) =>
      request<import("./types").Coupon>("/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (
      id: string,
      payload: {
        code?: string;
        discount_percent?: number;
        active?: boolean;
        is_public?: boolean;
      },
    ) =>
      request<import("./types").Coupon>(`/coupons/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      request<void>(`/coupons/${id}`, { method: "DELETE" }),
  },
  products: {
    list: () =>
      request<unknown>("/products").then((d) => unwrapList<Product>(d, "products")),
    create: (payload: Record<string, unknown>) =>
      request<Product>("/products", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Record<string, unknown>) =>
      request<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      request<void>(`/products/${id}`, { method: "DELETE" }),
    aiAssist: (keywords: string, category?: string) =>
      request<{ name: string; description: string }>("/products/ai-assist", {
        method: "POST",
        body: JSON.stringify({ keywords, category }),
      }),
    searchByHash: (hash: string) =>
      request<{ match: { product_id: string; name: string } | null }>(
        `/products/search-by-hash?hash=${hash}`,
      ),
  },
  orders: {
    list: () =>
      request<unknown>("/orders").then((d) => unwrapList<Order>(d, "orders")),
    getItems: (orderId: string) => request<OrderItem[]>(`/orders/${orderId}/items`),
    updateStatus: (orderId: string, status: string) =>
      request<Order>(`/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },
  customers: {
    list: () =>
      request<unknown>("/customers").then((d) => unwrapList<Customer>(d, "customers")),
  },
  storefront: {
    get: (slug: string) =>
      request<{
        store: Store;
        categories: Category[];
        products: Product[];
        coupons: PublicCoupon[];
      }>(`/storefront/${slug}`),
    getProduct: (slug: string, id: string) =>
      request<{
        store: Store;
        product: Product;
        category: Category | null;
        related: Product[];
      }>(`/storefront/${slug}/products/${id}`),
    validateCoupon: (slug: string, code: string) =>
      request<PublicCoupon>(`/storefront/${slug}/coupons/validate`, {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    placeOrder: (
      slug: string,
      payload: {
        name: string;
        phone: string;
        address: string;
        items: { product_id: string; quantity: number }[];
        coupon_code?: string;
      },
    ) =>
      request<{ order_id: string; total: number }>(
        `/storefront/${slug}/orders`,
        { method: "POST", body: JSON.stringify(payload) },
      ),
    getCart: (slug: string, guestId: string) =>
      request<{ product: Product; quantity: number }[]>(
        `/storefront/${slug}/cart?guest_id=${guestId}`,
      ),
    syncCart: (
      slug: string,
      guestId: string,
      items: { product_id: string; quantity: number }[],
    ) =>
      request<void>(`/storefront/${slug}/cart`, {
        method: "PUT",
        body: JSON.stringify({ guest_id: guestId, items }),
      }),
    getWishlist: (slug: string, guestId: string) =>
      request<Product[]>(`/storefront/${slug}/wishlist?guest_id=${guestId}`),
    syncWishlist: (slug: string, guestId: string, productIds: string[]) =>
      request<void>(`/storefront/${slug}/wishlist`, {
        method: "PUT",
        body: JSON.stringify({ guest_id: guestId, product_ids: productIds }),
      }),
  },
};

// --- Cache de sessão local ---
const SESSION_KEY = "ve_session_v1";

export type CachedSession = {
  user: { id: string; email: string };
  store: Store | null;
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
