// Cart Store - Based on PRD Section 9.1

import { useEffect, useSyncExternalStore } from 'react';
import type { CurrencyCode, Product, ProductVariant } from '@/types';
import { generateId } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { orpcClient } from '@/utils/orpc';

const STORAGE_KEY_PREFIX = 'ayojon-cart';
const GUEST_USER_ID = 'guest';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant;
  addedAt: string;
  savedForLater?: boolean;
}

export type DeliveryMethodType = 'standard' | 'express' | 'same-day';

interface CartState {
  items: Array<CartItem>;
  savedForLater: Array<CartItem>;
  currency: CurrencyCode;
  isDrawerOpen: boolean;
  deliveryMethod: DeliveryMethodType | null;
  discount: {
    code: string;
    type: 'percentage' | 'fixed' | 'free_shipping';
    value: number;
    amount: number;
  } | null;
  isInitialized?: boolean;
}

interface CartStore {
  getState: () => CartState;
  addItem: (product: Product, quantity?: number, variant?: ProductVariant) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  restoreItem: (item: CartItem) => void;
  removeByProductId: (productId: string) => void;
  toggleItem: (product: Product) => void;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  removeSavedItem: (itemId: string) => Promise<void>;
  setDeliveryMethod: (method: DeliveryMethodType | null) => void;
  applyCoupon: (code: string, type: 'percentage' | 'fixed' | 'free_shipping', value: number) => void;
  removeCoupon: () => void;
  getDiscount: () => number;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getTax: () => number;
  getShipping: () => number;
  getTotal: () => number;
  isInCart: (productId: string) => boolean;
  subscribe: (callback: () => void) => () => void;
  initialize: () => void;
  loadUserCart: (userId: string | null) => void;
  syncWithBackend: () => Promise<void>;
}

// Helper function to get storage key based on user ID
function getStorageKey(userId: string | null): string {
  return userId ? `${STORAGE_KEY_PREFIX}-${userId}` : `${STORAGE_KEY_PREFIX}-${GUEST_USER_ID}`;
}

function createCartStore(): CartStore {
  let state: CartState = {
    items: [],
    savedForLater: [],
    currency: 'BDT',
    isDrawerOpen: false,
    deliveryMethod: null,
    discount: null,
  };
  let currentUserId: string | null = null;
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const syncFromSession = (keepCurrentOnNull: boolean = false) => {
    authClient.getSession().then((session) => {
      const sessionUserId = session.data?.user?.id || null;
      const resolvedUserId = sessionUserId ?? (keepCurrentOnNull ? currentUserId : null);

      if (resolvedUserId !== currentUserId) {
        currentUserId = resolvedUserId;
      }

      loadCart(resolvedUserId).then(() => {
        if (resolvedUserId) {
          syncWithBackend();
        }
      });
      notify();
    });
  };

  const syncWithBackend = async () => {
    if (!currentUserId) return;

    try {
      const allLocalItems = [
        ...state.items.map(item => ({ ...item, savedForLater: 0 })),
        ...state.savedForLater.map(item => ({ ...item, savedForLater: 1 }))
      ];

      if (allLocalItems.length > 0) {
        const syncInput = allLocalItems.map(item => ({
          productId: item.productId,
          variantId: item.selectedVariant?.id || '',
          quantity: item.quantity,
          savedForLater: item.savedForLater || 0,
        }));
        
        const backendItems = await orpcClient.cart.sync(syncInput as any);
        
        const transformedItems: CartItem[] = (backendItems as any[]).filter(i => i.savedForLater === 0).map(item => ({
          id: generateId(),
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          selectedVariant: item.product.variants?.find((v: any) => v.id === item.variantId),
          addedAt: item.createdAt,
        }));

        const transformedSaved: CartItem[] = (backendItems as any[]).filter(i => i.savedForLater === 1).map(item => ({
          id: generateId(),
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          selectedVariant: item.product.variants?.find((v: any) => v.id === item.variantId),
          addedAt: item.createdAt,
        }));

        state = {
          ...state,
          items: transformedItems,
          savedForLater: transformedSaved,
          isInitialized: true
        };
        
        persist();
        notify();
      } else {
        const backendItems = await orpcClient.cart.list({} as any);
        
        const transformedItems: CartItem[] = (backendItems as any[]).filter(i => i.savedForLater === 0).map(item => ({
          id: generateId(),
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          selectedVariant: item.product.variants?.find((v: any) => v.id === item.variantId),
          addedAt: item.createdAt,
        }));

        const transformedSaved: CartItem[] = (backendItems as any[]).filter(i => i.savedForLater === 1).map(item => ({
          id: generateId(),
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          selectedVariant: item.product.variants?.find((v: any) => v.id === item.variantId),
          addedAt: item.createdAt,
        }));

        state = {
          ...state,
          items: transformedItems,
          savedForLater: transformedSaved,
          isInitialized: true
        };
        
        persist();
        notify();
      }
    } catch (e) {
      console.error('[Cart] Sync with backend failed:', e);
    }
  };

  const loadCart = async (userId: string | null) => {
    if (typeof window === 'undefined') return;

    try {
      const storageKey = getStorageKey(userId);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        state = {
          ...state,
          items: parsed.items || [],
          savedForLater: parsed.savedForLater || [],
          deliveryMethod: parsed.deliveryMethod || null,
          discount: parsed.discount || null,
          currency: parsed.currency || 'BDT',
          isInitialized: true
        };
      } else {
        state = { ...state, items: [], savedForLater: [], isInitialized: true };
      }
      notify();
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      state = { ...state, isInitialized: true };
    }
  };

  const persist = () => {
    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey(currentUserId);
      const { isDrawerOpen, isInitialized, ...persistedState } = state;
      localStorage.setItem(storageKey, JSON.stringify(persistedState));
    }
  };

  return {
    getState: () => state,

    initialize: () => {
      if (state.isInitialized || typeof window === 'undefined') return;
      syncFromSession();
    },

    loadUserCart: (userId: string | null) => {
      if (userId === currentUserId && state.isInitialized) return;
      currentUserId = userId;
      loadCart(userId).then(() => {
        if (userId) syncWithBackend();
      });
      notify();
    },

    addItem: async (product: Product, quantity: number = 1, variant?: ProductVariant) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedVariant?.id === variant?.id
      );

      let newQuantity = quantity;
      if (existingIndex >= 0) {
        newQuantity = state.items[existingIndex].quantity + quantity;
        state = {
          ...state,
          items: state.items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: newQuantity }
              : item
          ),
        };
      } else {
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

      if (currentUserId) {
        try {
          await orpcClient.cart.update({
            productId: product.id,
            variantId: variant?.id || '',
            quantity: newQuantity,
            savedForLater: 0
          } as any);
        } catch (e) {
          console.error('[Cart] Backend update failed:', e);
        }
      }
    },

    removeItem: async (itemId: string) => {
      const item = state.items.find(i => i.id === itemId);
      state = {
        ...state,
        items: state.items.filter((item) => item.id !== itemId),
      };
      persist();
      notify();

      if (currentUserId && item) {
        try {
          await orpcClient.cart.remove({
            productId: item.productId,
            variantId: item.selectedVariant?.id || ''
          } as any);
        } catch (e) {
          console.error('[Cart] Backend remove failed:', e);
        }
      }
    },

    restoreItem: (item: CartItem) => {
      if (!state.items.some((existing) => existing.id === item.id)) {
        state = { ...state, items: [...state.items, item] };
        persist();
        notify();
        
        if (currentUserId) {
          orpcClient.cart.update({
            productId: item.productId,
            variantId: item.selectedVariant?.id || '',
            quantity: item.quantity,
            savedForLater: 0
          } as any).catch(e => console.error(e));
        }
      }
    },

    removeByProductId: (productId: string) => {
      const itemsToRemove = state.items.filter(i => i.productId === productId);
      state = {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
      };
      persist();
      notify();

      if (currentUserId) {
        itemsToRemove.forEach(item => {
          orpcClient.cart.remove({
            productId: item.productId,
            variantId: item.selectedVariant?.id || ''
          } as any).catch(e => console.error(e));
        });
      }
    },

    toggleItem: (product: Product) => {
      const existingItem = state.items.find((item) => item.productId === product.id);
      if (existingItem) {
        cartStore.removeItem(existingItem.id);
      } else {
        cartStore.addItem(product);
      }
    },

    updateQuantity: async (itemId: string, quantity: number) => {
      const item = state.items.find(i => i.id === itemId);
      if (!item) return;

      if (quantity <= 0) {
        await cartStore.removeItem(itemId);
      } else {
        state = {
          ...state,
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        };
        persist();
        notify();

        if (currentUserId) {
          try {
            await orpcClient.cart.update({
              productId: item.productId,
              variantId: item.selectedVariant?.id || '',
              quantity,
              savedForLater: 0
            } as any);
          } catch (e) {
            console.error('[Cart] Backend update quantity failed:', e);
          }
        }
      }
    },

    clearCart: async () => {
      state = { ...state, items: [] };
      persist();
      notify();

      if (currentUserId) {
        try {
          await orpcClient.cart.clear({} as any);
        } catch (e) {
          console.error('[Cart] Backend clear failed:', e);
        }
      }
    },

    saveForLater: async (itemId: string) => {
      const item = state.items.find((item) => item.id === itemId);
      if (item) {
        state = {
          ...state,
          items: state.items.filter((item) => item.id !== itemId),
          savedForLater: [...state.savedForLater, item],
        };
        persist();
        notify();

        if (currentUserId) {
          try {
            await orpcClient.cart.update({
              productId: item.productId,
              variantId: item.selectedVariant?.id || '',
              quantity: item.quantity,
              savedForLater: 1
            } as any);
          } catch (e) {
            console.error('[Cart] Backend save for later failed:', e);
          }
        }
      }
    },

    moveToCart: async (itemId: string) => {
      const item = state.savedForLater.find((item) => item.id === itemId);
      if (item) {
        state = {
          ...state,
          savedForLater: state.savedForLater.filter((item) => item.id !== itemId),
          items: [...state.items, item],
        };
        persist();
        notify();

        if (currentUserId) {
          try {
            await orpcClient.cart.update({
              productId: item.productId,
              variantId: item.selectedVariant?.id || '',
              quantity: item.quantity,
              savedForLater: 0
            } as any);
          } catch (e) {
            console.error('[Cart] Backend move to cart failed:', e);
          }
        }
      }
    },

    removeSavedItem: async (itemId: string) => {
      const item = state.savedForLater.find(i => i.id === itemId);
      state = {
        ...state,
        savedForLater: state.savedForLater.filter((item) => item.id !== itemId),
      };
      persist();
      notify();

      if (currentUserId && item) {
        try {
          await orpcClient.cart.remove({
            productId: item.productId,
            variantId: item.selectedVariant?.id || ''
          } as any);
        } catch (e) {
          console.error('[Cart] Backend remove saved item failed:', e);
        }
      }
    },

    applyCoupon: (code: string, type: 'percentage' | 'fixed' | 'free_shipping', value: number) => {
      const subtotal = cartStore.getSubtotal();
      let discountAmount = 0;
      if (type === 'percentage') discountAmount = (subtotal * value) / 100;
      else if (type === 'fixed') discountAmount = value;
      else if (type === 'free_shipping') discountAmount = cartStore.getShipping();
      discountAmount = Math.min(discountAmount, subtotal + (type === 'free_shipping' ? discountAmount : cartStore.getShipping()));
      state = { ...state, discount: { code, type, value, amount: discountAmount } };
      persist();
      notify();
    },

    removeCoupon: () => { state = { ...state, discount: null }; persist(); notify(); },
    setDeliveryMethod: (method: DeliveryMethodType | null) => { state = { ...state, deliveryMethod: method }; persist(); notify(); },
    getDiscount: () => {
      if (!state.discount) return 0;
      const subtotal = cartStore.getSubtotal();
      let discountAmount = 0;
      if (state.discount.type === 'percentage') discountAmount = (subtotal * state.discount.value) / 100;
      else if (state.discount.type === 'fixed') discountAmount = state.discount.value;
      else if (state.discount.type === 'free_shipping') return 0; 
      discountAmount = Math.min(discountAmount, subtotal);
      if (state.discount.amount !== discountAmount) state.discount.amount = discountAmount;
      return discountAmount;
    },

    openDrawer: () => { state = { ...state, isDrawerOpen: true }; notify(); },
    closeDrawer: () => { state = { ...state, isDrawerOpen: false }; notify(); },
    toggleDrawer: () => { state = { ...state, isDrawerOpen: !state.isDrawerOpen }; notify(); },
    getItemCount: () => state.items.reduce((total, item) => total + item.quantity, 0),
    getSubtotal: () => state.items.reduce((total, item) => {
      if (!item.product?.pricing) return total;
      const price = item.product.pricing.currentPrice;
      const variantModifier = item.selectedVariant?.priceModifier || 0;
      return total + (price + variantModifier) * item.quantity;
    }, 0),
    getTax: () => cartStore.getSubtotal() * 0.05,
    getShipping: () => {
      if (state.discount?.type === 'free_shipping') return 0;
      const subtotal = cartStore.getSubtotal();
      if (state.items.length === 0) return 0;
      if (state.deliveryMethod === 'standard') return subtotal >= 1000 ? 0 : 50;
      if (state.deliveryMethod === 'express') return 100;
      if (state.deliveryMethod === 'same-day') return 150;
      return subtotal >= 1000 ? 0 : 50;
    },
    getTotal: () => cartStore.getSubtotal() + cartStore.getTax() + cartStore.getShipping() - cartStore.getDiscount(),
    isInCart: (productId: string) => state.items.some((item) => item.productId === productId),
    subscribe: (callback: () => void) => { listeners.add(callback); return () => listeners.delete(callback); },
    syncWithBackend,
  };
}

export const cartStore = createCartStore();

const subscribeCart = (callback: () => void) => cartStore.subscribe(callback);
const getCartSnapshot = () => cartStore.getState();
const CART_SERVER_SNAPSHOT = { 
  items: [], 
  savedForLater: [], 
  currency: 'BDT' as CurrencyCode, 
  isDrawerOpen: false, 
  deliveryMethod: null,
  discount: null 
};
const getCartServerSnapshot = () => CART_SERVER_SNAPSHOT;

export function useCart() {
  const state = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending) {
      const userId = session?.user?.id || null;
      cartStore.loadUserCart(userId);
    }
  }, [session?.user?.id, isPending]);

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = state.items.reduce((total, item) => {
    if (!item.product?.pricing) return total;
    const price = item.product.pricing.currentPrice;
    const variantModifier = item.selectedVariant?.priceModifier || 0;
    return total + (price + variantModifier) * item.quantity;
  }, 0);
  const tax = subtotal * 0.05;
  const shipping = cartStore.getShipping();
  let discountAmount = 0;
  if (state.discount) {
    if (state.discount.type === 'percentage') discountAmount = (subtotal * state.discount.value) / 100;
    else if (state.discount.type === 'fixed') discountAmount = state.discount.value;
    discountAmount = Math.min(discountAmount, subtotal);
  }
  const total = subtotal + tax + shipping - discountAmount;

  return {
    items: state.items,
    savedForLater: state.savedForLater,
    currency: state.currency,
    isDrawerOpen: state.isDrawerOpen,
    deliveryMethod: state.deliveryMethod,
    discount: state.discount,
    itemCount,
    subtotal,
    tax,
    shipping,
    discountAmount,
    total,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    restoreItem: cartStore.restoreItem,
    removeByProductId: cartStore.removeByProductId,
    toggleItem: cartStore.toggleItem,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    saveForLater: cartStore.saveForLater,
    moveToCart: cartStore.moveToCart,
    removeSavedItem: cartStore.removeSavedItem,
    setDeliveryMethod: cartStore.setDeliveryMethod,
    applyCoupon: cartStore.applyCoupon,
    removeCoupon: cartStore.removeCoupon,
    getDiscount: cartStore.getDiscount,
    openDrawer: cartStore.openDrawer,
    closeDrawer: cartStore.closeDrawer,
    toggleDrawer: cartStore.toggleDrawer,
    getSubtotal: cartStore.getSubtotal,
    getTax: cartStore.getTax,
    getShipping: cartStore.getShipping,
    getTotal: cartStore.getTotal,
    isInCart: (productId: string) => state.items.some((item) => item.productId === productId),
  };
}