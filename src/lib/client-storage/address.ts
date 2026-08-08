import { readJson, writeJson, removeRaw, keyFor, type StorageScope } from './storage';

export type AddressSettings = {
  province: string;
  municipality: string;
  street: string;
  reference: string;
  pickupPoint: string;
};

const SCOPE: StorageScope = 'local';

const EMPTY: AddressSettings = {
  province: 'Luanda',
  municipality: '',
  street: '',
  reference: '',
  pickupPoint: '',
};

function addressKey(slug: string) {
  return keyFor('address', slug);
}

export function getAddress(slug: string): AddressSettings {
  return { ...EMPTY, ...readJson<Partial<AddressSettings>>(SCOPE, addressKey(slug), {}) };
}

export function setAddress(slug: string, patch: Partial<AddressSettings>): AddressSettings {
  const next = { ...getAddress(slug), ...patch };
  writeJson(SCOPE, addressKey(slug), next);
  return next;
}

export function resetAddress(slug: string): void {
  removeRaw(SCOPE, addressKey(slug));
}