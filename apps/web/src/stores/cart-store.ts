// Cart Store - Based on PRD Section 9.1

import { useCallback, useSyncExternalStore } from 'react';
import type { CurrencyCode, Product, ProductVariant } from '@/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'ayojon-cart';
const LEGACY_STORAGE_KEY = 'zynex-cart';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: string;
}

interface CartState {
  items: Array<CartItem>;
  currency: CurrencyCode;
}

interface CartStore {
  getState: () => CartState;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => void;
  removeItem: (itemId: string) => void;
  removeByProductId: (productId: string) => void;
  toggleItem: (product: Product) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  isInCart: (productId: string) => boolean;
  subscribe: (callback: () => void) => () => void;
}

function createCartStore(): CartStore {
  let state: CartState = {
    items: [],
    currency: 'BDT',
  };
  const listeners = new Set<() => void>();

  // Load from sessionStorage (session-scoped, not persistent across browser restarts)
  if (typeof window !== 'undefined') {
    try {
      // Try to load from new key first
      let stored = sessionStorage.getItem(STORAGE_KEY);

      // If not found, migrate from legacy key
      if (!stored) {
        const legacy = sessionStorage.getItem(LEGACY_STORAGE_KEY);
        if (legacy) {
          sessionStorage.setItem(STORAGE_KEY, legacy);
          sessionStorage.removeItem(LEGACY_STORAGE_KEY);
          stored = legacy;
        }
      }

      // Clear any legacy localStorage data from previous implementation
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(LEGACY_STORAGE_KEY);

      if (stored) {
        state = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load cart from sessionStorage:', e);
    }
  }

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const persist = () => {
    if (typeof window !== 'undefined') {
      // Use sessionStorage - data clears when browser tab closes
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  };

  return {
    getState: () => state,

    addItem: (product: Product, quantity: number = 1, variant?: ProductVariant) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedVariant?.id === variant?.id
      );

      if (existingIndex >= 0) {
        // Update quantity of existing item
        state = {
          ...state,
          items: state.items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          id: generateId(),
          productId: product.id,
          product,
          quantity,
          selectedVariant: variant,
          addedAt: new Date().toISOString(),
        };
        state = {
          ...state,
          items: [...state.items, newItem],
        };
      }

      persist();
      notify();
    },

    removeItem: (itemId: string) => {
      state = {
        ...state,
        items: state.items.filter((item) => item.id !== itemId),
      };
      persist();
      notify();
    },

    removeByProductId: (productId: string) => {
      state = {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
      };
      persist();
      notify();
    },

    toggleItem: (product: Product) => {
      const existingItem = state.items.find((item) => item.productId === product.id);
      
      if (existingItem) {
        // Remove item if already in cart
        state = {
          ...state,
          items: state.items.filter((item) => item.productId !== product.id),
        };
      } else {
        // Add new item
        const newItem: CartItem = {
          id: generateId(),
          productId: product.id,
          product,
          quantity: 1,
          selectedVariant: undefined,
          addedAt: new Date().toISOString(),
        };
        state = {
          ...state,
          items: [...state.items, newItem],
        };
      }
      
      persist();
      notify();
    },

    updateQuantity: (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        state = {
          ...state,
          items: state.items.filter((item) => item.id !== itemId),
        };
      } else {
        state = {
          ...state,
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      }
      persist();
      notify();
    },

    clearCart: () => {
      state = { ...state, items: [] };
      persist();
      notify();
    },

    getItemCount: () => {
      return state.items.reduce((total, item) => total + item.quantity, 0);
    },

    getSubtotal: () => {
      return state.items.reduce((total, item) => {
        const price = item.product.pricing.currentPrice;
        const variantModifier = item.selectedVariant?.priceModifier || 0;
        return total + (price + variantModifier) * item.quantity;
      }, 0);
    },

    isInCart: (productId: string) => {
      return state.items.some((item) => item.productId === productId);
    },

    subscribe: (callback: () => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

// Singleton instance
export const cartStore = createCartStore();

// Stable callbacks for useSyncExternalStore
const subscribeCart = (callback: () => void) => cartStore.subscribe(callback);
const getCartSnapshot = () => cartStore.getState();
const getCartServerSnapshot = () => ({ items: [], currency: 'BDT' as CurrencyCode });

// React hook
export function useCart() {
  const state = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);

  // Derive itemCount and subtotal from subscribed state for reactive updates
  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = state.items.reduce((total, item) => {
    const price = item.product.pricing.currentPrice;
    const variantModifier = item.selectedVariant?.priceModifier || 0;
    return total + (price + variantModifier) * item.quantity;
  }, 0);

  return {
    items: state.items,
    currency: state.currency,
    itemCount,
    subtotal,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    removeByProductId: cartStore.removeByProductId,
    toggleItem: cartStore.toggleItem,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    isInCart: (productId: string) => state.items.some((item) => item.productId === productId),
  };
}
