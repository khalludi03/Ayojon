// Wishlist Store

import { useEffect, useSyncExternalStore } from 'react'
import { toast } from 'sonner'
import type { Product } from '@/types'
import { generateId } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'
import { orpcClient } from '@/utils/orpc'

const STORAGE_KEY_PREFIX = 'ayojon-wishlist'
const GUEST_USER_ID = 'guest'

export interface WishlistItem {
  id: string
  productId: string
  product: Product
  addedAt: string
}

interface WishlistState {
  items: Array<WishlistItem>
  isInitialized: boolean
}

interface WishlistStore {
  getState: () => WishlistState
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  toggleItem: (product: Product) => Promise<void>
  isInWishlist: (productId: string) => boolean
  getItemCount: () => number
  subscribe: (callback: () => void) => () => void
  loadUserWishlist: (userId: string | null) => void
  initialize: () => void
  syncWithBackend: () => Promise<void>
}

// Helper function to get storage key based on user ID
function getStorageKey(userId: string | null): string {
  return userId
    ? `${STORAGE_KEY_PREFIX}-${userId}`
    : `${STORAGE_KEY_PREFIX}-${GUEST_USER_ID}`
}

function createWishlistStore(): WishlistStore {
  let state: WishlistState = {
    items: [],
    isInitialized: false,
  }
  let currentUserId: string | null = null
  const listeners = new Set<() => void>()

  const syncFromSession = (keepCurrentOnNull: boolean = false) => {
    authClient.getSession().then((session) => {
      const sessionData = session.data as { user?: { id: string } } | null
      const sessionUserId = sessionData?.user?.id || null
      const resolvedUserId =
        sessionUserId ?? (keepCurrentOnNull ? currentUserId : null)

      if (resolvedUserId !== currentUserId) {
        currentUserId = resolvedUserId
      }

      loadWishlist(resolvedUserId)
      if (resolvedUserId) {
        syncWithBackend()
      }
      notify()
    })
  }

  const syncWithBackend = async () => {
    if (!currentUserId) return

    try {
      // Get backend items
      const backendItems = await orpcClient.wishlist.list({} as any)

      // Transform backend items to local format
      const transformedItems: Array<WishlistItem> = (
        backendItems as Array<any>
      ).map((item) => ({
        id: generateId(),
        productId: item.productId,
        product: item.product,
        addedAt: item.createdAt,
      }))

      state = {
        ...state,
        items: transformedItems,
        isInitialized: true,
      }

      persist()
      notify()
    } catch (e) {
      console.error('[Wishlist] Failed to sync with backend:', e)
    }
  }

  // Helper to load wishlist for a specific user from localStorage
  const loadWishlist = (userId: string | null) => {
    if (typeof window === 'undefined') return

    try {
      const storageKey = getStorageKey(userId)
      const stored = localStorage.getItem(storageKey)

      if (stored) {
        const parsed = JSON.parse(stored)
        state = {
          items: Array.isArray(parsed.items) ? parsed.items : [],
          isInitialized: true,
        }
      } else {
        state = { items: [], isInitialized: true }
      }

      notify()
    } catch (e) {
      console.error('Failed to load wishlist from localStorage:', e)
      state = { items: [], isInitialized: true }
    }
  }

  const notify = () => {
    listeners.forEach((listener) => listener())
  }

  const persist = () => {
    if (typeof window !== 'undefined') {
      const storageKey = getStorageKey(currentUserId)
      const { isInitialized, ...persistedState } = state
      localStorage.setItem(storageKey, JSON.stringify(persistedState))
    }
  }

  return {
    getState: () => state,

    initialize: () => {
      if (state.isInitialized || typeof window === 'undefined') return
      syncFromSession()
    },

    addItem: async (product: Product) => {
      if (state.items.some((item) => item.productId === product.id)) {
        return // Already in wishlist
      }

      const newItem: WishlistItem = {
        id: generateId(),
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
      }

      state = {
        ...state,
        items: [...state.items, newItem],
      }

      persist()
      notify()

      if (currentUserId) {
        try {
          await orpcClient.wishlist.add({ productId: product.id } as any)
        } catch (e) {
          console.error('[Wishlist] Failed to add to backend:', e)
        }
      }

      if (typeof window !== 'undefined') {
        toast.success('Added to wishlist')
      }
    },

    removeItem: async (productId: string) => {
      state = {
        ...state,
        items: state.items.filter((item) => item.productId !== productId),
      }
      persist()
      notify()

      if (currentUserId) {
        try {
          await orpcClient.wishlist.remove({ productId } as any)
        } catch (e) {
          console.error('[Wishlist] Failed to remove from backend:', e)
        }
      }

      if (typeof window !== 'undefined') {
        toast.error('Removed from wishlist', {
          style: {
            textDecoration: 'line-through',
          },
        })
      }
    },

    toggleItem: async (product: Product) => {
      const exists = state.items.some((item) => item.productId === product.id)
      if (exists) {
        await wishlistStore.removeItem(product.id)
      } else {
        await wishlistStore.addItem(product)
      }
    },

    isInWishlist: (productId: string) => {
      return state.items.some((item) => item.productId === productId)
    },

    getItemCount: () => {
      return state.items.length
    },

    subscribe: (callback: () => void) => {
      listeners.add(callback)
      return () => listeners.delete(callback)
    },

    loadUserWishlist: (userId: string | null) => {
      if (userId === currentUserId) return
      currentUserId = userId
      loadWishlist(userId)
      if (userId) syncWithBackend()
      notify()
    },

    syncWithBackend,
  }
}

// Singleton instance
export const wishlistStore = createWishlistStore()

const INITIAL_WISHLIST_STATE: WishlistState = {
  items: [],
  isInitialized: false,
}

// Stable callbacks for useSyncExternalStore
const subscribeWishlist = (callback: () => void) =>
  wishlistStore.subscribe(callback)
const getWishlistSnapshot = () => wishlistStore.getState()
const getWishlistServerSnapshot = () => INITIAL_WISHLIST_STATE

// React hook
export function useWishlist() {
  const state = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot,
  )
  const { data: session, isPending } = authClient.useSession()

  // Initialize store on client side
  useEffect(() => {
    wishlistStore.initialize()
  }, [])

  // Sync wishlist when session changes
  useEffect(() => {
    if (!isPending && session?.user) {
      const userId = session.user.id
      wishlistStore.loadUserWishlist(userId)
    }
  }, [session?.user.id, isPending])

  // Derive itemCount from subscribed state for reactive updates
  const itemCount = state.items.length

  return {
    items: state.items,
    itemCount,
    addItem: wishlistStore.addItem,
    removeItem: wishlistStore.removeItem,
    toggleItem: wishlistStore.toggleItem,
    isInWishlist: (productId: string) =>
      state.items.some((item) => item.productId === productId),
  }
}
