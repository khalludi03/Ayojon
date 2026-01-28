// Wishlist Store

import { useCallback, useSyncExternalStore } from 'react';
import type { Product } from '@/types';
import { generateId } from '@/lib/utils';

const STORAGE_KEY = 'zynex-wishlist';

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

interface WishlistState {
  items: Array<WishlistItem>;
}

interface WishlistStore {
  getState: () => WishlistState;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  getItemCount: () => number;
  subscribe: (callback: () => void) => () => void;
}

function createWishlistStore(): WishlistStore {
  let state: WishlistState = {
    items: [],
  };
  const listeners = new Set<() => void>();

  // Load from sessionStorage (session-scoped, not persistent across browser restarts)
  if (typeof window !== 'undefined') {
    try {
      // Clear any legacy localStorage data from previous implementation
      localStorage.removeItem(STORAGE_KEY);
      
      // Load from sessionStorage for current session only
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        state = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load wishlist from sessionStorage:', e);
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

    addItem: (product: Product) => {
      if (state.items.some((item) => item.productId === product.id)) {
        return; // Already in wishlist
      }

      const newItem: WishlistItem = {
        id: generateId(),
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
      };

      state = {
        ...state,
        items: [...state.items, newItem],
      };

      persist();
      notify();
    },

    removeItem: (productId: string) => {
      state = {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
      };
      persist();
      notify();
    },

    toggleItem: (product: Product) => {
      const exists = state.items.some((item) => item.productId === product.id);
      if (exists) {
        state = {
          ...state,
          items: state.items.filter((item) => item.productId !== product.id),
        };
      } else {
        const newItem: WishlistItem = {
          id: generateId(),
          productId: product.id,
          product,
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

    isInWishlist: (productId: string) => {
      return state.items.some((item) => item.productId === productId);
    },

    getItemCount: () => {
      return state.items.length;
    },

    subscribe: (callback: () => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

// Singleton instance
export const wishlistStore = createWishlistStore();

// Stable callbacks for useSyncExternalStore
const subscribeWishlist = (callback: () => void) => wishlistStore.subscribe(callback);
const getWishlistSnapshot = () => wishlistStore.getState();
const getWishlistServerSnapshot = () => ({ items: [] });

// React hook
export function useWishlist() {
  const state = useSyncExternalStore(subscribeWishlist, getWishlistSnapshot, getWishlistServerSnapshot);

  // Derive itemCount from subscribed state for reactive updates
  const itemCount = state.items.length;

  return {
    items: state.items,
    itemCount,
    addItem: wishlistStore.addItem,
    removeItem: wishlistStore.removeItem,
    toggleItem: wishlistStore.toggleItem,
    isInWishlist: (productId: string) => state.items.some((item) => item.productId === productId),
  };
}
