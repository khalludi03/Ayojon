import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { useCart, type CartItem } from "@/stores/cart-store";
import { formatPrice } from "@/lib/utils";
import { X } from "lucide-react";

export function CheckoutOrderSummary() {
  const { 
    items, 
    getSubtotal, 
    getShipping, 
    getTax, 
    getTotal,
    getDiscount,
    discount,
    removeCoupon
  } = useCart();

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
          Order Summary
        </h2>
        <Link 
          to="/cart" 
          className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
        >
          Edit Cart
        </Link>
      </div>

      {/* Items List */}
      <div className="mt-4 space-y-3 border-b border-[hsl(var(--border))] pb-4">
        {items.map((item: CartItem) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border border-[hsl(var(--border))]">
              <img
                src={item.product.images[0]?.url || '/placeholder.png'}
                alt={item.product.images[0]?.alt || item.product.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-xs font-semibold text-[hsl(var(--primary-foreground))]">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-[hsl(var(--foreground))] line-clamp-2">
                {item.product.title}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[hsl(var(--foreground))]">
                {formatPrice(item.product.pricing.currentPrice * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="mt-4 space-y-3 border-b border-[hsl(var(--border))] pb-4">
        {/* Items Subtotal */}
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-[hsl(var(--muted-foreground))]">
            Items Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-[hsl(var(--foreground))]">
            {formatPrice(getSubtotal())}
          </span>
        </div>

        {/* Discount */}
        {discount && getDiscount() > 0 && (
          <div className="flex items-center justify-between text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">
                Discount ({discount.code})
              </span>
              <button
                onClick={removeCoupon}
                className="rounded-full p-0.5 hover:bg-[hsl(var(--muted))]"
                aria-label="Remove coupon"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <span className="font-medium text-green-600 dark:text-green-400">
              -{formatPrice(getDiscount())}
            </span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-[hsl(var(--muted-foreground))]">Delivery Fee</span>
          <span className="font-medium text-[hsl(var(--foreground))]">
            {getShipping() === 0 ? (
              <Badge variant="freeShipping" className="font-semibold">FREE</Badge>
            ) : (
              formatPrice(getShipping())
            )}
          </span>
        </div>

        {/* Tax */}
        <div className="flex justify-between text-sm sm:text-base">
          <span className="text-[hsl(var(--muted-foreground))]">Tax (5%)</span>
          <span className="font-medium text-[hsl(var(--foreground))]">
            {formatPrice(getTax())}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="mt-4 flex justify-between items-baseline">
        <span className="text-base font-bold text-[hsl(var(--foreground))] sm:text-lg">
          Grand Total
        </span>
        <span className="text-2xl font-bold text-[hsl(var(--brand-orange))] sm:text-3xl">
          {formatPrice(getTotal())}
        </span>
      </div>

      {/* Trust Badges */}
      <div className="mt-6 space-y-3 border-t border-[hsl(var(--border))] pt-4 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Secure checkout guaranteed</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Free shipping on orders over ৳999</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Easy returns within 7 days</span>
        </div>
      </div>
    </div>
  );
}
