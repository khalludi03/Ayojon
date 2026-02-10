export type VendorOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'bkash' | 'card' | 'cod' | 'nagad';

export interface VendorOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface VendorOrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: {
    addressLine1: string;
    addressLine2?: string;
    city: string;
    division: string;
    postalCode: string;
  };
}

export interface VendorOrderPayment {
  method: PaymentMethod;
  status: 'paid' | 'pending' | 'failed';
  amount: number;
  transactionId?: string;
}

export interface VendorOrderShipping {
  method: string;
  trackingNumber?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
}

export interface VendorOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  customer: VendorOrderCustomer;
  items: VendorOrderItem[];
  payment: VendorOrderPayment;
  shipping: VendorOrderShipping;
  status: VendorOrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  notes?: string;
  deliveryInstructions?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface StatusUpdatePayload {
  orderId: string;
  newStatus: VendorOrderStatus;
  trackingNumber?: string;
  notes?: string;
}
