import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/stores/cart-store';
import { cn } from '@/lib/utils';

interface CartIconProps {
  onClick?: () => void;
}

export function CartIcon({ onClick }: CartIconProps) {
  const { itemCount } = useCart();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-8 w-8 sm:h-10 sm:w-10"
      onClick={onClick}
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
      {itemCount > 0 && (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-0.5 text-[10px] font-bold text-white sm:-right-1 sm:-top-1 sm:h-5 sm:min-w-5 sm:px-1 sm:text-xs',
            itemCount > 99 && 'text-[8px] sm:text-[10px]'
          )}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
