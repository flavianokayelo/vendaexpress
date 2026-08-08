import { readJson, writeJson, keyFor } from './storage';

export type ThemePreference = 'light' | 'dark' | 'system';
export type Density = 'comfortable' | 'compact';

export type Preferences = {
  theme: ThemePreference;
  language: string;
  density: Density;
  sidebarCollapsed: boolean;
  tableDensity: Density;
  notificationsEnabled: boolean;
  recentlyViewedLimit: number;
};

const DEFAULTS: Preferences = {
  theme: 'system',
  language: 'pt',
  density: 'comfortable',
  sidebarCollapsed: false,
  tableDensity: 'comfortable',
  notificationsEnabled: true,
  recentlyViewedLimit: 8,
};

const KEY = keyFor('preferences', 'global');

export function getPreferences(): Preferences {
  return { ...DEFAULTS, ...readJson<Partial<Preferences>>('local', KEY, {}) };
}

export function setPreferences(patch: Partial<Preferences>): Preferences {
  const next = { ...getPreferences(), ...patch };
  writeJson('local', KEY, next);
  return next;
}

export function resetPreferences(): void {
  writeJson('local', KEY, DEFAULTS);
}

export function togglePreference<K extends keyof Preferences>(key: K): Preferences {
  const current = getPreferences();
  const value = current[key];
  const next = typeof value === 'boolean' ? !value : value;
  return setPreferences({ [key]: next } as Partial<Preferences>);
}