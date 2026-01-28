import { Eye, ShoppingCart } from 'lucide-react';
import type { DealProduct } from '@/types';
import { useCountdown } from '@/hooks/use-countdown';
import { useCart } from '@/stores/cart-store';
import { Badge, DiscountBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

interface DealCardProps {
  deal: DealProduct;
  onQuickView?: (deal: DealProduct) => void;
}

export function DealCard({ deal, onQuickView }: DealCardProps) {
  const countdown = useCountdown(deal.dealEndsAt);
  const { addItem, isInCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(deal);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(deal);
  };

  const inCart = isInCart(deal.id);

  return (
    <div className="group flex h-[340px] w-44 shrink-0 flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-shadow hover:shadow-lg">
      {/* Image Container - Fixed aspect ratio */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))]">
        <img
          src={deal.images[0]?.url}
          alt={deal.title}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {deal.pricing.discountPercentage > 0 && (
          <div className="absolute left-2 top-2">
            <DiscountBadge percentage={deal.pricing.discountPercentage} />
          </div>
        )}

        {/* Quick View Button (appears on hover) */}
        <button
          onClick={handleQuickView}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <span className="flex items-center gap-1 rounded-md bg-white px-3 py-1.5 text-xs font-medium">
            <Eye className="h-3 w-3" />
            Quick View
          </span>
        </button>
      </div>

      {/* Card Content - Flex column for alignment */}
      <div className="flex flex-1 flex-col">
        {/* Deal Type Badge - Fixed height */}
        <div className="mt-2 h-5">
          <Badge
            variant={deal.dealType === 'flash' ? 'deal' : 'secondary'}
            className="text-[10px]"
          >
            {deal.dealType === 'flash' ? 'Flash Deal' : 'Hot Deal'}
          </Badge>
        </div>

        {/* Title - Fixed height with line clamp */}
        <h3 className="mt-2 h-10 text-sm font-medium leading-5 text-[hsl(var(--foreground))] line-clamp-2">
          {deal.title}
        </h3>

        {/* Price - Fixed height */}
        <div className="mt-2 h-6">
          <span className="text-lg font-bold leading-6 text-[hsl(var(--brand-orange))]">
            {formatPrice(deal.pricing.currentPrice)}
          </span>
          {deal.pricing.originalPrice > deal.pricing.currentPrice && (
            <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))] line-through">
              {formatPrice(deal.pricing.originalPrice)}
            </span>
          )}
        </div>

        {/* Timer - Fixed height (always reserve space) */}
        <div className="mt-2 h-4 text-xs text-[hsl(var(--muted-foreground))]">
          {deal.dealType === 'flash' && !countdown.isExpired ? (
            <>
              <span className="font-mono text-[hsl(var(--accent))]">
                {countdown.hours}:{countdown.minutes}:{countdown.seconds}
              </span>{' '}
              left
            </>
          ) : (
            <span className="text-[hsl(var(--success))]">Limited offer</span>
          )}
        </div>

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Add to Cart - Always at bottom */}
        <Button
          variant={inCart ? 'secondary' : 'primary'}
          size="sm"
          className="mt-2 w-full gap-1.5"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {inCart ? 'Added' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}
