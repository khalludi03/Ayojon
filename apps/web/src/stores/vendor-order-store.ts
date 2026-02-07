import type { VendorOrder, VendorOrderStatus } from '@/types/vendor-order';

const STORAGE_KEY = 'ayojon_vendor_orders';

// Mock orders for development
const generateMockOrders = (vendorId: string): VendorOrder[] => {
  const statuses: VendorOrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const paymentMethods = ['bkash', 'card', 'cod'] as const;
  const customers = [
    { name: 'John Doe', email: 'john@example.com', phone: '01712345678' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '01812345678' },
    { name: 'Bob Johnson', email: 'bob@example.com', phone: '01912345678' },
    { name: 'Alice Williams', email: 'alice@example.com', phone: '01612345678' },
    { name: 'Charlie Brown', email: 'charlie@example.com', phone: '01512345678' },
  ];

  const orders: VendorOrder[] = [];
  const now = new Date();

  for (let i = 0; i < 25; i++) {
    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));

    const customer = customers[Math.floor(Math.random() * customers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const subtotal = Math.floor(Math.random() * 5000) + 500;
    const shippingCost = Math.floor(Math.random() * 200) + 50;
    const tax = Math.floor(subtotal * 0.05);

    const items = Array.from({ length: itemCount }, (_, j) => ({
      id: `item-${i}-${j}`,
      productId: `product-${Math.floor(Math.random() * 100)}`,
      productName: `Product ${Math.floor(Math.random() * 100)}`,
      quantity: Math.floor(Math.random() * 3) + 1,
      price: Math.floor(Math.random() * 2000) + 200,
      imageUrl: undefined,
    }));

    orders.push({
      id: `order-${i + 1}`,
      orderNumber: `AYJ${Date.now().toString().slice(-8) + i}`,
      vendorId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: {
          addressLine1: `${Math.floor(Math.random() * 999) + 1} Main Street`,
          addressLine2: `Apartment ${Math.floor(Math.random() * 50) + 1}`,
          city: 'Dhaka',
          division: 'Dhaka',
          postalCode: '1200',
        },
      },
      items,
      payment: {
        method: paymentMethod,
        status: status === 'cancelled' ? 'failed' : status === 'pending' ? 'pending' : 'paid',
        amount: subtotal + shippingCost + tax,
        transactionId: paymentMethod !== 'cod' ? `TXN${Date.now() + i}` : undefined,
      },
      shipping: {
        method: Math.random() > 0.5 ? 'Standard Delivery' : 'Express Delivery',
        trackingNumber: status === 'shipped' || status === 'delivered' ? `TRK${Date.now() + i}` : undefined,
        shippedAt: status === 'shipped' || status === 'delivered' ? createdDate.toISOString() : undefined,
      },
      status,
      subtotal,
      shippingCost,
      tax,
      total: subtotal + shippingCost + tax,
      deliveryInstructions: Math.random() > 0.5 ? 'Please call before delivery' : undefined,
      createdAt: createdDate.toISOString(),
      updatedAt: createdDate.toISOString(),
      confirmedAt: status !== 'pending' && status !== 'cancelled' ? createdDate.toISOString() : undefined,
      shippedAt: status === 'shipped' || status === 'delivered' ? createdDate.toISOString() : undefined,
      deliveredAt: status === 'delivered' ? createdDate.toISOString() : undefined,
      cancelledAt: status === 'cancelled' ? createdDate.toISOString() : undefined,
    });
  }

  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export function getVendorOrders(vendorId: string): VendorOrder[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // Generate and save mock orders on first load
      const mockOrders = generateMockOrders(vendorId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
      return mockOrders;
    }

    const orders = JSON.parse(data) as VendorOrder[];
    return orders.filter(o => o.vendorId === vendorId);
  } catch (error) {
    console.error('Failed to get vendor orders:', error);
    return [];
  }
}

export function getVendorOrderById(orderId: string): VendorOrder | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const orders = JSON.parse(data) as VendorOrder[];
    return orders.find(o => o.id === orderId) || null;
  } catch (error) {
    console.error('Failed to get vendor order:', error);
    return null;
  }
}

export function updateVendorOrderStatus(
  orderId: string,
  newStatus: VendorOrderStatus,
  additionalData?: { trackingNumber?: string; notes?: string }
): void {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return;

    const orders = JSON.parse(data) as VendorOrder[];
    const index = orders.findIndex(o => o.id === orderId);

    if (index !== -1) {
      const now = new Date().toISOString();
      orders[index].status = newStatus;
      orders[index].updatedAt = now;

      // Update status-specific timestamps
      if (newStatus === 'confirmed' && !orders[index].confirmedAt) {
        orders[index].confirmedAt = now;
      } else if (newStatus === 'shipped') {
        orders[index].shippedAt = now;
        if (additionalData?.trackingNumber) {
          orders[index].shipping.trackingNumber = additionalData.trackingNumber;
        }
      } else if (newStatus === 'delivered') {
        orders[index].deliveredAt = now;
      } else if (newStatus === 'cancelled') {
        orders[index].cancelledAt = now;
      }

      if (additionalData?.notes) {
        orders[index].notes = additionalData.notes;
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));

      // Mock notification
      mockSendNotification(orders[index], newStatus);
    }
  } catch (error) {
    console.error('Failed to update vendor order status:', error);
  }
}

function mockSendNotification(order: VendorOrder, newStatus: VendorOrderStatus): void {
  const messages = {
    confirmed: `Order ${order.orderNumber} has been confirmed and is being processed.`,
    shipped: `Order ${order.orderNumber} has been shipped! Tracking: ${order.shipping.trackingNumber}`,
    delivered: `Order ${order.orderNumber} has been delivered successfully.`,
    cancelled: `Order ${order.orderNumber} has been cancelled.`,
    returned: `Order ${order.orderNumber} return has been initiated.`,
  };

  const message = messages[newStatus as keyof typeof messages];
  if (message) {
    console.log(`📧 Email sent to ${order.customer.email}: ${message}`);
    console.log(`📱 SMS sent to ${order.customer.phone}: ${message}`);
  }
}

export function clearMockOrders(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear mock orders:', error);
  }
}
