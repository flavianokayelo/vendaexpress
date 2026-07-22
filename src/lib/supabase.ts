// Mock JSON database — simulates Supabase with a localStorage-backed store.
// Persists all tables as a single JSON blob so data survives reloads.

type Row = Record<string, any>;

const DB_KEY = 've_mock_db_v1';
const SESSION_KEY = 've_mock_session_v1';

type DB = {
  users: Row[];
  stores: Row[];
  products: Row[];
  categories: Row[];
  orders: Row[];
  order_items: Row[];
  customers: Row[];
  coupons: Row[];
  store_staff: Row[];
  plans: Row[];
};

type Result = { data: any; error: any; count: number | null };

function seed(): DB {
  return {
    users: [
      { id: 'demo-user', email: 'demo@vendaexpress.ao', password: 'demo123' },
    ],
    stores: [
      {
        id: 'demo-store',
        owner_id: 'demo-user',
        plan_id: 'plan-business',
        name: 'João Shop',
        slug: 'joaoshop',
        status: 'active',
        theme_primary: '#1d4ed8',
        description: 'A melhor loja de eletrónica e acessórios de Angola. Entregas em Luanda e todo o país.',
        logo_url: '',
        banner_url: '',
        whatsapp: '+244 923 456 789',
        currency: 'AOA',
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
    ],
    products: [
      { id: 'p1', store_id: 'demo-store', category_id: 'c1', name: 'Auscultadores Bluetooth', description: 'Auscultadores sem fios com cancelamento de ruído e 20h de bateria.', price: 25000, stock: 15, image_url: '', active: true, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'p2', store_id: 'demo-store', category_id: 'c1', name: 'Powerbank 10000mAh', description: 'Carregador portátil de alta capacidade, ideal para viagens.', price: 12000, stock: 30, image_url: '', active: true, created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: 'p3', store_id: 'demo-store', category_id: 'c2', name: 'Camisola Venda Express', description: 'Camisola 100% algodão, várias tamanhos disponíveis.', price: 8500, stock: 50, image_url: '', active: true, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
      { id: 'p4', store_id: 'demo-store', category_id: 'c1', name: 'Cabo USB-C 2m', description: 'Cabo de carregamento rápido USB-C, 2 metros.', price: 3500, stock: 100, image_url: '', active: true, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    ],
    categories: [
      { id: 'c1', store_id: 'demo-store', name: 'Eletrónica', created_at: new Date(Date.now() - 86400000 * 6).toISOString() },
      { id: 'c2', store_id: 'demo-store', name: 'Moda', created_at: new Date(Date.now() - 86400000 * 6).toISOString() },
    ],
    orders: [
      { id: 'o1', store_id: 'demo-store', customer_id: null, customer_name: 'Ana Silva', customer_phone: '+244 912 345 678', customer_address: 'Rua Amilcar Cabral, Luanda', total: 25000, status: 'paid', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'o2', store_id: 'demo-store', customer_id: null, customer_name: 'Carlos Mendes', customer_phone: '+244 923 111 222', customer_address: 'Talatona, Luanda', total: 33500, status: 'pending', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
    ],
    order_items: [
      { id: 'oi1', order_id: 'o1', product_id: 'p1', name: 'Auscultadores Bluetooth', price: 25000, quantity: 1 },
      { id: 'oi2', order_id: 'o2', product_id: 'p2', name: 'Powerbank 10000mAh', price: 12000, quantity: 1 },
      { id: 'oi3', order_id: 'o2', product_id: 'p4', name: 'Cabo USB-C 2m', price: 3500, quantity: 1 },
    ],
    customers: [
      { id: 'cu1', store_id: 'demo-store', name: 'Ana Silva', phone: '+244 912 345 678', email: '', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'cu2', store_id: 'demo-store', name: 'Carlos Mendes', phone: '+244 923 111 222', email: '', created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
    ],
    coupons: [
      { id: 'cp1', store_id: 'demo-store', code: 'PROMO10', discount_percent: 10, active: true, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    ],
    store_staff: [],
    plans: [
      { id: 'plan-starter', name: 'Starter', price: 5000, product_limit: 50, features: ['Até 50 produtos','1 administrador','Tema básico','Subdomínio incluído','Loja online'], sort_order: 1 },
      { id: 'plan-business', name: 'Business', price: 15000, product_limit: null, features: ['Produtos ilimitados','Funcionários','Cupons de desconto','WhatsApp','Banners','Relatórios'], sort_order: 2 },
      { id: 'plan-premium', name: 'Premium', price: 35000, product_limit: null, features: ['Domínio próprio','Google Analytics','SEO avançado','Integrações','API','Assistente IA','Suporte prioritário'], sort_order: 3 },
    ],
  };
}

function load(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(DB_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw);
  } catch {
    return seed();
  }
}

function save(d: DB) {
  localStorage.setItem(DB_KEY, JSON.stringify(d));
}

let db = load();

function uid(): string {
  return (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function matches(row: Row, filters: { col: string; val?: any; in?: any[] }[]): boolean {
  return filters.every((f) => {
    if (f.in !== undefined) return f.in.includes(row[f.col]);
    return row[f.col] === f.val;
  });
}

type Mode = 'select' | 'insert' | 'update' | 'delete';

class Builder implements PromiseLike<Result> {
  private table: keyof DB;
  private mode: Mode = 'select';
  private filters: { col: string; val?: any; in?: any[] }[] = [];
  private orders: { col: string; ascending: boolean }[] = [];
  private limitN?: number;
  private countOnly = false;
  private headOnly = false;
  private singleMode: 'single' | 'maybe' | null = null;
  private pendingRows: Row[] | Row = [];
  private patch: Row = {};
  private wantReturn = false;

  constructor(table: keyof DB) { this.table = table; }

  select(cols: string = '*', opts?: { count?: string; head?: boolean }) {
    // After insert/update, calling .select() means "return the affected rows"
    if (this.mode === 'insert' || this.mode === 'update') this.wantReturn = true;
    if (this.mode !== 'insert' && this.mode !== 'update') this.mode = 'select';
    if (opts?.count) this.countOnly = true;
    if (opts?.head) this.headOnly = true;
    void cols;
    return this;
  }

  eq(col: string, val: any) { this.filters.push({ col, val }); return this; }
  in(col: string, vals: any[]) { this.filters.push({ col, in: vals }); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orders.push({ col, ascending: opts?.ascending ?? true }); return this; }
  limit(n: number) { this.limitN = n; return this; }

  insert(rows: Row | Row[]) { this.mode = 'insert'; this.pendingRows = rows; return this; }
  update(patch: Row) { this.mode = 'update'; this.patch = patch; return this; }
  delete() { this.mode = 'delete'; return this; }

  single() { this.singleMode = 'single'; return Promise.resolve(this._run()); }
  maybeSingle() { this.singleMode = 'maybe'; return Promise.resolve(this._run()); }

  private _run(): Result {
    const tableRows = db[this.table] as Row[];
    try {
      if (this.mode === 'select') {
        let rows = tableRows.filter((r) => matches(r, this.filters));
        for (const o of this.orders) {
          rows.sort((a, b) => {
            const av = a[o.col], bv = b[o.col];
            if (av < bv) return o.ascending ? -1 : 1;
            if (av > bv) return o.ascending ? 1 : -1;
            return 0;
          });
        }
        if (this.limitN) rows = rows.slice(0, this.limitN);
        if (this.headOnly) return { data: null, error: null, count: rows.length };
        if (this.countOnly) return { data: null, error: null, count: rows.length };
        if (this.singleMode === 'single') {
          if (rows.length === 0) return { data: null, error: { message: 'No rows found' }, count: null };
          return { data: rows[0], error: null, count: null };
        }
        if (this.singleMode === 'maybe') {
          return { data: rows[0] ?? null, error: null, count: null };
        }
        return { data: rows, error: null, count: null };
      }

      if (this.mode === 'insert') {
        const arr = Array.isArray(this.pendingRows) ? this.pendingRows : [this.pendingRows];
        const inserted: Row[] = arr.map((r) => {
          const row: Row = { id: uid(), created_at: new Date().toISOString(), ...r };
          (db[this.table] as Row[]).push(row);
          return row;
        });
        save(db);
        if (this.wantReturn) {
          if (this.singleMode === 'single') return { data: inserted[0], error: null, count: null };
          return { data: inserted, error: null, count: null };
        }
        return { data: null, error: null, count: null };
      }

      if (this.mode === 'update') {
        const updated: Row[] = [];
        for (const r of tableRows) {
          if (matches(r, this.filters)) {
            Object.assign(r, this.patch);
            updated.push(r);
          }
        }
        save(db);
        if (this.wantReturn) {
          if (this.singleMode === 'single') return { data: updated[0] ?? null, error: null, count: null };
          return { data: updated, error: null, count: null };
        }
        return { data: null, error: null, count: null };
      }

      if (this.mode === 'delete') {
        const remaining = tableRows.filter((r) => !matches(r, this.filters));
        (db as any)[this.table] = remaining;
        save(db);
        return { data: null, error: null, count: null };
      }

      return { data: null, error: null, count: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message }, count: null };
    }
  }

  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this._run()).then(onfulfilled, onrejected);
  }
}

// Auth simulation
type Session = { user: { id: string; email: string } } | null;

function getSession(): Session {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(s: Session) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
}

const authListeners: ((event: string, session: Session) => void)[] = [];

export const supabase = {
  auth: {
    async getSession() {
      return { data: { session: getSession() } };
    },
    async signUp({ email, password }: { email: string; password: string }) {
      const existing = db.users.find((u) => u.email === email);
      if (existing) return { error: { message: 'User already registered' } };
      const user: Row = { id: uid(), email, password };
      db.users.push(user);
      save(db);
      const session = { user: { id: user.id, email } };
      setSession(session);
      authListeners.forEach((l) => l('SIGNED_IN', session));
      return { error: null };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const user = db.users.find((u) => u.email === email && u.password === password);
      if (!user) return { error: { message: 'Invalid login credentials' } };
      const session = { user: { id: user.id, email } };
      setSession(session);
      authListeners.forEach((l) => l('SIGNED_IN', session));
      return { error: null };
    },
    async signOut() {
      setSession(null);
      authListeners.forEach((l) => l('SIGNED_OUT', null));
      return {};
    },
    onAuthStateChange(cb: (event: string, session: Session) => void) {
      authListeners.push(cb);
      return { data: { subscription: { unsubscribe: () => {
        const i = authListeners.indexOf(cb);
        if (i >= 0) authListeners.splice(i, 1);
      } } } };
    },
  },
  from(table: string) {
    return new Builder(table as keyof DB);
  },
};
