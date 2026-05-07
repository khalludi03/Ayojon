// Cart Store - Based on PRD Section 9.1

import { useEffect, useSyncExternalStore } from 'react'
import type { CurrencyCode, Product, ProductVariant } from '@/types'
import { generateId } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

const STORAGE_KEY_PREFIX = 'ayojon-cart'
const LEGACY_STORAGE_KEY = 'zynex-cart'
const GUEST_USER_ID = 'guest'

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  selectedVariant?: ProductVariant
  addedAt: string
}

export type DeliveryMethodType = 'standard' | 'express' | 'same-day'

interface CartState {
  items: Array<CartItem>
  savedForLater: Array<CartItem>
  currency: CurrencyCode
  isDrawerOpen: boolean
  deliveryMethod: DeliveryMethodType | null
  discount: {
    code: string
    type: 'percentage' | 'fixed' | 'free_shipping'
    value: number
    amount: number
  } | null
  isInitialized?: boolean
}

interface CartStore {
  getState: () => CartState
  addItem: (
    product: Product,
    quantity?: number,
    variant?: ProductVariant,
  ) => void
  removeItem: (itemId: string) => void
  restoreItem: (item: CartItem) => void
  removeByProductId: (productId: string) => void
  toggleItem: (product: Product) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  saveForLater: (itemId: string) => void
  moveToCart: (itemId: string) => void
  removeSavedItem: (itemId: string) => void
  setDeliveryMethod: (method: DeliveryMethodType | null) => void
  applyCoupon: (
    code: string,
    type: 'percentage' | 'fixed' | 'free_shipping',
    value: number,
  ) => void
  removeCoupon: () => void
  getDiscount: () => number
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  getItemCount: () => number
  getSubtotal: () => number
  getTax: () => number
  getShipping: () => number
  getTotal: () => number
  isInCart: (productId: string) => boolean
  subscribe: (callback: () => void) => () => void
  initialize: () => void
  loadUserCart: (userId: string | null) => void
}

// Helper function to get storage key based on user ID
function getStorageKey(userId: string | null): string {
  return userId
    ? `${STORAGE_KEY_PREFIX}-${userId}`
    : `${STORAGE_KEY_PREFIX}-${GUEST_USER_ID}`
}

function createCartStore(): CartStore {
  let state: CartState = {
    items: [],
    savedForLater: [],
    currency: 'BDT',
    isDrawerOpen: false,
    deliveryMethod: null,
    discount: null,
  }
  let currentUserId: string | null = null
  const listeners = new Set<() => void>()

  const notify = () => {
    listeners.forEach((listener) => listener())
  }

  const syncFromSession = (keepCurrentOnNull: boolean = false) => {
    authClient.getSession().then((session) => {
      const sessionUserId = session.data?.user?.id ?? null
      const resolvedUserId =
        sessionUserId ?? (keepCurrentOnNull ? currentUserId : null)

      if (resolvedUserId !== currentUserId) {
        currentUserId = resolvedUserId
      }

      loadCart(resolvedUserId)
      notify()
    })
  }

  // Helper to load cart for a specific user
  const loadCart = (userId: string | null) => {
    if (typeof window === 'undefined') return

    try {
      const storageKey = getStorageKey(userId)
      const stored = localStorage.getItem(storageKey)

      let items = []
      let savedForLater = []
      let deliveryMethod = null
      let discount = null
      let currency = 'BDT'

      if (stored) {
        const parsed = JSON.parse(stored)
        items = parsed.items || []
        savedForLater = parsed.savedForLater || []
        deliveryMethod = parsed.deliveryMethod || null
        discount = parsed.discount || null
        currency = parsed.currency || 'BDT'
      }

      // If we are logging in, we SHOULD merge the guest cart items
      if (userId) {
        const guestKey = getStorageKey(null)
        const guestStored = localStorage.getItem(guestKey)

        if (guestStored) {
          const guestParsed = JSON.parse(guestStored)
          const guestItems = guestParsed.items || []
          const guestSavedForLater = guestParsed.savedForLater || []

          if (guestItems.length > 0 || guestSavedForLater.length > 0) {
            // Merge items: add guest items that aren't already in user's cart
            // or just append them (might result in duplicates but simpler)
            // A better way is to merge by product ID + variant ID
            const mergedItems = [...items]
            guestItems.forEach((guestItem: CartItem) => {
              const existingIndex = mergedItems.findIndex(
                (item) =>
                  item.productId === guestItem.productId &&
                  item.selectedVariant?.id === guestItem.selectedVariant?.id,
              )
              if (existingIndex >= 0) {
                mergedItems[existingIndex].quantity += guestItem.quantity
              } else {
                mergedItems.push(guestItem)
              }
            })

            const mergedSaved = [...savedForLater]
            guestSavedForLater.forEach((guestItem: CartItem) => {
              const exists = mergedSaved.some(
                (item) =>
                  item.productId === guestItem.productId &&
                  item.selectedVariant?.id === guestItem.selectedVariant?.id,
              )
              if (!exists) {
                mergedSaved.push(guestItem)
              }
            })

            items = mergedItems
            savedForLater = mergedSaved

            // If user had no delivery method/discount, take from guest
            deliveryMethod =
              deliveryMethod || guestParsed.deliveryMethod || null
            discount = discount || guestParsed.discount || null

            // Update state with merged data
            state = {
              ...state,
              items,
              savedForLater,
              deliveryMethod,
              discount,
              currency: currency as CurrencyCode,
              isInitialized: true,
            }

            // Persist merged cart to user's key
            persist()

            // Clear guest cart after successful merge
            localStorage.removeItem(guestKey)
          } else {
            state = {
              ...state,
              items,
              savedForLater,
              deliveryMethod,
              discount,
              currency: currency as CurrencyCode,
              isInitialized: true,
            }
          }
        } else {
          state = {
            ...state,
            items,
            savedForLater,
            deliveryMethod,
            discount,
            currency: currency as CurrencyCode,
            isInitialized: true,
          }
        }
      } else {
        state = {
          ...state,
          items,
          savedForLater,
          deliveryMethod,
          discount,
          currency: currency as CurrencyCode,
          isInitialized: true,
        }
      }

      // One-time migration from old keys
      const legacyStorageKey = 'ayojon-cart' // Old non-prefixed key
      const legacyStored = localStorage.getItem(legacyStorageKey)
      if (legacyStored && !stored) {
        const parsed = JSON.parse(legacyStored)
        state = {
          ...state,
          items: parsed.items || state.items,
          savedForLater: parsed.savedForLater || state.savedForLater,
          isInitialized: true,
        }
        persist()
        localStorage.removeItem(legacyStorageKey)
      }

      // Clear session storage if any
      sessionStorage.removeItem(STORAGE_KEY_PREFIX)
      sessionStorage.removeItem(legacyStorageKey)
      sessionStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e)
      state = { ...state, isInitialized: true }
    }
  }

  // Initial load - check if there's a session
  if (typeof window !== 'undefined') {
    syncFromSession()

    // Subscribe to auth session changes
    const sessionSignal = authClient.$store.atoms.$sessionSignal
    sessionSignal.subscribe(() => {
      syncFromSession(true)
    })

    // Reload cart when tab becomes visible (handles multi-tab sync)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncFromSession(true)
      }
    })
  }

  const persist = () => {
    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey(currentUserId)
      // Don't persist UI state like isDrawerOpen or isInitialized
      const { isDrawerOpen, isInitialized, ...persistedState } = state
      localStorage.setItem(storageKey, JSON.stringify(persistedState))
    }
  }

  return {
    getState: () => state,

    initialize: () => {
      if (state.isInitialized || typeof window === 'undefined') return
      syncFromSession()
    },

    loadUserCart: (userId: string | null) => {
      if (userId === currentUserId && state.isInitialized) return
      currentUserId = userId
      loadCart(userId)
      notify()
    },

    addItem: (
      product: Product,
      quantity: number = 1,
      variant?: ProductVariant,
    ) => {
      const existingIndex = state.items.findIndex(
        (item) =>
          item.productId === product.id &&
          item.selectedVariant?.id === variant?.id,
      )

      if (existingIndex >= 0) {
        // Update quantity of existing item
        state = {
          ...state,
          items: state.items.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          ),
        }
      } else {
        // Add new item
        const newItem: CartItem = {
          id: generateId(),
          productId: product.id,
          product,
          quantity,
          selectedVariant: variant,
          addedAt: new Date().toISOString(),
        }
        state = {
          ...state,
          items: [...state.items, newItem],
        }
      }

      persist()
      notify()
    },

    removeItem: (itemId: string) => {
      state = {
        ...state,
        items: state.items.filter((item) => item.id !== itemId),
      }
      persist()
      notify()
    },

    restoreItem: (item: CartItem) => {
      if (!state.items.some((existing) => existing.id === item.id)) {
        state = { ...state, items: [...state.items, item] }
        persist()
        notify()
      }
    },

    removeByProductId: (productId: string) => {
      state = {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
      }
      persist()
      notify()
    },

    toggleItem: (product: Product) => {
      const existingItem = state.items.find(
        (item) => item.productId === product.id,
      )

      if (existingItem) {
        // Remove item if already in cart
        state = {
          ...state,
          items: state.items.filter((item) => item.productId !== product.id),
        }
      } else {
        // Add new item
        const newItem: CartItem = {
          id: generateId(),
          productId: product.id,
          product,
          quantity: 1,
          selectedVariant: undefined,
          addedAt: new Date().toISOString(),
        }
        state = {
          ...state,
          items: [...state.items, newItem],
        }
      }

      persist()
      notify()
    },

    updateQuantity: (itemId: string, quantity: number) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        state = {
          ...state,
          items: state.items.filter((item) => item.id !== itemId),
        }
      } else {
        state = {
          ...state,
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item,
          ),
        }
      }
      persist()
      notify()
    },

    clearCart: () => {
      state = { ...state, items: [] }
      persist()
      notify()
    },

    saveForLater: (itemId: string) => {
      const foundItem = state.items.find((item) => item.id === itemId)
      if (foundItem) {
        state = {
          ...state,
          items: state.items.filter((item) => item.id !== itemId),
          savedForLater: [...state.savedForLater, foundItem],
        }
        persist()
        notify()
      }
    },

    moveToCart: (itemId: string) => {
      const foundItem = state.savedForLater.find((item) => item.id === itemId)
      if (foundItem) {
        state = {
          ...state,
          savedForLater: state.savedForLater.filter(
            (item) => item.id !== itemId,
          ),
          items: [...state.items, foundItem],
        }
        persist()
        notify()
      }
    },

    removeSavedItem: (itemId: string) => {
      state = {
        ...state,
        savedForLater: state.savedForLater.filter((item) => item.id !== itemId),
      }
      persist()
      notify()
    },

    applyCoupon: (
      code: string,
      type: 'percentage' | 'fixed' | 'free_shipping',
      value: number,
    ) => {
      const subtotal = cartStore.getSubtotal()
      let discountAmount = 0

      if (type === 'percentage') {
        discountAmount = (subtotal * value) / 100
      } else if (type === 'fixed') {
        discountAmount = value
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (type === 'free_shipping') {
        discountAmount = 0 // Shipping handled separately in getShipping()
      }

      // Don't allow discount to exceed subtotal + shipping (simplified)
      discountAmount = Math.min(
        discountAmount,
        subtotal + cartStore.getShipping(),
      )

      state = {
        ...state,
        discount: {
          code,
          type,
          value,
          amount: discountAmount,
        },
      }
      persist()
      notify()
    },

    removeCoupon: () => {
      state = {
        ...state,
        discount: null,
      }
      persist()
      notify()
    },

    setDeliveryMethod: (method: DeliveryMethodType | null) => {
      state = { ...state, deliveryMethod: method }
      persist()
      notify()
    },

    getDiscount: () => {
      if (!state.discount) return 0

      const subtotal = cartStore.getSubtotal()
      let discountAmount = 0

      if (state.discount.type === 'percentage') {
        discountAmount = (subtotal * state.discount.value) / 100
      } else if (state.discount.type === 'fixed') {
        discountAmount = state.discount.value
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (state.discount.type === 'free_shipping') {
        // Free shipping discount - return 0 to make shipping free
        return 0
      }

      // Update the stored amount for consistency
      discountAmount = Math.min(discountAmount, subtotal)
      if (state.discount.amount !== discountAmount) {
        state.discount.amount = discountAmount
      }

      return discountAmount
    },

    openDrawer: () => {
      state = { ...state, isDrawerOpen: true }
      notify()
    },

    closeDrawer: () => {
      state = { ...state, isDrawerOpen: false }
      notify()
    },

    toggleDrawer: () => {
      state = { ...state, isDrawerOpen: !state.isDrawerOpen }
      notify()
    },

    getItemCount: () => {
      return state.items.reduce((total, item) => total + item.quantity, 0)
    },

    getSubtotal: () => {
      return state.items.reduce((total, item) => {
        const price = item.product.pricing.currentPrice
        const variantModifier = item.selectedVariant?.priceModifier || 0
        return total + (price + variantModifier) * item.quantity
      }, 0)
    },

    getTax: () => {
      const subtotal = cartStore.getSubtotal()
      // 5% tax rate
      return subtotal * 0.05
    },

    getShipping: () => {
      // Free shipping coupon overrides everything
      if (state.discount?.type === 'free_shipping') {
        return 0
      }

      const subtotal = cartStore.getSubtotal()
      const deliveryMethod = state.deliveryMethod

      // If no items, no shipping
      if (state.items.length === 0) {
        return 0
      }

      // Calculate based on delivery method
      if (deliveryMethod === 'standard') {
        // Free shipping for orders over 1000 BDT
        return subtotal >= 1000 ? 0 : 50
      } else if (deliveryMethod === 'express') {
        return 100
      } else if (deliveryMethod === 'same-day') {
        return 150
      }

      // Default: Standard delivery logic if no method selected
      return subtotal >= 1000 ? 0 : 50
    },

    getTotal: () => {
      const subtotal = cartStore.getSubtotal()
      const tax = cartStore.getTax()
      const shipping = cartStore.getShipping()
      const discount = cartStore.getDiscount()
      return subtotal + tax + shipping - discount
    },

    isInCart: (productId: string) => {
      return state.items.some((item) => item.productId === productId)
    },

    subscribe: (callback: () => void) => {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },
  }
}

// Singleton instance
export const cartStore = createCartStore()

// Stable callbacks for useSyncExternalStore
const subscribeCart = (callback: () => void) => cartStore.subscribe(callback)
const getCartSnapshot = () => cartStore.getState()
const getCartServerSnapshot = () => ({
  items: [],
  savedForLater: [],
  currency: 'BDT' as CurrencyCode,
  isDrawerOpen: false,
  deliveryMethod: null,
  discount: null,
})

// React hook
export function useCart() {
  const state = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  )
  const { data: session, isPending } = authClient.useSession()

  // Sync cart when session changes
  useEffect(() => {
    if (!isPending) {
      const userId = session != null ? session.user.id : null
      cartStore.loadUserCart(userId)
    }
  }, [session, isPending])

  // Derive values from subscribed state for reactive updates
  const itemCount = state.items.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  const subtotal = state.items.reduce((total, item) => {
    const price = item.product.pricing.currentPrice
    const variantModifier = item.selectedVariant?.priceModifier || 0
    return total + (price + variantModifier) * item.quantity
  }, 0)

  const tax = subtotal * 0.05

  const shipping = cartStore.getShipping()

  let discountAmount = 0
  if (state.discount) {
    if (state.discount.type === 'percentage') {
      discountAmount = (subtotal * state.discount.value) / 100
    } else if (state.discount.type === 'fixed') {
      discountAmount = state.discount.value
    }
    discountAmount = Math.min(discountAmount, subtotal)
  }

  const total = subtotal + tax + shipping - discountAmount

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
    isInCart: (productId: string) =>
      state.items.some((item) => item.productId === productId),
  }
}
