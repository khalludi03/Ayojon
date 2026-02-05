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
    <div className="overflow-hidden rounded-xl border-2 border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--card))]/80 shadow-lg">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white sm:text-xl">
            📋 Order Summary
          </h2>
          <Link 
            to="/cart" 
            className="rounded-md bg-white/20 px-3 py-1.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:shadow-md"
          >
            Edit Cart
          </Link>
        </div>
      </div>
      <div className="p-4 sm:p-6">

        {/* Items List */}
        <div className="space-y-3 border-b-2 border-[hsl(var(--border))] pb-5">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Items ({items.length})</h3>
          <div className="space-y-3">
            {items.map((item: CartItem) => (
              <div key={item.id} className="group flex gap-3 rounded-lg border-2 border-transparent bg-[hsl(var(--muted))]/20 p-2 transition-all hover:border-[hsl(var(--primary))]/30 hover:bg-[hsl(var(--muted))]/40">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 border-[hsl(var(--border))] shadow-sm transition-all group-hover:shadow-md">
                  <img
                    src={item.product.images[0]?.url || '/placeholder.png'}
                    alt={item.product.images[0]?.alt || item.product.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-xs font-bold text-white shadow-md ring-2 ring-[hsl(var(--background))]">
                    {item.quantity}
                  </div>
                </div>
                <div className="flex flex-1 min-w-0 flex-col justify-between py-0.5">
                  <h3 className="text-sm font-semibold leading-snug text-[hsl(var(--foreground))] line-clamp-2">
                    {item.product.title}
                  </h3>
                  <p className="text-base font-bold text-[hsl(var(--brand-orange))]">
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
            <div className="flex items-center justify-between rounded-lg bg-green-50 p-2 text-sm dark:bg-green-950/20 sm:text-base">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  🎉 Discount ({discount.code})
                </span>
                <button
                  onClick={removeCoupon}
                  className="rounded-full p-1 transition-colors hover:bg-green-200 dark:hover:bg-green-900"
                  aria-label="Remove coupon"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <span className="font-bold text-green-600 dark:text-green-400">
                -{formatPrice(getDiscount())}
              </span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-sm sm:text-base">
            <span className="font-medium text-[hsl(var(--muted-foreground))]">Delivery Fee</span>
            <span className="font-bold text-[hsl(var(--foreground))]">
              {getShipping() === 0 ? (
                <Badge variant="freeShipping" className="font-bold shadow-sm">🚚 FREE</Badge>
              ) : (
                formatPrice(getShipping())
              )}
            </span>
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
        <div className="rounded-xl bg-gradient-to-br from-orange-50 to-red-50 p-4 dark:from-orange-950/20 dark:to-red-950/20">
          <div className="flex justify-between items-baseline">
            <span className="text-base font-bold text-[hsl(var(--foreground))] sm:text-lg">
              💰 Grand Total
            </span>
            <span className="text-2xl font-bold text-[hsl(var(--brand-orange))] sm:text-3xl">
              {formatPrice(getTotal())}
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="space-y-2 border-t-2 border-[hsl(var(--border))] pt-5">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Why Shop With Us</h3>
          <div className="space-y-2 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
            <div className="flex items-center gap-2 rounded-md bg-green-50/50 p-2 dark:bg-green-950/10">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">🔒 Secure checkout guaranteed</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-blue-50/50 p-2 dark:bg-blue-950/10">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">🚚 Free shipping on orders over ৳999</span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-purple-50/50 p-2 dark:bg-purple-950/10">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500">
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">↩️ Easy returns within 7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
