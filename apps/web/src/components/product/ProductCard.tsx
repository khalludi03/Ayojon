import { useState } from 'react';
import { Heart, ShoppingCart, Star, Truck } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/stores/cart-store';
import { useWishlist } from '@/stores/wishlist-store';
import { DiscountBadge, ProductBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void; // Keep for backward compatibility but not used
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem, toggleItem, isInCart } = useCart();
  const { toggleItem: toggleWishlist, isInWishlist } = useWishlist();

  const inCart = isInCart(product.id);
  const inWishlist = isInWishlist(product.id);

  // Product detail page URL
  const productUrl = `/product/${product.slug}`;

  const handleToggleCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingToCart(true);
    toggleItem(product);
    // Brief feedback animation
    await new Promise((resolve) => setTimeout(resolve, 300));
    setIsAddingToCart(false);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    // Navigate to checkout - for now just add to cart
    window.location.href = '/checkout';
  };

  // Calculate star display
  const fullStars = Math.floor(product.rating.average);
  const hasHalfStar = product.rating.average % 1 >= 0.5;

  return (
    <a
      href={productUrl}
      className="group relative flex h-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 transition-all hover:shadow-[var(--shadow-card-hover)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2 sm:p-3"
      aria-label={`View ${product.title} - ${formatPrice(product.pricing.currentPrice)}`}
    >
      {/* Image Container - Fixed aspect ratio */}
      <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden rounded-md bg-[hsl(var(--muted))]">
        <img
          src={product.images[0]?.url}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {product.pricing.discountPercentage > 0 && (
          <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2">
            <DiscountBadge percentage={product.pricing.discountPercentage} />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={cn(
            'absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 shadow transition-colors sm:right-2 sm:top-2 sm:p-2',
            inWishlist
              ? 'text-red-500'
              : 'text-[hsl(var(--muted-foreground))] hover:text-red-500'
          )}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-3.5 w-3.5 sm:h-4 sm:w-4', inWishlist && 'fill-current')} />
        </button>
      </div>

      {/* Card Content - Flex column to enable proper alignment */}
      <div className="flex flex-1 flex-col">
        {/* Product Badges - Fixed height container */}
        <div className="mt-2 flex h-4 items-center gap-1 sm:mt-3 sm:h-5">
          {product.badges.slice(0, 2).map((badge) => (
            <ProductBadge key={badge} type={badge} />
          ))}
        </div>

        {/* Title - Fixed height with line clamp (2 lines) */}
        <h3 className="mt-1.5 h-9 text-[11px] font-medium leading-[18px] text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-[hsl(var(--primary))] sm:mt-2 sm:h-10 sm:text-xs sm:leading-5">
          {product.title}
        </h3>

        {/* Rating - Fixed height */}
        <div className="mt-1.5 flex h-4 items-center gap-1 sm:mt-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3 sm:h-3.5 sm:w-3.5',
                  i < fullStars
                    ? 'fill-yellow-400 text-yellow-400'
                    : i === fullStars && hasHalfStar
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
          <span className="text-[10px] text-[hsl(var(--muted-foreground))] sm:text-xs">
            ({product.rating.count})
          </span>
        </div>

        {/* Price - Fixed height */}
        <div className="mt-1.5 flex h-6 items-baseline sm:mt-2 sm:h-7">
          <span className="text-sm font-bold text-[hsl(var(--brand-orange))] sm:text-base md:text-lg">
            {formatPrice(product.pricing.currentPrice)}
          </span>
          {product.pricing.originalPrice > product.pricing.currentPrice && (
            <span className="ml-1 text-[9px] text-[hsl(var(--muted-foreground))] line-through sm:ml-1.5 sm:text-[10px] md:text-xs">
              {formatPrice(product.pricing.originalPrice)}
            </span>
          )}
        </div>

        {/* Shipping Info - Fixed height */}
        <div className="mt-1.5 flex h-4 items-center gap-0.5 text-[9px] text-[hsl(var(--muted-foreground))] sm:mt-2 sm:gap-1 sm:text-[10px] md:text-xs">
          <Truck className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
          {product.shipping.freeShipping ? (
            <span className="text-[hsl(var(--success))]">Free Shipping</span>
          ) : (
            <span>Shipping: {formatPrice(product.shipping.cost)}</span>
          )}
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1" />

        {/* Action Buttons - Always at bottom */}
        <div className="mt-2 flex gap-1 sm:mt-3 sm:gap-1.5 md:gap-2">
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
            isLoading={isAddingToCart}
          >
            <ShoppingCart className="h-2.5 w-2.5 flex-shrink-0 sm:h-3 sm:w-3 md:h-3.5 md:w-3.5" />
            {inCart ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>
    </a>
  );
}

export default ProductCard;
