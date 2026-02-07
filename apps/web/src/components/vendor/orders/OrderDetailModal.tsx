import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Package, MapPin, CreditCard, Truck, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VendorOrder, VendorOrderStatus } from '@/types/vendor-order';
import { updateVendorOrderStatus } from '@/stores/vendor-order-store';

interface OrderDetailModalProps {
  order: VendorOrder;
  onClose: () => void;
}

const getStatusColor = (status: VendorOrderStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'shipped':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'delivered':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    case 'returned':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    bkash: 'bKash',
    card: 'Card',
    cod: 'Cash on Delivery',
    bank: 'Bank Transfer',
  };
  return labels[method] || method;
};

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function OrderDetailModal({ order: initialOrder, onClose }: OrderDetailModalProps) {
  const [order, setOrder] = useState(initialOrder);
  const [trackingNumber, setTrackingNumber] = useState(order.shipping.trackingNumber || '');
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const handleStatusUpdate = (newStatus: VendorOrderStatus, additionalData?: any) => {
    setIsUpdating(true);

    // Simulate API call
    setTimeout(() => {
      updateVendorOrderStatus(order.id, newStatus, additionalData);

      // Update local state
      const updatedOrder = {
        ...order,
        status: newStatus,
        ...(newStatus === 'shipped' && additionalData?.trackingNumber
          ? {
              shipping: {
                ...order.shipping,
                trackingNumber: additionalData.trackingNumber,
              },
            }
          : {}),
      };
      setOrder(updatedOrder);

      setIsUpdating(false);
      setShowNotification(true);
      setShowTrackingInput(false);

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }, 500);
  };

  const handleConfirmOrder = () => {
    handleStatusUpdate('confirmed');
  };

  const handleMarkAsShipped = () => {
    if (!trackingNumber.trim()) {
      alert('Please enter a tracking number');
      return;
    }
    handleStatusUpdate('shipped', { trackingNumber: trackingNumber.trim() });
  };

  const handleMarkAsDelivered = () => {
    handleStatusUpdate('delivered');
  };

  const renderActionButtons = () => {
    switch (order.status) {
      case 'pending':
        return (
          <Button onClick={handleConfirmOrder} disabled={isUpdating} className="w-full sm:w-auto">
            <Check className="h-4 w-4 mr-2" />
            {isUpdating ? 'Updating...' : 'Confirm Order'}
          </Button>
        );

      case 'confirmed':
        if (showTrackingInput) {
          return (
            <div className="space-y-3 w-full">
              <div>
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleMarkAsShipped} disabled={isUpdating} className="flex-1">
                  <Truck className="h-4 w-4 mr-2" />
                  {isUpdating ? 'Updating...' : 'Confirm Shipment'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowTrackingInput(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          );
        }
        return (
          <Button
            onClick={() => setShowTrackingInput(true)}
            disabled={isUpdating}
            className="w-full sm:w-auto"
          >
            <Truck className="h-4 w-4 mr-2" />
            Mark as Shipped
          </Button>
        );

      case 'shipped':
        return (
          <Button onClick={handleMarkAsDelivered} disabled={isUpdating} className="w-full sm:w-auto">
            <Check className="h-4 w-4 mr-2" />
            {isUpdating ? 'Updating...' : 'Mark as Delivered'}
          </Button>
        );

      case 'delivered':
      case 'cancelled':
      case 'returned':
        return (
          <div className="text-sm text-[hsl(var(--muted-foreground))] text-center p-4 bg-[hsl(var(--muted))] rounded">
            Order is {order.status}. No further actions available.
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-[hsl(var(--card))] rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">Order Details</h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Notification */}
        {showNotification && (
          <div className="mx-6 mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
            <Check className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-400">
                Order status updated successfully!
              </p>
              <p className="text-xs text-green-700 dark:text-green-500 mt-1">
                Customer has been notified via email and SMS
              </p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-lg">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Status</p>
              <span
                className={cn(
                  'inline-flex rounded-full px-3 py-1 text-sm font-semibold mt-1',
                  getStatusColor(order.status)
                )}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Order Date</p>
              <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Customer Information
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Name</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.customer.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Phone</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.customer.phone}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Email</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.customer.email}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Delivery Address</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.customer.address.addressLine1}
                  {order.customer.address.addressLine2 && `, ${order.customer.address.addressLine2}`}
                  <br />
                  {order.customer.address.city}, {order.customer.address.division}{' '}
                  {order.customer.address.postalCode}
                </p>
              </div>
              {order.deliveryInstructions && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Delivery Instructions</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {order.deliveryInstructions}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Items Ordered */}
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">Items Ordered</h3>
            </div>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3 flex-1">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="h-12 w-12 rounded object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded bg-[hsl(var(--muted))] flex items-center justify-center">
                        <Package className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                        {item.productName}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Qty: {item.quantity} × ৳{item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    ৳{(item.quantity * item.price).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                <span className="text-[hsl(var(--foreground))]">
                  ৳{order.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Shipping</span>
                <span className="text-[hsl(var(--foreground))]">
                  ৳{order.shippingCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Tax</span>
                <span className="text-[hsl(var(--foreground))]">৳{order.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-[hsl(var(--border))]">
                <span className="text-[hsl(var(--foreground))]">Total</span>
                <span className="text-[hsl(var(--foreground))]">
                  ৳{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-5 w-5 text-[hsl(var(--primary))]" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                Payment Information
              </h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Payment Method</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {getPaymentMethodLabel(order.payment.method)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Payment Status</p>
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                    order.payment.status === 'paid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : order.payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  )}
                >
                  {order.payment.status === 'paid'
                    ? 'Paid'
                    : order.payment.status === 'pending'
                      ? 'Pending'
                      : 'Failed'}
                </span>
              </div>
              {order.payment.transactionId && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Transaction ID</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {order.payment.transactionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          {(order.status === 'shipped' || order.status === 'delivered') && order.shipping.trackingNumber && (
            <div className="rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Shipping Information
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Tracking Number</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {order.shipping.trackingNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Shipped At</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {formatDate(order.shippedAt)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="rounded-lg border border-[hsl(var(--border))] p-4">
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Actions</h3>
            {renderActionButtons()}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] p-6 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
