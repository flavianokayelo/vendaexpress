import { readJson, writeJson, removeRaw, keyFor, type StorageScope } from './storage';

export type DaySlot = { open: boolean; from: string; to: string };

export const STORE_DAYS = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
] as const;

export type StoreDay = (typeof STORE_DAYS)[number];

export type HoursSettings = Record<StoreDay, DaySlot>;

const DEFAULT_SLOT: DaySlot = { open: true, from: '08:00', to: '18:00' };

const INITIAL_HOURS = STORE_DAYS.reduce<HoursSettings>((acc, day) => {
  acc[day] = { ...DEFAULT_SLOT };
  if (day === 'Sábado') acc[day] = { open: true, from: '09:00', to: '13:00' };
  if (day === 'Domingo') acc[day] = { open: false, from: '09:00', to: '13:00' };
  return acc;
}, {} as HoursSettings);

const SCOPE: StorageScope = 'local';

function hoursKey(slug: string) {
  return keyFor('hours', slug);
}

export function getHours(slug: string): HoursSettings {
  const stored = readJson<Partial<HoursSettings> | null>(SCOPE, hoursKey(slug), null);
  return STORE_DAYS.reduce<HoursSettings>((acc, day) => {
    acc[day] = { ...INITIAL_HOURS[day], ...stored?.[day] };
    return acc;
  }, {} as HoursSettings);
}

export function setHours(slug: string, hours: HoursSettings): void {
  writeJson(SCOPE, hoursKey(slug), hours);
}

export function resetHours(slug: string): void {
  removeRaw(SCOPE, hoursKey(slug));
}