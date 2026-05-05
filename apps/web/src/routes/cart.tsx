import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Product } from '@/types'
import type { CartItem } from '@/stores/cart-store'
import { useCart } from '@/stores/cart-store'
import {
  CartRemoveConfirmDialog,
  useCartItemRemoval,
} from '@/hooks/use-cart-item-removal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { orpcClient } from '@/utils/orpc'
import { CouponSection } from '@/components/cart/CouponSection'
import { authClient } from '@/lib/auth-client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import SignInForm from '@/components/sign-in-form'
import SignUpForm from '@/components/sign-up-form'

export const Route = createFileRoute('/cart')({
  component: CartPage,
})

function CartItemRow({
  item,
  updateQuantity,
  onRemove,
  onSaveForLater,
}: {
  item: CartItem
  updateQuantity: (itemId: string, quantity: number) => void
  onRemove: (item: CartItem) => void
  onSaveForLater: (itemId: string) => void
}) {
  const [inputValue, setInputValue] = useState(item.quantity.toString())

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
      updateQuantity(item.id, Math.min(numValue, item.product.stock))
    }
  }

  const showUpdate =
    inputValue !== '' &&
    parseInt(inputValue, 10) !== item.quantity &&
    !isNaN(parseInt(inputValue, 10))

  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        {/* Product Image — clickable to PDP */}
        <Link
          to={`/product/${item.product.slug}`}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))] sm:h-24 sm:w-24"
        >
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
                by{' '}
                <Link
                  to="/vendor/$vendorId"
                  params={{ vendorId: item.product.vendor.id }}
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {item.product.vendor.name}
                </Link>
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
              {item.product.pricing.originalPrice >
                item.product.pricing.currentPrice && (
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
                  onClick={() =>
                    updateQuantity(item.id, Math.max(1, item.quantity - 1))
                  }
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-label="Quantity"
                  className="min-w-[2rem] w-10 text-center text-sm font-medium sm:min-w-[2.5rem] sm:w-12 sm:text-base border border-[hsl(var(--border))] rounded bg-transparent focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] py-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock}
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
              {showUpdate && (
                <Button
                  size="sm"
                  className="h-6 px-3 text-xs"
                  onClick={handleUpdate}
                >
                  Update
                </Button>
              )}
              {item.quantity >= item.product.stock && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Only {item.product.stock} left in stock
                </p>
              )}
            </div>
          </div>

          {/* Save for Later Link */}
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => onSaveForLater(item.id)}
              className="text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:underline sm:text-sm"
            >
              Save for Later
            </button>
          </div>

          {/* Subtotal for this item (mobile only) */}
          <div className="mt-2 flex items-center justify-between border-t border-[hsl(var(--border))] pt-2 sm:hidden">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Subtotal:
            </p>
            <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
              {formatPrice(item.product.pricing.currentPrice * item.quantity)}
            </p>
          </div>
        </div>

        {/* Item Subtotal (desktop only) */}
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Subtotal
          </p>
          <p className="mt-1 text-lg font-bold text-[hsl(var(--foreground))]">
            {formatPrice(item.product.pricing.currentPrice * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  )
}

function SavedForLaterItemRow({
  item,
  onMoveToCart,
  onRemove,
}: {
  item: CartItem
  onMoveToCart: (itemId: string) => void
  onRemove: (itemId: string) => void
}) {
  return (
    <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 sm:p-4">
      <div className="flex gap-3 sm:gap-4">
        {/* Product Image — clickable to PDP */}
        <Link
          to={`/product/${item.product.slug}`}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))] sm:h-24 sm:w-24"
        >
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
                by{' '}
                <Link
                  to="/vendor/$vendorId"
                  params={{ vendorId: item.product.vendor.id }}
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {item.product.vendor.name}
                </Link>
              </p>
            </div>
            <button
              onClick={() => onRemove(item.id)}
              className="shrink-0 rounded-full p-1 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--destructive))]"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Bottom Section - Price and Actions */}
          <div className="mt-2 flex items-end justify-between">
            {/* Price */}
            <div>
              <p className="text-base font-bold text-[hsl(var(--brand-orange))] sm:text-lg">
                {formatPrice(item.product.pricing.currentPrice)}
              </p>
              {item.product.pricing.originalPrice >
                item.product.pricing.currentPrice && (
                <p className="text-xs text-[hsl(var(--muted-foreground))] line-through sm:text-sm">
                  {formatPrice(item.product.pricing.originalPrice)}
                </p>
              )}
            </div>

            {/* Move to Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMoveToCart(item.id)}
              className="h-8"
            >
              Move to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartPage() {
  const {
    items,
    savedForLater,
    discount,
    updateQuantity,
    saveForLater,
    moveToCart,
    removeSavedItem,
    clearCart,
    subtotal,
    tax,
    shipping,
    discountAmount,
    total,
  } = useCart()
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const { pendingRemoveItem, setPendingRemoveItem, handleConfirmRemove } =
    useCartItemRemoval()
  const [clearConfirm, setClearConfirm] = useState(false)
  const [suggested, setSuggested] = useState<Array<Product>>([])
  const [mounted, setMounted] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCheckout = () => {
    if (session?.user) {
      navigate({ to: '/checkout' })
    } else {
      setShowLoginDialog(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowLoginDialog(false)
    toast.success('Welcome back! Proceeding to checkout...')
    setTimeout(() => {
      navigate({ to: '/checkout' })
    }, 500)
  }

  useEffect(() => {
    if (items.length === 0) {
      orpcClient.product
        .getProducts({ featured: true, limit: 8 })
        .then((res: any) => setSuggested(res.data))
    }
  }, [items.length])

  if (!mounted) {
    return null
  }

  if (items.length === 0 && savedForLater.length === 0) {
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
              {items.length} {items.length === 1 ? 'item' : 'items'} in your
              cart
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
              <span className="text-sm text-[hsl(var(--foreground))]">
                Are you sure?
              </span>
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
          <div className="space-y-6">
            {items.length > 0 && (
              <div className="space-y-3 sm:space-y-4">
                {items.map((cartItem) => (
                  <CartItemRow
                    key={cartItem.id}
                    item={cartItem}
                    updateQuantity={updateQuantity}
                    onRemove={(item) => setPendingRemoveItem(item)}
                    onSaveForLater={(itemId) => {
                      saveForLater(itemId)
                      toast.success('Item saved for later')
                    }}
                  />
                ))}
              </div>
            )}

            {/* Empty cart message when cart is empty but saved items exist */}
            {items.length === 0 && savedForLater.length > 0 && (
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                    <ShoppingBag className="h-8 w-8 text-[hsl(var(--muted-foreground))]" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Your cart is empty
                </h3>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  Add some items to get started!
                </p>
                <Link to="/">
                  <Button className="mt-4" variant="outline">
                    Continue Shopping
                  </Button>
                </Link>
              </div>
            )}

            {/* Saved for Later Section */}
            {savedForLater.length > 0 && (
              <div
                className={
                  items.length > 0
                    ? 'mt-8 border-t border-[hsl(var(--border))] pt-6'
                    : ''
                }
              >
                <h2 className="mb-4 text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
                  Saved for Later ({savedForLater.length})
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {savedForLater.map((item) => (
                    <SavedForLaterItemRow
                      key={item.id}
                      item={item}
                      onMoveToCart={(itemId) => {
                        moveToCart(itemId)
                        toast.success('Item moved to cart')
                      }}
                      onRemove={(itemId) => {
                        removeSavedItem(itemId)
                        toast.success('Item removed')
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary - Sticky on desktop - Only show when cart has items */}
          {items.length > 0 && (
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-6">
                <h2 className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
                  Order Summary
                </h2>

                {/* Coupon Section */}
                <CouponSection />

                <div className="mt-4 space-y-3 border-b border-[hsl(var(--border))] pb-4 sm:mt-6 sm:space-y-4">
                  {/* Items Subtotal */}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Items Subtotal ({items.length}{' '}
                      {items.length === 1 ? 'item' : 'items'})
                    </span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {/* Discount */}
                  {discount && (
                    <div className="flex items-center justify-between text-sm sm:text-base">
                      <span className="text-green-600 dark:text-green-400">
                        Discount ({discount.code})
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {discount.type === 'free_shipping'
                          ? 'FREE Delivery'
                          : `-${formatPrice(discountAmount)}`}
                      </span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Delivery Fee
                    </span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {shipping === 0 ? (
                        <Badge variant="freeShipping" className="font-semibold">
                          FREE
                        </Badge>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>

                  {/* Tax */}
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-[hsl(var(--muted-foreground))]">
                      Tax (5%)
                    </span>
                    <span className="font-medium text-[hsl(var(--foreground))]">
                      {formatPrice(tax)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-baseline">
                  <span className="text-base font-bold text-[hsl(var(--foreground))] sm:text-lg">
                    Grand Total
                  </span>
                  <span className="text-2xl font-bold text-[hsl(var(--brand-orange))] sm:text-3xl">
                    {formatPrice(total)}
                  </span>
                </div>

                <Button
                  className="mt-6 w-full"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Link to="/">
                  <Button variant="outline" className="mt-3 w-full" size="lg">
                    Continue Shopping
                  </Button>
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 space-y-3 border-t border-[hsl(var(--border))] pt-4 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Secure checkout guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Free shipping on orders over ৳999</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="h-4 w-4 shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Easy returns within 7 days</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile sticky bottom bar with collapsible summary - Only show when cart has items */}
      {items.length > 0 && (
        <>
          {/* Collapsible Summary Overlay */}
          {isSummaryOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsSummaryOpen(false)}
            />
          )}

          {/* Summary Panel */}
          <div
            className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg transition-transform duration-300 lg:hidden ${isSummaryOpen ? 'translate-y-0' : ''}`}
          >
            {/* Collapsible Details */}
            {isSummaryOpen && (
              <div className="max-h-[70vh] overflow-y-auto border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                <div className="mx-auto max-w-7xl px-4 py-4">
                  <h3 className="mb-4 text-lg font-bold text-[hsl(var(--foreground))]">
                    Order Summary
                  </h3>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">
                        Items Subtotal ({items.length}{' '}
                        {items.length === 1 ? 'item' : 'items'})
                      </span>
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {formatPrice(subtotal)}
                      </span>
                    </div>

                    {discount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400">
                          Discount ({discount.code})
                        </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {discount.type === 'free_shipping'
                            ? 'FREE Delivery'
                            : `-${formatPrice(discountAmount)}`}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">
                        Delivery Fee
                      </span>
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {shipping === 0 ? (
                          <Badge
                            variant="freeShipping"
                            className="font-semibold"
                          >
                            FREE
                          </Badge>
                        ) : (
                          formatPrice(shipping)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-[hsl(var(--muted-foreground))]">
                        Tax (5%)
                      </span>
                      <span className="font-medium text-[hsl(var(--foreground))]">
                        {formatPrice(tax)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Bar */}
            <div className="mx-auto max-w-7xl px-4 py-3">
              <button
                onClick={() => setIsSummaryOpen(!isSummaryOpen)}
                className="mb-3 flex w-full items-center justify-between text-sm"
              >
                <span className="font-medium text-[hsl(var(--foreground))]">
                  {isSummaryOpen ? 'Hide' : 'View'} order summary
                </span>
                {isSummaryOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>

              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-[hsl(var(--muted-foreground))]">
                    Grand Total
                  </span>
                  <span className="text-xl font-bold text-[hsl(var(--brand-orange))]">
                    {formatPrice(total)}
                  </span>
                </div>
                <Button
                  className="flex-1 max-w-xs w-full"
                  size="lg"
                  onClick={handleCheckout}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <CartRemoveConfirmDialog
        pendingRemoveItem={pendingRemoveItem}
        onClose={() => setPendingRemoveItem(null)}
        onConfirm={handleConfirmRemove}
      />

      {/* Quick Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {authView === 'signin'
                ? 'Sign In to Continue'
                : 'Create an Account'}
            </DialogTitle>
            <DialogDescription className="text-center">
              Please sign in to proceed with checkout
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {authView === 'signin' ? (
              <SignInForm
                onSwitchToSignUp={() => setAuthView('signup')}
                onSuccess={handleAuthSuccess}
              />
            ) : (
              <SignUpForm
                onSwitchToSignIn={() => setAuthView('signin')}
                onSuccess={handleAuthSuccess}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CartPage
