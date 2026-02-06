import type { AccountStats, Order } from "@/types";
import { getStoredOrders } from "@/stores/order-store";

const fallbackOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2026-001",
    date: "2026-01-28",
    total: 299.99,
    status: "shipped",
    items: 3,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop",
  },
  {
    id: "2",
    orderNumber: "ORD-2026-002",
    date: "2026-01-25",
    total: 149.5,
    status: "delivered",
    items: 2,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop",
  },
  {
    id: "3",
    orderNumber: "ORD-2026-003",
    date: "2026-01-20",
    total: 89.99,
    status: "delivered",
    items: 1,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100&h=100&fit=crop",
  },
];

// Mock account statistics
export function getAccountStats(): AccountStats {
  const storedOrders = getStoredOrders();
  if (storedOrders.length > 0) {
    return {
      totalOrders: storedOrders.length,
      wishlistItems: 8,
    };
  }

  return {
    totalOrders: 12,
    wishlistItems: 8,
  };
}

// Mock recent orders
export function getRecentOrders(): Order[] {
  const storedOrders = getStoredOrders();
  return storedOrders.length > 0 ? storedOrders : fallbackOrders;
}
