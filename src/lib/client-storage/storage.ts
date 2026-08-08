export type StorageScope = 'local' | 'session';

const PREFIX = 've';
const memory = new Map<string, string>();

function backing(scope: StorageScope): Storage | null {
  try {
    return scope === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

export function keyFor(namespace: string, name: string): string {
  return `${PREFIX}_${namespace}_${name}`;
}

export function readRaw(scope: StorageScope, key: string): string | null {
  try {
    const s = backing(scope);
    if (s) {
      const raw = s.getItem(key);
      if (raw != null) return raw;
    }
  } catch {
    // storage indisponível — cai para a memória
  }
  return memory.get(key) ?? null;
}

export function writeRaw(scope: StorageScope, key: string, value: string): void {
  memory.set(key, value);
  try {
    backing(scope)?.setItem(key, value);
  } catch {
    // localStorage/sessionStorage indisponível (ex: modo privado, quota) — fica só em memória
  }
}

export function removeRaw(scope: StorageScope, key: string): void {
  memory.delete(key);
  try {
    backing(scope)?.removeItem(key);
  } catch {
    // ignore
  }
}

export function readJson<T>(scope: StorageScope, key: string, fallback: T): T {
  const raw = readRaw(scope, key);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(scope: StorageScope, key: string, value: T): void {
  writeRaw(scope, key, JSON.stringify(value));
}