import { readJson, writeJson, removeRaw, keyFor, type StorageScope } from './storage';

export type ProfileSettings = {
  name: string;
  email: string;
  whatsapp: string;
};

const SCOPE: StorageScope = 'local';

const EMPTY: ProfileSettings = { name: '', email: '', whatsapp: '' };

function profileKey(slug: string) {
  return keyFor('profile', slug);
}

export function getProfile(slug: string): ProfileSettings {
  return { ...EMPTY, ...readJson<Partial<ProfileSettings>>(SCOPE, profileKey(slug), {}) };
}

export function setProfile(slug: string, patch: Partial<ProfileSettings>): ProfileSettings {
  const next = { ...getProfile(slug), ...patch };
  writeJson(SCOPE, profileKey(slug), next);
  return next;
}

export function resetProfile(slug: string): void {
  removeRaw(SCOPE, profileKey(slug));
}