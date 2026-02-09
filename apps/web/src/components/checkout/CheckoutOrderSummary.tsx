import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useCart, type CartItem } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Check, Clock, Package, X, Zap, ShoppingBag, Truck, Shield, RotateCcw, Tag } from "lucide-react";

export function CheckoutOrderSummary() {
  const { 
    items, 
    itemCount,
    deliveryMethod,
    getSubtotal, 
    getShipping, 
    getTax, 
    getTotal,
    getDiscount,
    discount,
    removeCoupon
  } = useCart();

  const getDeliveryMethodDisplay = () => {
    if (!deliveryMethod) return null;
    
    switch (deliveryMethod) {
      case 'standard':
        return { name: 'Standard Delivery', icon: Package, duration: '3-5 days' };
      case 'express':
        return { name: 'Express Delivery', icon: Zap, duration: '1-2 days' };
      case 'same-day':
        return { name: 'Same-Day Delivery', icon: Clock, duration: 'Today' };
      default:
        return null;
    }
  };

  return (
    <div className="sticky top-4 overflow-hidden rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
      {/* Header */}
      <div className="border-b-2 border-[hsl(var(--border))] bg-gradient-to-r from-[hsl(var(--muted))]/40 to-[hsl(var(--muted))]/20 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[hsl(var(--primary))] sm:h-6 sm:w-6" />
            <h2 className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
              Order Summary
            </h2>
          </div>
          <Link
            to="/cart"
            className="group rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm font-semibold text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5 hover:shadow-sm"
          >
            <span className="group-hover:underline">Edit Cart</span>
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6">

        {/* Items List */}
        <div className="space-y-4 border-b-2 border-[hsl(var(--border))] pb-6">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-[hsl(var(--primary))]" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-[hsl(var(--foreground))]">
              Items ({itemCount})
            </h3>
          </div>
          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[hsl(var(--border))]">
            {items.map((item: CartItem) => (
              <div
                key={item.id}
                className="group flex gap-3 rounded-lg border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--muted))]/10 p-3 transition-all hover:border-[hsl(var(--primary))]/50 hover:shadow-md"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-sm transition-all group-hover:shadow-md sm:h-24 sm:w-24">
                  <img
                    src={item.product.images[0]?.url || '/placeholder.png'}
                    alt={item.product.images[0]?.alt || item.product.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 min-w-0 flex-col justify-between gap-2">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold leading-tight text-[hsl(var(--foreground))] line-clamp-2 sm:text-base">
                      {item.product.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(var(--primary))]/10 px-2.5 py-1 text-xs font-semibold text-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary))]/20">
                        <Package className="h-3 w-3" />
                        {item.quantity}
                      </span>
                      <span className="text-xs text-[hsl(var(--muted-foreground))]">
                        × {formatPrice(item.product.pricing.currentPrice)}
                      </span>
                    </div>
                  </div>
                  <p className="text-base font-bold text-[hsl(var(--foreground))] sm:text-lg">
                    {formatPrice(item.product.pricing.currentPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3.5 border-b-2 border-[hsl(var(--border))] pb-6 pt-2">
          {/* Items Subtotal */}
          <div className="flex justify-between items-center text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <span className="font-medium text-[hsl(var(--muted-foreground))]">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
              </span>
            </div>
            <span className="font-bold text-[hsl(var(--foreground))]">
              {formatPrice(getSubtotal())}
            </span>
          </div>

          {/* Discount */}
          {discount && getDiscount() > 0 && (
            <div className="flex items-center justify-between rounded-lg border-2 border-green-500/30 bg-gradient-to-r from-green-50 to-green-100/50 p-3 shadow-sm dark:border-green-900/40 dark:from-green-950/30 dark:to-green-950/20">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Discount ({discount.code})
                </span>
                <button
                  onClick={removeCoupon}
                  className="ml-1 rounded-full p-1 transition-all hover:bg-green-200/80 dark:hover:bg-green-900/60"
                  aria-label="Remove coupon"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="font-bold text-green-700 dark:text-green-300">
                -{formatPrice(getDiscount())}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <span className="font-medium text-[hsl(var(--muted-foreground))]">
                  {getDeliveryMethodDisplay() ? getDeliveryMethodDisplay()!.name : 'Delivery Fee'}
                </span>
              </div>
              <span className="font-bold text-[hsl(var(--foreground))]">
                {getShipping() === 0 ? (
                  <Badge variant="freeShipping" className="font-bold shadow-sm">🚚 FREE</Badge>
                ) : (
                  formatPrice(getShipping())
                )}
              </span>
            </div>
            {deliveryMethod && getDeliveryMethodDisplay() && (
              <div className="flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-2 text-xs font-medium text-[hsl(var(--foreground))]">
                {(() => {
                  const Icon = getDeliveryMethodDisplay()!.icon;
                  return <Icon className="h-3.5 w-3.5" />;
                })()}
                <span>Estimated delivery: {getDeliveryMethodDisplay()!.duration}</span>
              </div>
            )}
          </div>

          {/* Tax */}
          <div className="flex justify-between items-center text-sm sm:text-base">
            <span className="font-medium text-[hsl(var(--muted-foreground))]">Tax (5%)</span>
            <span className="font-bold text-[hsl(var(--foreground))]">
              {formatPrice(getTax())}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-gradient-to-br from-[hsl(var(--primary))]/5 to-[hsl(var(--primary))]/10 p-5 ring-2 ring-[hsl(var(--primary))]/20 sm:p-6">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Grand Total
              </span>
              <p className="text-base font-bold text-[hsl(var(--foreground))] sm:text-lg">
                You Pay
              </p>
            </div>
            <div className="text-right">
              <span className="block text-3xl font-bold text-[hsl(var(--primary))] sm:text-4xl">
                {formatPrice(getTotal())}
              </span>
              {discount && getDiscount() > 0 && (
                <span className="mt-1 inline-block text-xs font-medium text-green-600 dark:text-green-400">
                  You saved {formatPrice(getDiscount())}!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="space-y-4 border-t-2 border-[hsl(var(--border))] pt-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[hsl(var(--primary))]" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-[hsl(var(--foreground))]">
              Why Shop With Us
            </h3>
          </div>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 rounded-lg bg-[hsl(var(--muted))]/30 p-3 transition-all hover:bg-[hsl(var(--muted))]/50">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/50">
                <Shield className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Secure Checkout
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Your payment information is protected
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-[hsl(var(--muted))]/30 p-3 transition-all hover:bg-[hsl(var(--muted))]/50">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950/50">
                <Truck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Free Delivery
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  On orders over ৳1000
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-[hsl(var(--muted))]/30 p-3 transition-all hover:bg-[hsl(var(--muted))]/50">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950/50">
                <RotateCcw className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Easy Returns
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  7-day hassle-free return policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
