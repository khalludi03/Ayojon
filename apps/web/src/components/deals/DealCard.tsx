import { ShoppingCart, Eye } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import type { DealProduct } from '@/types';
import { useCountdown } from '@/hooks/use-countdown';
import { useCart } from '@/stores/cart-store';
import { useQuickView } from '@/stores/quick-view-store';
import { Badge, DiscountBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

interface DealCardProps {
  deal: DealProduct;
}

export function DealCard({ deal }: DealCardProps) {
  const navigate = useNavigate();
  const countdown = useCountdown(deal.dealEndsAt);
  const { addItem, toggleItem, isInCart } = useCart();
  const { openQuickView } = useQuickView();

  const handleToggleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(deal);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(deal);
    navigate({ to: '/checkout' });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(deal);
  };

  const inCart = isInCart(deal.id);

  // Product detail page URL
  const productUrl = `/product/${deal.slug}`;

  return (
    <a
      href={productUrl}
      className="group flex h-full w-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 transition-all hover:shadow-[var(--shadow-card-hover)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 sm:p-2.5"
      aria-label={`View ${deal.title} - ${formatPrice(deal.pricing.currentPrice)}`}
    >
      {/* Image Container - Fixed aspect ratio */}
      <div 
        className="relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))]"
        onClick={handleQuickView}
      >
        <img
          src={deal.images[0]?.url}
          alt={deal.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
          loading="lazy"
        />

        {/* Quick View Overlay Button (Desktop) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/20">
            <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2 shadow-lg hidden sm:flex pointer-events-none sm:pointer-events-auto transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                onClick={handleQuickView}
            >
                <Eye className="h-4 w-4" />
                Quick View
            </Button>
        </div>

        {/* Discount Badge */}
        {deal.pricing.discountPercentage > 0 && (
          <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2">
            <DiscountBadge percentage={deal.pricing.discountPercentage} />
          </div>
        )}
      </div>

      {/* Card Content - Flex column for alignment */}
      <div className="flex flex-1 flex-col">
        {/* Deal Type Badge - Fixed height */}
        <div className="mt-1.5 h-4 sm:mt-2 sm:h-5">
          <Badge
            variant={deal.dealType === 'flash' ? 'deal' : 'secondary'}
            className="text-[9px] sm:text-[10px]"
          >
            {deal.dealType === 'flash' ? 'Flash Deal' : 'Hot Deal'}
          </Badge>
        </div>

        {/* Title - Fixed height with line clamp */}
        <h3 className="mt-1.5 h-9 text-[11px] font-medium leading-[18px] text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-[hsl(var(--primary))] sm:mt-2 sm:h-10 sm:text-xs sm:leading-5">
          {deal.title}
        </h3>

        {/* Price Section - More prominent */}
        <div className="mt-1.5 flex flex-col gap-0.5 sm:mt-2">
          {/* Deal Price with Discount % */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-[hsl(var(--brand-orange))] sm:text-lg md:text-xl">
              {formatPrice(deal.pricing.currentPrice)}
            </span>
            {deal.pricing.discountPercentage > 0 && (
              <span className="text-[10px] font-semibold text-[hsl(var(--success))] sm:text-xs">
                -{deal.pricing.discountPercentage}%
              </span>
            )}
          </div>
          {/* Original Price (struck) */}
          {deal.pricing.originalPrice > deal.pricing.currentPrice && (
            <div className="text-xs text-[hsl(var(--muted-foreground))] line-through sm:text-sm">
              {formatPrice(deal.pricing.originalPrice)}
            </div>
          )}
        </div>

        {/* Timer - Fixed height (always reserve space) */}
        <div className="mt-1.5 h-4 text-[9px] text-[hsl(var(--muted-foreground))] sm:mt-2 sm:text-[10px] md:text-xs">
          {!countdown.isExpired ? (
            <>
              Ends in{' '}
              <span className="font-mono font-semibold text-[hsl(var(--accent))]">
                {countdown.hours}:{countdown.minutes}:{countdown.seconds}
              </span>
            </>
          ) : (
            <span className="text-[hsl(var(--destructive))]">Deal expired</span>
          )}
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1" />

        {/* Action Buttons - Always at bottom */}
        <div className="mt-2 flex gap-1 sm:gap-1.5 md:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 min-w-0 h-7 px-1.5 text-[10px] sm:h-8 sm:px-2 sm:text-xs md:h-9 md:px-3 md:text-sm"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
          <Button
            variant={inCart ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1 min-w-0 h-7 gap-0.5 px-1.5 text-[10px] sm:h-8 sm:gap-1 sm:px-2 sm:text-xs md:h-9 md:px-3 md:text-sm"
            onClick={handleToggleCart}
          >
            <ShoppingCart className="h-2.5 w-2.5 flex-shrink-0 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
            {inCart ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>
    </a>
  );
}
