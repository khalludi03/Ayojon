import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { useCart, type CartItem } from '@/stores/cart-store';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { CurrencyCode } from '@/types';

interface CartItemRowProps {
  item: CartItem;
  currency: CurrencyCode;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  closeDrawer: () => void;
}

function CartItemRow({ item, currency, updateQuantity, removeItem, closeDrawer }: CartItemRowProps) {
  const [inputValue, setInputValue] = useState(item.quantity.toString());

  // Sync local state with store when store updates (e.g. via +/- buttons)
  useEffect(() => {
    setInputValue(item.quantity.toString());
  }, [item.quantity]);

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value === '') return;

    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      if (numValue > item.product.stock) {
        toast.error(`Only ${item.product.stock} items available in stock`);
        updateQuantity(item.id, item.product.stock);
      } else {
        updateQuantity(item.id, numValue);
      }
    }
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (inputValue === '' || isNaN(numValue) || numValue < 1) {
      setInputValue('1');
      updateQuantity(item.id, 1);
    } else if (numValue > item.product.stock) {
        setInputValue(item.product.stock.toString());
        updateQuantity(item.id, item.product.stock);
    } else {
      // Format correctly (e.g. remove leading zeros)
      setInputValue(numValue.toString());
    }
  };

  return (
    <div className="flex gap-4">
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
              Variant: {item.selectedVariant.name}
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
                  updateQuantity(item.id, item.quantity + 1);
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
  );
}

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
                  <CartItemRow
                    key={item.id}
                    item={item}
                    currency={currency}
                    updateQuantity={updateQuantity}
                    removeItem={removeItem}
                    closeDrawer={closeDrawer}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between text-base font-medium">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/cart" onClick={closeDrawer}>
                    View Cart
                  </Link>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/checkout" onClick={closeDrawer}>
                    Checkout
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}