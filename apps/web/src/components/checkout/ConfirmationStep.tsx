import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  Package, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Home, 
  Building2, 
  Smartphone,
  Info,
  ExternalLink,
  Banknote
} from "lucide-react";

interface ConfirmationStepProps {
  orderDetails: {
    orderId?: string;
    orderNumber: string;
    totalAmount: number;
    shipping: {
      fullName: string;
      email: string;
      phone: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      division: string;
      postalCode: string;
      addressType: 'home' | 'office';
    };
    scheduling: {
    };
    payment: {
      paymentMethod: string;
      transactionId?: string;
    };
  };
}

export function ConfirmationStep({ orderDetails }: ConfirmationStepProps) {
  const isBkash = orderDetails.payment.paymentMethod === 'bkash';
  const hasPaid = !!orderDetails.payment.transactionId;

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bkash':
        return 'bKash';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Success Message */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8 text-center shadow-lg dark:border-green-800 dark:from-green-950/30 dark:via-emerald-950/20 dark:to-teal-950/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.1),transparent_50%)]" />
        <div className="relative">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg animate-in zoom-in-50 duration-500">
            {isBkash && !hasPaid ? (
              <Clock className="h-12 w-12 text-white animate-in zoom-in duration-700" strokeWidth={2.5} />
            ) : (
              <CheckCircle2 className="h-12 w-12 text-white animate-in zoom-in duration-700" strokeWidth={2.5} />
            )}
          </div>
          <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] animate-in fade-in slide-in-from-bottom-4 duration-700">
            {isBkash && !hasPaid ? "Order Placed! Awaiting Payment" : "Order Placed Successfully!"}
          </h2>
          <p className="mt-3 text-base text-[hsl(var(--muted-foreground))] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Thank you for your order! A confirmation email has been sent to{' '}
            <span className="font-semibold text-[hsl(var(--foreground))]">{orderDetails.shipping.email}</span>
          </p>
          <div className="mx-auto mt-6 inline-flex flex-col items-center gap-1 rounded-xl border-2 border-green-300/50 bg-white/90 px-6 py-3 shadow-md dark:border-green-700/50 dark:bg-gray-900/90 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <p className="text-xs font-medium uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Order Number</p>
            <p className="text-2xl font-bold text-[hsl(var(--foreground))]">
              #{orderDetails.orderNumber}
            </p>
          </div>
        </div>
      </div>

      {/* bKash Payment Instructions */}
      {isBkash && !hasPaid && (
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900/30 dark:bg-indigo-950/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 shadow-md">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100">
              How to complete your bKash payment
            </h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Send Payment To</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">01700-000000</p>
                <p className="text-xs text-slate-500 mt-1">(Ayojon Merchant Account)</p>
              </div>
              
              <div className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-indigo-100 dark:border-indigo-800">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount to Pay</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">৳{(orderDetails.totalAmount || 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="font-bold text-indigo-900 dark:text-indigo-100">Steps:</p>
              <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">1</span>
                  <span>Open your bKash app or dial *247#</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">2</span>
                  <span>Choose <strong>"Send Money"</strong> and enter the number above</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">3</span>
                  <span>Enter the total amount and your PIN</span>
                </li>
                <li className="flex gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">4</span>
                  <span>After success, go to <strong>"Order Details"</strong> to submit the Transaction ID</span>
                </li>
              </ul>
              <div className="pt-2">
                <div className="flex items-start gap-2 bg-white/50 dark:bg-slate-900/50 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <Info className="h-4 w-4 text-indigo-600 mt-0.5" />
                  <p className="text-xs text-indigo-900 dark:text-indigo-200">
                    Your order will be processed immediately after our team verifies your payment details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What's Next Section */}
      <div className="rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-6">
        <h3 className="mb-4 text-lg font-bold text-[hsl(var(--foreground))]">What happens next</h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-white">1</div>
            <div className="flex-1">
              <p className="font-semibold text-[hsl(var(--foreground))]">Order Confirmation</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">You'll receive an email with your order details</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-white">2</div>
            <div className="flex-1">
              <p className="font-semibold text-[hsl(var(--foreground))]">Processing & Packing</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">We'll carefully prepare your items for delivery</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-sm font-bold text-white">3</div>
            <div className="flex-1">
              <p className="font-semibold text-[hsl(var(--foreground))]">On the Way</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Track your delivery via SMS and email updates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Shipping Information */}
        <div className="group rounded-xl border-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card))]/80 p-6 shadow-sm transition-all hover:border-[hsl(var(--primary))]/50 hover:shadow-md">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-md">
              <Package className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
              Shipping Address
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-[hsl(var(--muted))]/30 p-3">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--background))]">
                {orderDetails.shipping.addressType === 'home' ? (
                  <Home className="h-4 w-4 text-[hsl(var(--primary))]" />
                ) : (
                  <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-bold text-[hsl(var(--foreground))]">
                  {orderDetails.shipping.fullName}
                </p>
                <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {orderDetails.shipping.addressType === 'home' ? 'Home' : 'Office'} Address
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <div className="space-y-0.5">
                  <p className="text-[hsl(var(--foreground))]">{orderDetails.shipping.addressLine1}</p>
                  {orderDetails.shipping.addressLine2 && (
                    <p className="text-[hsl(var(--foreground))]">{orderDetails.shipping.addressLine2}</p>
                  )}
                  <p className="font-medium text-[hsl(var(--foreground))]">
                    {orderDetails.shipping.city}, {orderDetails.shipping.division}
                    {orderDetails.shipping.postalCode && ` - ${orderDetails.shipping.postalCode}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <p className="font-medium text-[hsl(var(--foreground))]">{orderDetails.shipping.phone}</p>
              </div>
              <div className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--muted-foreground))]" />
                <p className="font-medium text-[hsl(var(--foreground))]">{orderDetails.shipping.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-6">
          <div className="group rounded-xl border-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card))]/80 p-6 shadow-sm transition-all hover:border-[hsl(var(--primary))]/50 hover:shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-md">
                <Banknote className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-bold text-[hsl(var(--foreground))]">
                Payment Method
              </h3>
            </div>
            <div className="rounded-lg bg-[hsl(var(--muted))]/30 px-4 py-3">
              <p className="text-base font-semibold text-[hsl(var(--foreground))]">
                {getPaymentMethodLabel(orderDetails.payment.paymentMethod)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {orderDetails.orderId ? (
          <Link to="/account/orders/$orderId" params={{ orderId: orderDetails.orderId }} className="flex-1">
            <Button 
              variant="outline" 
              size="lg" 
              className="group w-full border-2 font-semibold transition-all hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5"
            >
              <Package className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              View Order Details
            </Button>
          </Link>
        ) : (
          <Link to="/account/orders" className="flex-1">
            <Button 
              variant="outline" 
              size="lg" 
              className="group w-full border-2 font-semibold transition-all hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5"
            >
              <Package className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              View Order Details
            </Button>
          </Link>
        )}
        <Link to="/" className="flex-1">
          <Button 
            size="lg" 
            className="group w-full bg-gradient-to-r from-orange-500 to-red-500 font-semibold shadow-md transition-all hover:shadow-lg"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>

      {/* Help Information */}
      <div className="rounded-xl border-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--muted))]/20 to-[hsl(var(--muted))]/10 p-6">
        <div className="text-center">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Need Help?</h4>
          <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
            Our customer support team is here to assist you with your order
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            <a 
              href="mailto:support@ayojon.com" 
              className="group flex items-center gap-2 rounded-lg bg-[hsl(var(--background))] px-4 py-2 font-medium text-[hsl(var(--primary))] transition-all hover:bg-[hsl(var(--primary))] hover:text-white hover:shadow-md"
            >
              <Mail className="h-4 w-4" />
              support@ayojon.com
            </a>
            <a 
              href="tel:+8801234567890" 
              className="group flex items-center gap-2 rounded-lg bg-[hsl(var(--background))] px-4 py-2 font-medium text-[hsl(var(--primary))] transition-all hover:bg-[hsl(var(--primary))] hover:text-white hover:shadow-md"
            >
              <Phone className="h-4 w-4" />
              +880 1234 567890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
