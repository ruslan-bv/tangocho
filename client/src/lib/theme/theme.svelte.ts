export type Theme = 'light' | 'night';

const STORAGE_KEY = 'tangocho-theme';
const DEFAULT_THEME: Theme = 'light';

function isValidTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'night';
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = localStorage.getItem(STORAGE_KEY);
  return isValidTheme(stored) ? stored : DEFAULT_THEME;
}

let currentTheme = $state<Theme>(readStoredTheme());

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}

export function getTheme(): Theme {
  return currentTheme;
}

export function setTheme(theme: Theme): void {
  currentTheme = theme;
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(theme);
  }
}

export function toggleTheme(): void {
  setTheme(currentTheme === 'light' ? 'night' : 'light');
}

export function initTheme(): void {
  if (typeof window === 'undefined') return;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (isValidTheme(stored)) currentTheme = stored;
  applyTheme(currentTheme);
}
