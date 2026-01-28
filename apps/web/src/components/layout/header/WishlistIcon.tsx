import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/stores/wishlist-store';
import { cn } from '@/lib/utils';

interface WishlistIconProps {
  onClick?: () => void;
}

export function WishlistIcon({ onClick }: WishlistIconProps) {
  const { itemCount } = useWishlist();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
      aria-label={`Wishlist with ${itemCount} items`}
    >
      <Heart className="h-5 w-5" />
      {itemCount > 0 && (
        <span
          className={cn(
            'absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--accent))] px-1 text-xs font-bold text-white',
            itemCount > 99 && 'text-[10px]'
          )}
        >
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Button>
  );
}
