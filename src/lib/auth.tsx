import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  api, getToken, setToken, clearToken,
  getCachedSession, setCachedSession, clearCachedSession,
} from './api';
import type { Store } from './types';

type AuthUser = { id: string; email: string };

type AuthContextValue = {
  user: AuthUser | null;
  store: Store | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshStore: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const syncFromServer = async () => {
    const { user: freshUser } = await api.auth.me();
    let freshStore: Store | null = null;
    try {
      freshStore = await api.stores.getMine();
    } catch {
      freshStore = null;
    }
    console.log('[auth] perfil sincronizado com a BD:', { user: freshUser, store: freshStore }); // debug
    setUser(freshUser);
    setStore(freshStore);
    setCachedSession({ user: freshUser, store: freshStore });
  };

  const refreshStore = async () => {
    try {
      const s = await api.stores.getMine();
      setStore(s);
      if (user) setCachedSession({ user, store: s });
    } catch {
      setStore(null);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      clearCachedSession();
      setLoading(false);
      return;
    }

    // 1) Hidrata instantaneamente a partir do cache local, se existir
    const cached = getCachedSession();
    if (cached) {
      setUser(cached.user);
      setStore(cached.store);
      setLoading(false);
    }

    // 2) Confirma/atualiza em segundo plano com a base de dados real
    syncFromServer()
      .catch(() => {
        // Token inválido/expirado ou utilizador apagado — limpa tudo
        clearToken();
        clearCachedSession();
        setUser(null);
        setStore(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { user, token } = await api.auth.signup(email, password);
      setToken(token);
      setUser(user);
      setCachedSession({ user, store: null });
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erro ao criar conta' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user, token } = await api.auth.login(email, password);
      setToken(token);
      setUser(user);
      let s: Store | null = null;
      try {
        s = await api.stores.getMine();
      } catch {
        s = null;
      }
      setStore(s);
      setCachedSession({ user, store: s });
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Credenciais inválidas' };
    }
  };

  const signOut = async () => {
    clearToken();
    clearCachedSession();
    setUser(null);
    setStore(null);
  };

  return (
    <AuthContext.Provider value={{ user, store, loading, signUp, signIn, signOut, refreshStore }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}