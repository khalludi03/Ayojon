// Currency Store

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { CurrencyCode } from '@/types';
import type {CurrencyConfig} from '@/lib/currency';
import { CURRENCIES,  formatCurrencyPrice } from '@/lib/currency';

const STORAGE_KEY = 'ayojon-currency';
const LEGACY_STORAGE_KEY = 'zynex-currency';

interface CurrencyState {
  currency: CurrencyCode;
  isInitialized: boolean;
}

interface CurrencyStore {
  getState: () => CurrencyState;
  setCurrency: (currency: CurrencyCode) => void;
  getCurrencyConfig: () => CurrencyConfig;
  formatPrice: (priceInBDT: number) => string;
  subscribe: (callback: () => void) => () => void;
  initialize: () => void;
}

function createCurrencyStore(): CurrencyStore {
  let state: CurrencyState = {
    currency: 'BDT',
    isInitialized: false,
  };
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const persist = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, state.currency);
    }
  };

  return {
    getState: () => state,

    initialize: () => {
      if (state.isInitialized || typeof window === 'undefined') return;

      try {
        // Try new key first
        let stored = localStorage.getItem(STORAGE_KEY);

        // If not found, migrate from legacy key
        if (!stored) {
          const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacy && legacy in CURRENCIES) {
            localStorage.setItem(STORAGE_KEY, legacy);
            localStorage.removeItem(LEGACY_STORAGE_KEY);
            stored = legacy;
          }
        }

        if (stored && stored in CURRENCIES) {
          state = { currency: stored as CurrencyCode, isInitialized: true };
        } else {
          state = { ...state, isInitialized: true };
        }
      } catch (e) {
        console.error('Failed to load currency from localStorage:', e);
        state = { ...state, isInitialized: true };
      }
      notify();
    },

    setCurrency: (currency: CurrencyCode) => {
      state = { ...state, currency };
      persist();
      notify();
    },

    getCurrencyConfig: () => {
      return CURRENCIES[state.currency];
    },

    formatPrice: (priceInBDT: number) => {
      return formatCurrencyPrice(priceInBDT, state.currency);
    },

    subscribe: (callback: () => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

// Singleton instance
export const currencyStore = createCurrencyStore();

const INITIAL_CURRENCY_STATE: CurrencyState = { currency: 'BDT', isInitialized: false };

// Stable callbacks for useSyncExternalStore
const subscribeCurrency = (callback: () => void) => currencyStore.subscribe(callback);
const getCurrencySnapshot = () => currencyStore.getState();
const getCurrencyServerSnapshot = () => INITIAL_CURRENCY_STATE;

// React hook
export function useCurrency() {
  const state = useSyncExternalStore(subscribeCurrency, getCurrencySnapshot, getCurrencyServerSnapshot);

  // Initialize store on client side
  useEffect(() => {
    currencyStore.initialize();
  }, []);

  return {
    currency: state.currency,
    currencyConfig: CURRENCIES[state.currency],
    setCurrency: currencyStore.setCurrency,
    formatPrice: currencyStore.formatPrice,
    availableCurrencies: Object.values(CURRENCIES),
  };
}
