import type { Order } from '@/types'

const STORAGE_KEY = 'ayojon-orders'

const readOrders = (): Array<Order> => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    const parsed = JSON.parse(stored) as Array<Order>
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeOrders = (orders: Array<Order>) => {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
}

export const getStoredOrders = (): Array<Order> => readOrders()

export const addOrder = (order: Order) => {
  const orders = readOrders()
  writeOrders([order, ...orders])
}

export const updateOrder = (orderId: string, updates: Partial<Order>) => {
  const orders = readOrders()
  const updatedOrders = orders.map((order) =>
    order.id === orderId ? { ...order, ...updates } : order,
  )
  writeOrders(updatedOrders)
}

export const upsertOrder = (order: Order) => {
  const orders = readOrders()
  const hasOrder = orders.some((existing) => existing.id === order.id)
  const updatedOrders = hasOrder
    ? orders.map((existing) => (existing.id === order.id ? order : existing))
    : [order, ...orders]
  writeOrders(updatedOrders)
}

export const clearStoredOrders = () => {
  writeOrders([])
}
