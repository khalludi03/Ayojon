import { useState, useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useCart, type CartItem } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { productService } from '@/mock/services/product-service'
import type { Product } from '@/types'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartItemRow({ item, updateQuantity, onRemove }: {
  item: CartItem
  updateQuantity: (itemId: string, quantity: number) => void
  onRemove: (item: CartItem) => void
}) {
  const [inputValue, setInputValue] = useState(item.quantity.toString())
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    setInputValue(item.quantity.toString())
  }, [item.quantity])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || /^\d+$/.test(value)) {
      setInputValue(value)
    }
  }

  const handleBlur = () => {
    const numValue = parseInt(inputValue, 10)
    if (inputValue === '' || isNaN(numValue) || numValue < 1) {
      setInputValue('1')
      updateQuantity(item.id, 1)
    } else if (numValue > item.product.stock) {
      setInputValue(item.product.stock.toString())
      updateQuantity(item.id, item.product.stock)
    } else {
      setInputValue(numValue.toString())
      updateQuantity(item.id, numValue)
    }
  }

  const handleUpdate = () => {
    const numValue = parseInt(inputValue, 10)
    if (!isNaN(numValue) && numValue >= 1) {
      setIsUpdating(true)
      updateQuantity(item.id, Math.min(numValue, item.product.stock))
      setTimeout(() => setIsUpdating(false), 600)
    }
  }

  const showUpdate = isUpdating || (inputValue !== '' && parseInt(inputValue, 10) !== item.quantity && !isNaN(parseInt(inputValue, 10)))

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        {/* Product Image — clickable to PDP */}
        <Link to={`/product/${item.product.slug}`} className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))] sm:h-24 sm:w-24">
          <img
            src={item.product.images[0]?.url}
            alt={item.product.title}
            className="h-full w-full object-cover"
          />
        </Link>

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
                by {item.product.vendor.name}
              </p>
            </div>
            <button
              onClick={() => onRemove(item)}
              className="shrink-0 rounded-full p-1 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--destructive))]"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1 sm:gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1 || isUpdating}
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isUpdating}
                  aria-label="Quantity"
                  className="min-w-[2rem] w-10 text-center text-sm font-medium sm:min-w-[2.5rem] sm:w-12 sm:text-base border border-[hsl(var(--border))] rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] py-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock || isUpdating}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              {showUpdate && (
                <Button size="sm" className="h-6 px-3 text-xs" onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating ? (
                    <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Updating...</>
                  ) : (
                    'Update'
                  )}
                </Button>
              )}
              {item.quantity >= item.product.stock && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Only {item.product.stock} left in stock
                </p>
              )}
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
  )
}

function CartPage() {
  const { items, updateQuantity, removeItem, restoreItem, clearCart, getTotal, getSubtotal, getTax, getShipping } = useCart()
  const [clearConfirm, setClearConfirm] = useState(false)
  const [pendingRemoveItem, setPendingRemoveItem] = useState<CartItem | null>(null)

  const handleConfirmRemove = () => {
    if (!pendingRemoveItem) return;
    const removedItem = pendingRemoveItem;
    removeItem(removedItem.id);
    setPendingRemoveItem(null);
    const toastId = toast.success('Removed from cart', {
      duration: 5000,
      action: {
        label: 'Undo',
        onClick: () => {
          restoreItem(removedItem);
          toast.dismiss(toastId);
        },
      },
    });
  };
  const [suggested, setSuggested] = useState<Product[]>([])

  useEffect(() => {
    if (items.length === 0) {
      productService.getFeaturedProducts(8).then(setSuggested)
    }
  }, [items.length])

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

          {/* Suggested Products */}
          {suggested.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-4 text-center text-lg font-semibold text-[hsl(var(--foreground))] sm:text-xl">
                You might like
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                {suggested.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-6 pb-32 sm:py-8 lg:py-10 lg:pb-0">
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
          {!clearConfirm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClearConfirm(true)}
              className="self-start sm:self-auto"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-sm text-[hsl(var(--foreground))]">Are you sure?</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setClearConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  clearCart()
                  setClearConfirm(false)
                }}
              >
                Yes, Clear
              </Button>
            </div>
          )}
        </div>

        {/* Cart Layout - Single column on mobile, two columns on desktop */}
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-8">
          {/* Cart Items */}
          <div className="space-y-3 sm:space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                updateQuantity={updateQuantity}
                onRemove={(item) => setPendingRemoveItem(item)}
              />
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
                    {getShipping() === 0 ? (
                      <Badge variant="freeShipping">Free</Badge>
                    ) : (
                      formatPrice(getShipping())
                    )}
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

      {/* Mobile sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg lg:hidden">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </span>
              <span className="text-base font-bold text-[hsl(var(--foreground))]">
                {formatPrice(getTotal())}
              </span>
            </div>
            <Link to="/checkout" className="flex-1 max-w-xs">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={pendingRemoveItem !== null} onOpenChange={(open) => { if (!open) setPendingRemoveItem(null); }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Remove item</DialogTitle>
            <DialogDescription>Remove &quot;{pendingRemoveItem?.product.title}&quot; from your cart?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleConfirmRemove}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CartPage
