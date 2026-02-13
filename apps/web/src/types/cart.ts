// Cart Types - Based on PRD Section 9.1

import type { Product, ProductVariant } from './product'

export interface CartItem {
  id: string
  productId: string
  product: Product
  quantity: number
  selectedVariant?: ProductVariant
  addedAt: string
}

export interface Cart {
  items: Array<CartItem>
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  currency: string
}

export interface WishlistItem {
  id: string
  productId: string
  product: Product
  addedAt: string
}

export interface Wishlist {
  items: Array<WishlistItem>
  itemCount: number
}
