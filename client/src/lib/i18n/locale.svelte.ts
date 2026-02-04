import { translations, type Locale } from './translations';

// Constants must be defined before use in getInitialLocale()
const LOCALES: Locale[] = ['ja', 'en', 'ru'];
const DEFAULT_LOCALE: Locale = 'ja';

function isValidLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'ja' || value === 'ru';
}

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  const stored = localStorage.getItem('tangocho-locale');
  return isValidLocale(stored) ? stored : DEFAULT_LOCALE;
}

// Svelte 5 state for reactive locale
let currentLocale = $state<Locale>(getInitialLocale());

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    localStorage.setItem('tangocho-locale', locale);
    document.documentElement.lang = locale;
  }
}

export function cycleLocale(): void {
  const currentIndex = LOCALES.indexOf(currentLocale);
  const nextIndex = (currentIndex + 1) % LOCALES.length;
  setLocale(LOCALES[nextIndex]);
}

export function getAvailableLocales(): Locale[] {
  return LOCALES;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: unknown = translations[currentLocale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      console.warn(`Missing translation: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    console.warn(`Translation is not a string: ${key}`);
    return key;
  }

  // Handle interpolation: {count}, {name}, etc.
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      String(params[name] ?? `{${name}}`)
    );
  }

  return value;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = currentLocale === 'ja' ? 'ja-JP' : 'en-US';
  return d.toLocaleDateString(locale);
}

// Initialize locale on client side
export function initLocale(): void {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tangocho-locale');
    if (isValidLocale(stored)) {
      currentLocale = stored;
    }
    document.documentElement.lang = currentLocale;
  }
}
