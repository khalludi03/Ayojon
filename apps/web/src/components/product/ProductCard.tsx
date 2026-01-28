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
      className="group relative flex h-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-all hover:shadow-[var(--shadow-card-hover)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
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
          <div className="absolute left-2 top-2">
            <DiscountBadge percentage={product.pricing.discountPercentage} />
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleToggleWishlist}
          className={cn(
            'absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow transition-colors',
            inWishlist
              ? 'text-red-500'
              : 'text-[hsl(var(--muted-foreground))] hover:text-red-500'
          )}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={cn('h-4 w-4', inWishlist && 'fill-current')} />
        </button>
      </div>

      {/* Card Content - Flex column to enable proper alignment */}
      <div className="flex flex-1 flex-col">
        {/* Product Badges - Fixed height container */}
        <div className="mt-3 flex h-5 items-center gap-1">
          {product.badges.slice(0, 2).map((badge) => (
            <ProductBadge key={badge} type={badge} />
          ))}
        </div>

        {/* Title - Fixed height with line clamp (2 lines) */}
        <h3 className="mt-2 h-10 text-sm font-medium leading-5 text-[hsl(var(--foreground))] line-clamp-2 group-hover:text-[hsl(var(--primary))]">
          {product.title}
        </h3>

        {/* Rating - Fixed height */}
        <div className="mt-2 flex h-4 items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3.5 w-3.5',
                  i < fullStars
                    ? 'fill-yellow-400 text-yellow-400'
                    : i === fullStars && hasHalfStar
                      ? 'fill-yellow-400/50 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                )}
              />
            ))}
          </div>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            ({product.rating.count})
          </span>
        </div>

        {/* Price - Fixed height */}
        <div className="mt-2 flex h-7 items-baseline">
          <span className="text-lg font-bold text-[hsl(var(--brand-orange))]">
            {formatPrice(product.pricing.currentPrice)}
          </span>
          {product.pricing.originalPrice > product.pricing.currentPrice && (
            <span className="ml-2 text-xs text-[hsl(var(--muted-foreground))] line-through">
              {formatPrice(product.pricing.originalPrice)}
            </span>
          )}
        </div>

        {/* Shipping Info - Fixed height */}
        <div className="mt-2 flex h-4 items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
          <Truck className="h-3.5 w-3.5 flex-shrink-0" />
          {product.shipping.freeShipping ? (
            <span className="text-[hsl(var(--success))]">Free Shipping</span>
          ) : (
            <span>Shipping: {formatPrice(product.shipping.cost)}</span>
          )}
        </div>

        {/* Spacer to push buttons to bottom */}
        <div className="flex-1" />

        {/* Action Buttons - Always at bottom */}
        <div className="mt-3 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleBuyNow}
          >
            Buy Now
          </Button>
          <Button
            variant={inCart ? 'secondary' : 'primary'}
            size="sm"
            className="flex-1 gap-1"
            onClick={handleToggleCart}
            isLoading={isAddingToCart}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {inCart ? 'Added' : 'Add'}
          </Button>
        </div>
      </div>
    </a>
  );
}

export default ProductCard;
