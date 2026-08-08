import { readJson, writeJson, removeRaw, keyFor, type StorageScope } from './storage';

const SCOPE: StorageScope = 'local';

type NavEntry = { page: string; at: number };

function navKey(root: string) {
  return keyFor('navigation', root);
}

export function getLastPage(root: string): string | null {
  const raw = readJson<NavEntry | null>(SCOPE, navKey(root), null);
  return raw?.page ?? null;
}

export function saveLastPage(root: string, page: string): void {
  writeJson(SCOPE, navKey(root), { page, at: Date.now() });
}

export function clearLastPage(root: string): void {
  removeRaw(SCOPE, navKey(root));
}