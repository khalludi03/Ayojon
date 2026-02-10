import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/stores/wishlist-store';
import { cn } from '@/lib/utils';

interface WishlistIconProps {
  onClick?: () => void;
}

export function WishlistIcon({ onClick }: WishlistIconProps) {
  const { itemCount } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative h-8 w-8 sm:h-10 sm:w-10"
      onClick={onClick}
      aria-label={`Wishlist with ${itemCount} items`}
    >
      <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
      {mounted && itemCount > 0 && (
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
