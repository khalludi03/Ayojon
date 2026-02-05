import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, Truck, Calendar } from "lucide-react";

interface ConfirmationStepProps {
  orderDetails: {
    orderNumber: string;
    shipping: {
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      postalCode: string;
    };
    scheduling: {
      deliveryDate: string;
      deliveryTime: string;
    };
    payment: {
      paymentMethod: string;
    };
  };
}

export function ConfirmationStep({ orderDetails }: ConfirmationStepProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'card':
        return 'Credit/Debit Card';
      case 'mobile':
        return 'Mobile Payment';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-green-200 bg-green-50 p-8 text-center dark:border-green-800 dark:bg-green-950/20">
        <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
        <h2 className="mt-4 text-2xl font-bold text-[hsl(var(--foreground))]">
          Order Placed Successfully!
        </h2>
        <p className="mt-2 text-[hsl(var(--muted-foreground))]">
          Thank you for your order. We've sent a confirmation email to{' '}
          <span className="font-medium">{orderDetails.shipping.email}</span>
        </p>
        <div className="mt-4 rounded-md bg-white/80 px-4 py-2 dark:bg-gray-900/80">
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Order Number</p>
          <p className="text-xl font-bold text-[hsl(var(--foreground))]">
            #{orderDetails.orderNumber}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Shipping Information */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h3 className="font-semibold text-[hsl(var(--foreground))]">
              Shipping Address
            </h3>
          </div>
          <div className="mt-4 space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
            <p className="font-medium text-[hsl(var(--foreground))]">
              {orderDetails.shipping.fullName}
            </p>
            <p>{orderDetails.shipping.address}</p>
            <p>
              {orderDetails.shipping.city}
              {orderDetails.shipping.postalCode && `, ${orderDetails.shipping.postalCode}`}
            </p>
            <p className="pt-2">{orderDetails.shipping.phone}</p>
          </div>
        </div>

        {/* Delivery Schedule */}
        <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h3 className="font-semibold text-[hsl(var(--foreground))]">
              Delivery Schedule
            </h3>
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Calendar className="mt-0.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <div>
                <p className="font-medium text-[hsl(var(--foreground))]">
                  {formatDate(orderDetails.scheduling.deliveryDate)}
                </p>
                <p className="text-[hsl(var(--muted-foreground))]">
                  {orderDetails.scheduling.deliveryTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <h3 className="font-semibold text-[hsl(var(--foreground))]">Payment Method</h3>
        <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
          {getPaymentMethodLabel(orderDetails.payment.paymentMethod)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link to="/account" className="flex-1">
          <Button variant="outline" size="lg" className="w-full">
            View Order Details
          </Button>
        </Link>
        <Link to="/" className="flex-1">
          <Button size="lg" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Help Information */}
      <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-6 text-center">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Need help with your order? Contact us at{' '}
          <a 
            href="mailto:support@ayojon.com" 
            className="font-medium text-[hsl(var(--primary))] hover:underline"
          >
            support@ayojon.com
          </a>
          {' or call '}
          <a 
            href="tel:+8801234567890" 
            className="font-medium text-[hsl(var(--primary))] hover:underline"
          >
            +880 1234 567890
          </a>
        </p>
      </div>
    </div>
  );
}
