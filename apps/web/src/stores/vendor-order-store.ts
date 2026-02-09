import type { VendorOrder, VendorOrderStatus } from '@/types/vendor-order';

const STORAGE_KEY = 'ayojon_vendor_orders_v2';

export function getVendorOrders(vendorId: string): VendorOrder[] {
  if (typeof window === 'undefined') return [];

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
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
