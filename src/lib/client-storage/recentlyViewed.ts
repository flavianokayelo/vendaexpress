import { readJson, writeJson, keyFor, type StorageScope } from './storage';
import { getPreferences } from './preferences';

export type RecentlyViewedEntry = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  viewedAt: number;
};

const SCOPE: StorageScope = 'local';

function listKey(slug: string) {
  return keyFor('recently_viewed', slug);
}

export function getRecentlyViewed(slug: string): RecentlyViewedEntry[] {
  const raw = readJson<RecentlyViewedEntry[] | null>(SCOPE, listKey(slug), null);
  return Array.isArray(raw) ? raw : [];
}

export function addRecentlyViewed(
  slug: string,
  entry: Omit<RecentlyViewedEntry, 'viewedAt'>,
): void {
  const limit = getPreferences().recentlyViewedLimit;
  const current = getRecentlyViewed(slug).filter((e) => e.productId !== entry.productId);
  writeJson(SCOPE, listKey(slug), [{ ...entry, viewedAt: Date.now() }, ...current].slice(0, limit));
}

export function removeRecentlyViewed(slug: string, productId: string): void {
  writeJson(
    SCOPE,
    listKey(slug),
    getRecentlyViewed(slug).filter((e) => e.productId !== productId),
  );
}

export function clearRecentlyViewed(slug: string): void {
  writeJson(SCOPE, listKey(slug), []);
}