// Theme Store - Based on PRD Section 8.4

// React hook for theme
import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'ayojon-theme';
const LEGACY_STORAGE_KEY = 'zynex-theme';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  initialize: () => void;
}

// Get stored theme preference with migration from legacy key
function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;

  // Try new key first
  let stored = localStorage.getItem(STORAGE_KEY);

  // If not found, migrate from legacy key
  if (!stored) {
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy && (legacy === 'light' || legacy === 'dark')) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      return legacy;
    }
  }

  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

// Apply theme to document
function applyTheme(theme: Theme, enableTransitions: boolean = true): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);

  // Enable transitions after theme is applied (for user-triggered changes)
  if (enableTransitions && !root.classList.contains('theme-transition-enabled')) {
    // Use requestAnimationFrame to ensure the class is added after the theme class
    requestAnimationFrame(() => {
      root.classList.add('theme-transition-enabled');
    });
  }
}

interface ThemeState {
  theme: Theme;
}

interface InternalThemeStore extends ThemeStore {
  getState: () => ThemeState;
  subscribe: (callback: () => void) => () => void;
}

// Create a simple store using closure
function createThemeStore(): InternalThemeStore {
  let state: ThemeState = { theme: 'light' };
  const listeners: Set<() => void> = new Set();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  return {
    get theme() {
      return state.theme;
    },
    getState() {
      return state;
    },
    setTheme(newTheme: Theme) {
      state = { theme: newTheme };

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newTheme);
      }

      // Apply to document
      applyTheme(newTheme);

      notify();
    },
    initialize() {
      // Get stored theme or default to light
      const stored = getStoredTheme();
      const theme = stored || 'light';
      state = { theme };

      // Apply initial theme without transitions to prevent flash
      applyTheme(theme, false);

      // Enable transitions after a short delay for subsequent theme changes
      setTimeout(() => {
        if (typeof document !== 'undefined') {
          document.documentElement.classList.add('theme-transition-enabled');
        }
      }, 100);
    },
    subscribe(callback: () => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

// Export singleton instance
export const themeStore = createThemeStore();

const DEFAULT_THEME_STATE: ThemeState = { theme: 'light' };

// Stable callbacks for useSyncExternalStore
const subscribe = (callback: () => void) => themeStore.subscribe(callback);
const getSnapshot = () => themeStore.getState();
const getServerSnapshot = () => DEFAULT_THEME_STATE;

export function useTheme() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    theme: state.theme,
    setTheme: themeStore.setTheme,
  };
}

// Initialize theme on module load (client-side only)
if (typeof window !== 'undefined') {
  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => themeStore.initialize());
  } else {
    themeStore.initialize();
  }
}
