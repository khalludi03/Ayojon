export interface AccountStats {
  totalOrders: number;
  wishlistItems: number;
}

export interface OrderStatus {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  label: string;
  color: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus['status'];
  items: number;
  imageUrl?: string;
}

export type AccountSection =
  | 'overview'
  | 'orders'
  | 'wishlist'
  | 'addresses'
  | 'profile'
  | 'settings';
