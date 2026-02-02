import { Link } from '@tanstack/react-router';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { useCart } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function CartDrawer() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    currency,
    isDrawerOpen,
    closeDrawer,
    openDrawer,
  } = useCart();

  const handleOpenChange = (open: boolean) => {
    if (open) {
      openDrawer();
    } else {
      closeDrawer();
    }
  };

  const handleManualQuantityChange = (itemId: string, value: string, maxStock: number) => {
    if (value === '') {
      // Temporarily allow empty string while typing, but don't update store effectively
      // or set to 1. Better to just not update store if invalid.
      // For UX, maybe update store with 1 or keep previous value? 
      // Let's set to 1 if empty to avoid issues, or wait for blur.
      // Standard pattern: update on valid integer.
      return; 
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      if (numValue > maxStock) {
        toast.error(`Only ${maxStock} items available in stock`);
        updateQuantity(itemId, maxStock);
      } else {
        updateQuantity(itemId, numValue);
      }
    }
  };
  
  const handleBlur = (itemId: string, quantity: number) => {
      if (quantity < 1 || isNaN(quantity)) {
          updateQuantity(itemId, 1);
      }
  };

  return (
    <Sheet open={isDrawerOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="flex-row items-center justify-between space-y-0 border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shopping Cart
            <Badge variant="secondary" className="ml-2 rounded-full px-2 py-0.5 text-xs">
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
              <Button variant="default" className="mt-4">
                Continue Shopping
              </Button>
            </SheetClose>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4">
              <div className="flex flex-col gap-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                      {item.product.images?.[0] ? (
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
                            (item.product.pricing.currentPrice +
                              (item.selectedVariant?.priceModifier || 0)),
                            currency
                          )}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-md border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-r-none"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease</span>
                          </Button>
                          <input
                            type="number"
                            min="1"
                            max={item.product.stock}
                            value={item.quantity}
                            onChange={(e) => handleManualQuantityChange(item.id, e.target.value, item.product.stock)}
                            onBlur={() => handleBlur(item.id, item.quantity)}
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
                                    toast.error(`Only ${item.product.stock} items available`);
                                }
                            }}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase</span>
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between text-base font-medium">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SheetClose asChild>
                  <Link to="/cart">
                    <Button variant="outline" className="w-full">
                      View Cart
                    </Button>
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link to="/checkout">
                    <Button className="w-full">Checkout</Button>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
