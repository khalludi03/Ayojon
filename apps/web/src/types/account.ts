import type { Product } from './product';

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

export interface OrderAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  division: string;
  postalCode?: string;
  addressType?: 'home' | 'office';
}

export interface OrderPayment {
  method: string;
  last4?: string;
  provider?: string;
}

export interface OrderPricing {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

export interface OrderTimeline {
  placedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
}

export interface OrderLineItem {
  id: string;
  title: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  productId?: string;
  product?: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: OrderStatus['status'];
  items: number;
  imageUrl?: string;
  deliveryMethod?: string;
  lineItems?: Array<OrderLineItem>;
  trackingNumber?: string;
  estimatedDelivery?: string;
  address?: OrderAddress;
  payment?: OrderPayment;
  pricing?: OrderPricing;
  timeline?: OrderTimeline;
}

export type AccountSection =
  | 'overview'
  | 'orders'
  | 'wishlist'
  | 'addresses'
  | 'profile'
  | 'settings';
