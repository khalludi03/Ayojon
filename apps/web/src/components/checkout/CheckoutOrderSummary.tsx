import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useCart, type CartItem } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { Check, Clock, Package, X, Zap } from "lucide-react";

export function CheckoutOrderSummary() {
  const { 
    items, 
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
    <div className="overflow-hidden rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
            Order Summary
          </h2>
          <Link 
            to="/cart" 
            className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-1.5 text-sm font-semibold text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--primary))]/50 hover:bg-[hsl(var(--muted))]/40"
          >
            Edit Cart
          </Link>
        </div>
      </div>
      <div className="p-4 sm:p-6">

        {/* Items List */}
        <div className="space-y-3 border-b-2 border-[hsl(var(--border))] pb-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Items ({items.length})</h3>
          <div className="space-y-3">
            {items.map((item: CartItem) => (
              <div key={item.id} className="group flex gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-2 transition-all hover:border-[hsl(var(--primary))]/30">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-[hsl(var(--border))] shadow-sm transition-all group-hover:shadow-md">
                  <img
                    src={item.product.images[0]?.url || '/placeholder.png'}
                    alt={item.product.images[0]?.alt || item.product.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-md ring-2 ring-[hsl(var(--background))]">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex flex-1 min-w-0 flex-col justify-between py-0.5">
                  <h3 className="text-sm font-semibold leading-snug text-[hsl(var(--foreground))] line-clamp-2">
                    {item.product.title}
                  </h3>
                  <p className="text-base font-bold text-[hsl(var(--foreground))]">
                    {formatPrice(item.product.pricing.currentPrice * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 border-b-2 border-[hsl(var(--border))] pb-5">
          {/* Items Subtotal */}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="font-medium text-[hsl(var(--muted-foreground))]">
              Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
            <span className="font-bold text-[hsl(var(--foreground))]">
              {formatPrice(getSubtotal())}
            </span>
          </div>

          {/* Discount */}
          {discount && getDiscount() > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-2 text-sm dark:border-green-900/40 dark:bg-green-950/20 sm:text-base">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-700 dark:text-green-300">
                  Discount ({discount.code})
                </span>
                <button
                  onClick={removeCoupon}
                  className="rounded-full p-1 transition-colors hover:bg-green-200 dark:hover:bg-green-900"
                  aria-label="Remove coupon"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="font-bold text-green-700 dark:text-green-300">
                -{formatPrice(getDiscount())}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm sm:text-base">
              <span className="font-medium text-[hsl(var(--muted-foreground))]">
                {getDeliveryMethodDisplay() ? getDeliveryMethodDisplay()!.name : 'Delivery Fee'}
              </span>
              <span className="font-bold text-[hsl(var(--foreground))]">
                {getShipping() === 0 ? (
                  <Badge variant="freeShipping" className="font-bold shadow-sm">🚚 FREE</Badge>
                ) : (
                  formatPrice(getShipping())
                )}
              </span>
            </div>
            {deliveryMethod && getDeliveryMethodDisplay() && (
              <div className="flex items-center gap-2 rounded-md bg-[hsl(var(--muted))]/30 px-2 py-1.5 text-xs text-[hsl(var(--muted-foreground))]">
                {(() => {
                  const Icon = getDeliveryMethodDisplay()!.icon;
                  return <Icon className="h-3 w-3" />;
                })()}
                <span>{getDeliveryMethodDisplay()!.duration}</span>
              </div>
            )}
          </div>

          {/* Tax */}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="font-medium text-[hsl(var(--muted-foreground))]">Tax (5%)</span>
            <span className="font-bold text-[hsl(var(--foreground))]">
              {formatPrice(getTax())}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-xl bg-[hsl(var(--muted))]/25 p-4">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-[hsl(var(--foreground))] sm:text-lg">
              Grand Total
            </span>
            <span className="text-2xl font-bold text-[hsl(var(--brand-orange))] sm:text-3xl">
              {formatPrice(getTotal())}
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="space-y-3 border-t-2 border-[hsl(var(--border))] pt-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Why Shop With Us</h3>
          <div className="space-y-2 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium">Secure checkout guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium">Free standard delivery on orders over ৳1000</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium">Easy returns within 7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
