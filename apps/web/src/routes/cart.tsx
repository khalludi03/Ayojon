import { createFileRoute, Link } from '@tanstack/react-router'
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getSubtotal, getTax, getShipping } = useCart()

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] bg-[hsl(var(--background))]">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[hsl(var(--muted))] sm:h-32 sm:w-32">
              <ShoppingBag className="h-12 w-12 text-[hsl(var(--muted-foreground))] sm:h-16 sm:w-16" />
            </div>
            <h2 className="text-xl font-bold text-[hsl(var(--foreground))] sm:text-2xl">
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
              Add some items to get started!
            </p>
            <Link to="/">
              <Button className="mt-6" size="lg">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="self-start sm:self-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Cart
          </Button>
        </div>

        {/* Cart Layout - Single column on mobile, two columns on desktop */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* Cart Items */}
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:p-4"
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* Product Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))] sm:h-24 sm:w-24">
                    <img
                      src={item.product.images[0]?.url}
                      alt={item.product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    {/* Top Section - Title and Remove Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <Link to={`/product/${item.product.slug}`}>
                          <h3 className="line-clamp-2 text-sm font-medium text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] sm:text-base">
                            {item.product.title}
                          </h3>
                        </Link>
                        <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                          {item.product.category.name}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="shrink-0 rounded-full p-1 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--destructive))]"
                        aria-label="Remove item"
                      >
                        <X className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>

                    {/* Bottom Section - Price and Quantity */}
                    <div className="mt-2 flex items-end justify-between sm:mt-3">
                      {/* Price */}
                      <div>
                        <p className="text-base font-bold text-[hsl(var(--brand-orange))] sm:text-lg">
                          {formatPrice(item.product.pricing.currentPrice)}
                        </p>
                        {item.product.pricing.originalPrice > item.product.pricing.currentPrice && (
                          <p className="text-xs text-[hsl(var(--muted-foreground))] line-through sm:text-sm">
                            {formatPrice(item.product.pricing.originalPrice)}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <span className="min-w-[2rem] text-center text-sm font-medium sm:min-w-[2.5rem] sm:text-base">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 sm:h-8 sm:w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.stock?.quantity || 99)}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal for this item (mobile only) */}
                    <div className="mt-2 flex items-center justify-between border-t border-[hsl(var(--border))] pt-2 sm:hidden">
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">Subtotal:</p>
                      <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                        {formatPrice(item.product.pricing.currentPrice * item.quantity)}
                      </p>
                    </div>
                  </div>

                  {/* Item Subtotal (desktop only) */}
                  <div className="hidden shrink-0 text-right sm:block">
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Subtotal</p>
                    <p className="mt-1 text-lg font-bold text-[hsl(var(--foreground))]">
                      {formatPrice(item.product.pricing.currentPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary - Sticky on desktop */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-6">
              <h2 className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
                Order Summary
              </h2>

              <div className="mt-4 space-y-3 border-b border-[hsl(var(--border))] pb-4 sm:mt-6 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-[hsl(var(--muted-foreground))]">Subtotal</span>
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {formatPrice(getSubtotal())}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-[hsl(var(--muted-foreground))]">Shipping</span>
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {getShipping() === 0 ? 'Free' : formatPrice(getShipping())}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-[hsl(var(--muted-foreground))]">Tax</span>
                  <span className="font-medium text-[hsl(var(--foreground))]">
                    {formatPrice(getTax())}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="text-base font-bold text-[hsl(var(--foreground))] sm:text-lg">
                  Total
                </span>
                <span className="text-xl font-bold text-[hsl(var(--brand-orange))] sm:text-2xl">
                  {formatPrice(getTotal())}
                </span>
              </div>

              <Link to="/checkout">
                <Button className="mt-6 w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>

              <Link to="/">
                <Button variant="outline" className="mt-3 w-full" size="lg">
                  Continue Shopping
                </Button>
              </Link>

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
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
