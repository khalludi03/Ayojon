import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { CouponSection } from './CouponSection'
import type { CurrencyCode } from '@/types'
import type { CartItem } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCart } from '@/stores/cart-store'
import {
  CartRemoveConfirmDialog,
  useCartItemRemoval,
} from '@/hooks/use-cart-item-removal'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { authClient } from '@/lib/auth-client'
import SignInForm from '@/components/sign-in-form'
import SignUpForm from '@/components/sign-up-form'

interface CartItemRowProps {
  item: CartItem
  currency: CurrencyCode
  updateQuantity: (itemId: string, quantity: number) => void
  onRemove: (item: CartItem) => void
  onSaveForLater: (itemId: string) => void
  closeDrawer: () => void
}

function CartItemRow({
  item,
  currency,
  updateQuantity,
  onRemove,
  onSaveForLater,
  closeDrawer,
}: CartItemRowProps) {
  const [inputValue, setInputValue] = useState(item.quantity.toString())

  // Sync local state with store when store updates (e.g. via +/- buttons)
  useEffect(() => {
    setInputValue(item.quantity.toString())
  }, [item.quantity])

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    if (value === '') {
      setInputValue('')
      return
    }

    const numValue = parseInt(value, 10)
    if (!isNaN(numValue) && numValue >= 1) {
      if (numValue > item.product.stock) {
        setInputValue(item.product.stock.toString())
        toast.error(`Only ${item.product.stock} items available in stock`)
        updateQuantity(item.id, item.product.stock)
      } else {
        setInputValue(value)
        updateQuantity(item.id, numValue)
      }
    } else {
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
      // Format correctly (e.g. remove leading zeros)
      setInputValue(numValue.toString())
    }
  }

  return (
    <div className="flex gap-4">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
        {item.product.images[0] ? (
          <img
            src={item.product.images[0].url}
            alt={item.product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
            <ShoppingCart className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="grid gap-1">
          <Link
            to={`/product/${item.product.slug}`}
            className="line-clamp-2 font-medium hover:underline"
            onClick={closeDrawer}
          >
            {item.product.title}
          </Link>
          {item.selectedVariant && (
            <p className="text-sm text-muted-foreground">
              Variant: {item.selectedVariant.value}
            </p>
          )}
          <p className="font-medium">
            {formatPrice(
              item.product.pricing.currentPrice +
                (item.selectedVariant?.priceModifier || 0),
              currency,
            )}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-r-none"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">Decrease</span>
              </Button>
              <input
                type="number"
                min="1"
                max={item.product.stock}
                value={inputValue}
                aria-label="Quantity"
                onChange={handleManualChange}
                onBlur={handleBlur}
                className="h-8 w-12 border-x border-input bg-transparent text-center text-sm font-medium focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-l-none"
                onClick={() => {
                  if (item.quantity < item.product.stock) {
                    updateQuantity(item.id, item.quantity + 1)
                  } else {
                    toast.error(`Only ${item.product.stock} items available`)
                  }
                }}
                disabled={item.quantity >= item.product.stock}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">Increase</span>
              </Button>
            </div>
            <Button
              variant="link"
              size="sm"
              className="h-8 px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={() => onSaveForLater(item.id)}
            >
              Save for Later
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemove(item)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Remove</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    tax,
    shipping,
    discountAmount,
    total,
    discount,
    updateQuantity,
    saveForLater,
    currency,
    isDrawerOpen,
    closeDrawer,
    openDrawer,
  } = useCart()
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const { pendingRemoveItem, setPendingRemoveItem, handleConfirmRemove } =
    useCartItemRemoval()
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signin')

  const handleCheckout = () => {
    if (session?.user) {
      closeDrawer()
      navigate({ to: '/checkout' })
    } else {
      setShowLoginDialog(true)
    }
  }

  const handleAuthSuccess = () => {
    setShowLoginDialog(false)
    closeDrawer()
    toast.success('Welcome back! Proceeding to checkout...')
    setTimeout(() => {
      navigate({ to: '/checkout' })
    }, 500)
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openDrawer()
    } else {
      closeDrawer()
    }
  }

  return (
    <>
      <Sheet open={isDrawerOpen} onOpenChange={handleOpenChange}>
        <SheetContent
          className="flex w-[80%] flex-col sm:max-w-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shopping Cart
              <Badge
                variant="secondary"
                className="ml-2 rounded-full px-2 py-0.5 text-xs"
              >
                {itemCount}
              </Badge>
            </SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-muted p-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">Your cart is empty</h3>
                <p className="text-muted-foreground">
                  Looks like you haven't added anything to your cart yet.
                </p>
              </div>
              <SheetClose asChild>
                <Button variant="primary" className="mt-4">
                  Continue Shopping
                </Button>
              </SheetClose>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4">
                <div className="flex flex-col gap-6">
                  {items.map((cartItem) => (
                    <CartItemRow
                      key={cartItem.id}
                      item={cartItem}
                      currency={currency}
                      updateQuantity={updateQuantity}
                      onRemove={(itemToRemove) =>
                        setPendingRemoveItem(itemToRemove)
                      }
                      onSaveForLater={(itemId) => {
                        saveForLater(itemId)
                        toast.success('Item saved for later')
                      }}
                      closeDrawer={closeDrawer}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <CouponSection />

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>

                  {discount && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">
                        Discount ({discount.code})
                      </span>
                      <span className="text-green-600 dark:text-green-400">
                        {discount.type === 'free_shipping'
                          ? 'FREE Delivery'
                          : `-${formatPrice(discountAmount, currency)}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span>
                      {shipping === 0 ? (
                        <Badge variant="freeShipping" className="font-semibold">
                          FREE
                        </Badge>
                      ) : (
                        formatPrice(shipping, currency)
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tax (5%)</span>
                    <span>{formatPrice(tax, currency)}</span>
                  </div>

                  <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
                    <span>Total</span>
                    <span className="text-brand-orange">
                      {formatPrice(total, currency)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate({ to: '/cart' })}
                    >
                      View Cart
                    </Button>
                  </SheetClose>
                  <Button className="w-full" onClick={handleCheckout}>
                    Checkout
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

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
    </>
  )
}
