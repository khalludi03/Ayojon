import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Package, MapPin, CreditCard, Truck, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { orpc } from '@/utils/orpc';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { OrderStatusBadge } from '@/components/ui/order-status-badge';

interface OrderDetailModalProps {
  order: any;
  onClose: () => void;
}

const getPaymentMethodLabel = (method: string) => {
  const labels: Record<string, string> = {
    bkash: 'bKash',
    card: 'Card',
    cod: 'Cash on Delivery',
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
  const [trackingNumber, setTrackingNumber] = useState(initialOrder.trackingNumber || '');
  const [showTrackingInput, setShowTrackingInput] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setOrder(initialOrder);
    setTrackingNumber(initialOrder.trackingNumber || '');
  }, [initialOrder]);

  const updateStatus = orpc.vendor.updateOrderStatus.useMutation({
    onSuccess: (updatedOrder: any) => {
      setOrder(updatedOrder);
      toast.success('Order status updated');
      queryClient.invalidateQueries({ queryKey: ['vendor', 'getOrders'] });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error('Failed to update status');
    }
  });

  const vendorSubtotal = (order.items || []).reduce((sum: number, item: any) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleStatusUpdate = (newStatus: any, additionalData?: any) => {
    updateStatus.mutate({
      orderId: order.id,
      status: newStatus,
      ...additionalData,
    });
  };

  const handleConfirmOrder = () => {
    handleStatusUpdate('confirmed');
  };

  const handleMarkAsShipped = () => {
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }
    handleStatusUpdate('shipped', { trackingNumber: trackingNumber.trim() });
  };

  const handleMarkAsDelivered = () => {
    handleStatusUpdate('delivered');
  };

  const isUpdating = updateStatus.isPending;

  const renderActionButtons = () => {
    switch (order.status) {
      case 'pending':
        return (
          <Button onClick={handleConfirmOrder} disabled={isUpdating} className="w-full sm:w-auto">
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Confirm Order
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
                  {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Truck className="h-4 w-4 mr-2" />}
                  Confirm Shipment
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
            {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
            Mark as Delivered
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-[hsl(var(--muted))] rounded-lg">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Current Status</p>
              <div className="mt-1">
                <OrderStatusBadge status={order.status} />
              </div>
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
                  {order.shippingName || order.user?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Phone</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.shippingPhone}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Email</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.user?.email}
                </p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Delivery Address</p>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                  {order.shippingAddressLine1}
                  {order.shippingAddressLine2 && `, ${order.shippingAddressLine2}`}
                  <br />
                  {order.shippingCity}, {order.shippingDivision}{' '}
                  {order.shippingPostalCode}
                </p>
              </div>
              {order.customerNote && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Customer Note</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {order.customerNote}
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
              {(order.items || []).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="h-12 w-12 rounded bg-[hsl(var(--muted))] flex items-center justify-center">
                      <Package className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[hsl(var(--foreground))] truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        Qty: {item.quantity} × ৳{parseFloat(item.price).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    ৳{(item.quantity * parseFloat(item.price)).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-4 pt-4 border-t border-[hsl(var(--border))] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">Vendor Subtotal</span>
                <span className="text-[hsl(var(--foreground))]">
                  ৳{vendorSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-[hsl(var(--border))]">
                <span className="text-[hsl(var(--foreground))]">Total Vendor Revenue</span>
                <span className="text-[hsl(var(--foreground))]">
                  ৳{vendorSubtotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-[hsl(var(--muted-foreground))] italic mt-2">
                * Note: This only shows revenue for your items in this order.
              </p>
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
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Payment Status</p>
                <span
                  className={cn(
                    'inline-flex rounded-full px-2 py-1 text-xs font-semibold',
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : order.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  )}
                >
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
              {order.paymentTransactionId && (
                <div className="sm:col-span-2">
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Transaction ID</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {order.paymentTransactionId}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          {(order.status === 'shipped' || order.status === 'delivered') && (
            <div className="rounded-lg border border-[hsl(var(--border))] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="h-5 w-5 text-[hsl(var(--primary))]" />
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Shipping Information
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Method</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))] uppercase">
                    {order.deliveryMethod || 'Standard'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">Status</p>
                  <p className="text-sm font-medium text-[hsl(var(--foreground))]">
                    {order.status.toUpperCase()}
                  </p>
                </div>
                {order.trackingNumber && (
                  <div className="sm:col-span-2 mt-2 pt-2 border-t border-[hsl(var(--border))]">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Tracking Number</p>
                    <p className="text-sm font-bold text-[hsl(var(--primary))]">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
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