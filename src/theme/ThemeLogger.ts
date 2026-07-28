import type { LogLevel, ThemeLogEntry } from './types';

const MAX_LOG_ENTRIES = 200;
const logs: ThemeLogEntry[] = [];

function createEntry(level: LogLevel, module: string, message: string, data?: Record<string, unknown>): ThemeLogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    module,
    message,
    data,
  };
}

function addEntry(entry: ThemeLogEntry): void {
  logs.push(entry);
  if (logs.length > MAX_LOG_ENTRIES) logs.shift();
  if (entry.level === 'error') console.error(`[ThemeEngine][${entry.module}] ${entry.message}`, entry.data ?? '');
  else if (entry.level === 'warn') console.warn(`[ThemeEngine][${entry.module}] ${entry.message}`, entry.data ?? '');
  else console.log(`[ThemeEngine][${entry.module}] ${entry.message}`, entry.data ?? '');
}

export const themeLogger = {
  debug(module: string, message: string, data?: Record<string, unknown>): void {
    addEntry(createEntry('debug', module, message, data));
  },

  info(module: string, message: string, data?: Record<string, unknown>): void {
    addEntry(createEntry('info', module, message, data));
  },

  warn(module: string, message: string, data?: Record<string, unknown>): void {
    addEntry(createEntry('warn', module, message, data));
  },

  error(module: string, message: string, data?: Record<string, unknown>): void {
    addEntry(createEntry('error', module, message, data));
  },

  getLogs(): ThemeLogEntry[] {
    return [...logs];
  },

  getLogsByLevel(level: LogLevel): ThemeLogEntry[] {
    return logs.filter((l) => l.level === level);
  },

  getLogsByModule(module: string): ThemeLogEntry[] {
    return logs.filter((l) => l.module === module);
  },

  clearLogs(): void {
    logs.length = 0;
  },
};
