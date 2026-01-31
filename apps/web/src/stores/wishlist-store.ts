// Wishlist Store

import { useCallback, useEffect, useSyncExternalStore } from 'react';
import type { Product } from '@/types';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';

const STORAGE_KEY_PREFIX = 'ayojon-wishlist';
const LEGACY_STORAGE_KEY = 'zynex-wishlist';
const GUEST_USER_ID = 'guest';

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
  loadUserWishlist: (userId: string | null) => void;
}

// Helper function to get storage key based on user ID
function getStorageKey(userId: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : `${STORAGE_KEY_PREFIX}-${GUEST_USER_ID}`;
}

function createWishlistStore(): WishlistStore {
  let state: WishlistState = {
    items: [],
  };
  let currentUserId: string | null = null;
  const listeners = new Set<() => void>();

  // Helper to load wishlist for a specific user
  const loadWishlist = (userId: string | null) => {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = getStorageKey(userId);
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        state = JSON.parse(stored);
      } else {
        state = { items: [] };
      }

      // One-time migration from old global key to user-specific key
      if (!stored && userId) {
        const legacyGlobal = localStorage.getItem(STORAGE_KEY_PREFIX);
        const legacyOld = localStorage.getItem(LEGACY_STORAGE_KEY);

        if (legacyGlobal) {
          // Migrate global wishlist to this user
          state = JSON.parse(legacyGlobal);
          localStorage.setItem(storageKey, legacyGlobal);
          localStorage.removeItem(STORAGE_KEY_PREFIX);
        } else if (legacyOld) {
          // Migrate very old wishlist
          state = JSON.parse(legacyOld);
          localStorage.setItem(storageKey, legacyOld);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }
      }

      // Clear any legacy sessionStorage data
      sessionStorage.removeItem(STORAGE_KEY_PREFIX);
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);

    } catch (e) {
      console.error('Failed to load wishlist from localStorage:', e);
      state = { items: [] };
    }
  };

  // Initial load - check if there's a session
  if (typeof window !== 'undefined') {
    authClient.getSession().then((session) => {
      const userId = session?.user?.id || null;
      currentUserId = userId;
      loadWishlist(userId);
      notify();
    });

    // Subscribe to auth session changes using nanostores subscribe API
    authClient.$sessionSignal.subscribe(() => {
      authClient.getSession().then((session) => {
        const newUserId = session?.user?.id || null;
        if (newUserId !== currentUserId) {
          currentUserId = newUserId;
          loadWishlist(newUserId);
          notify();
        }
      });
    });
  }

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const persist = () => {
    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey(currentUserId);
      localStorage.setItem(storageKey, JSON.stringify(state));
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

      // Show toast notification
      if (typeof window !== 'undefined') {
        toast.success('Added to wishlist');
      }
    },

    removeItem: (productId: string) => {
      state = {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
      };
      persist();
      notify();

      // Show toast notification with red color and strikethrough
      if (typeof window !== 'undefined') {
        toast.error('Removed from wishlist', {
          style: {
            textDecoration: 'line-through',
          },
        });
      }
    },

    toggleItem: (product: Product) => {
      const exists = state.items.some((item) => item.productId === product.id);
      if (exists) {
        state = {
          ...state,
          items: state.items.filter((item) => item.productId !== product.id),
        };
        // Show remove toast notification with red color and strikethrough
        if (typeof window !== 'undefined') {
          toast.error('Removed from wishlist', {
            style: {
              textDecoration: 'line-through',
            },
          });
        }
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
        // Show add toast notification
        if (typeof window !== 'undefined') {
          toast.success('Added to wishlist');
        }
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

    loadUserWishlist: (userId: string | null) => {
      currentUserId = userId;
      loadWishlist(userId);
      notify();
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
  const { data: session } = authClient.useSession();

  // Sync wishlist when session changes
  useEffect(() => {
    const userId = session?.user?.id || null;
    wishlistStore.loadUserWishlist(userId);
  }, [session?.user?.id]);

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
