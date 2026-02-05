import type { Order } from "@/types";

const STORAGE_KEY = "ayojon-orders";

const readOrders = (): Order[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored) as Order[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeOrders = (orders: Order[]) => {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const getStoredOrders = (): Order[] => readOrders();

export const addOrder = (order: Order) => {
  const orders = readOrders();
  writeOrders([order, ...orders]);
};

export const clearStoredOrders = () => {
  writeOrders([]);
};
