import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart, Minus, Plus, RotateCcw, ShoppingCart, Star, Truck, ExternalLink } from 'lucide-react';
import { useNavigate, Link } from '@tanstack/react-router';
import type { Product, ProductVariant } from '@/types';
import { useCart } from '@/stores/cart-store';
import { useWishlist } from '@/stores/wishlist-store';
import { useQuickView } from '@/stores/quick-view-store';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge, DiscountBadge, StockBadge } from '@/components/ui/badge';
import { cn, formatPrice } from '@/lib/utils';

interface ProductModalProps {
  product?: Product | null;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ProductModal({ product: propProduct, isOpen: propIsOpen, onClose: propOnClose }: ProductModalProps) {
  const navigate = useNavigate();
  const { product: storeProduct, isOpen: storeIsOpen, closeQuickView } = useQuickView();

  const product = propProduct ?? storeProduct;
  const isOpen = propIsOpen ?? storeIsOpen;
  const onClose = propOnClose ?? closeQuickView;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ProductVariant>>({});

  const { addItem } = useCart();
  const { toggleItem, isInWishlist } = useWishlist();

  // Reset state when product changes
  useEffect(() => {
    if (isOpen && product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedVariants({});
    }
  }, [isOpen, product]);

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);

  // Group variants by type
  const variantsByType = product.variants.reduce(
    (acc, variant) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!acc[variant.type]) acc[variant.type] = [];
      acc[variant.type].push(variant);
      return acc;
    },
    {} as Record<string, Array<ProductVariant>>
  );

  const handleAddToCart = () => {
    const selectedVariant = Object.values(selectedVariants)[0]; // Use first selected variant
    addItem(product, quantity, selectedVariant);
    onClose();
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate({ to: '/checkout' });
  };

  const incrementQuantity = () => setQuantity((q) => Math.min(q + 1, product.stock));
  const decrementQuantity = () => setQuantity((q) => Math.max(q - 1, 1));

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(1);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setQuantity(Math.min(numValue, product.stock));
    }
  };

  const goToPreviousImage = () =>
    setSelectedImageIndex((i) => (i === 0 ? product.images.length - 1 : i - 1));
  const goToNextImage = () =>
    setSelectedImageIndex((i) => (i === product.images.length - 1 ? 0 : i + 1));

  // Calculate rating stars
  const fullStars = Math.floor(product.rating.average);
  const hasHalfStar = product.rating.average % 1 >= 0.5;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-5xl overflow-hidden bg-[hsl(var(--card))] p-0 shadow-2xl">
        <div className="grid gap-6 p-6 md:grid-cols-2">
          {/* Left: Image Gallery */}
          <div className="rounded-xl border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--background))] p-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-[hsl(var(--muted))] ring-1 ring-black/5">
              <img
                src={product.images[selectedImageIndex]?.url}
                alt={product.title}
                className="h-full w-full object-cover"
              />

              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={goToPreviousImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={goToNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Discount Badge */}
              {product.pricing.discountPercentage > 0 && (
                <div className="absolute left-3 top-3">
                  <DiscountBadge percentage={product.pricing.discountPercentage} />
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {product.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {product.images.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      'h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white/80',
                      selectedImageIndex === index
                        ? 'border-[hsl(var(--primary))]'
                        : 'border-transparent'
                    )}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <DialogHeader className="pr-8">
              <span className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Quick View
              </span>
              <DialogTitle className="text-2xl leading-tight">{product.title}</DialogTitle>
              <a
                  href={`/product/${product.slug}`}
                  className="mt-1 flex items-center gap-1 text-xs font-medium text-[hsl(var(--primary))] hover:underline"
                  target="_blank"
                  rel="noreferrer"
              >
                  View Full Details
                  <ExternalLink className="h-3 w-3" />
              </a>
            </DialogHeader>

            {/* Vendor */}
            <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))]">
              Sold by:{' '}
              <Link 
                to="/vendor/$vendorId" 
                params={{ vendorId: product.vendor.id }}
                className="font-medium text-[hsl(var(--foreground))] hover:underline hover:text-primary transition-colors"
                onClick={onClose}
              >
                {product.vendor.name}
              </Link>
              {product.vendor.isVerified && (
                <Badge variant="verified" className="ml-2">
                  Verified
                </Badge>
              )}
            </p>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'h-4 w-4',
                      i < fullStars
                        ? 'fill-yellow-400 text-yellow-400'
                        : i === fullStars && hasHalfStar
                          ? 'fill-yellow-400/50 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">
                {product.rating.average} ({product.rating.count} reviews)
              </span>
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {product.stockStatus}
              </Badge>
            </div>
            
            {/* Short Description */}
            {product.descriptionShort && (
                <p className="mt-3 text-sm text-[hsl(var(--muted-foreground))] line-clamp-3">
                    {product.descriptionShort}
                </p>
            )}

            {/* Price */}
            <div className="mt-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
              <span className="text-2xl font-bold text-[hsl(var(--brand-orange))]">
                {formatPrice(product.pricing.currentPrice)}
              </span>
              {product.pricing.originalPrice > product.pricing.currentPrice && (
                <>
                  <span className="ml-2 text-lg text-[hsl(var(--muted-foreground))] line-through">
                    {formatPrice(product.pricing.originalPrice)}
                  </span>
                  <span className="ml-2 text-sm font-medium text-[hsl(var(--accent))]">
                    Save {product.pricing.discountPercentage}%
                  </span>
                </>
              )}
            </div>

            {/* Variants */}
            {Object.entries(variantsByType).map(([type, variants]) => (
              <div key={type} className="mt-4">
                <label className="mb-2 block text-sm font-medium capitalize">
                  {type}
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() =>
                        setSelectedVariants((prev) => ({ ...prev, [type]: variant }))
                      }
                      className={cn(
                        'rounded-md border px-3 py-1.5 text-sm transition',
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                        selectedVariants[type]?.id === variant.id
                          ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white'
                          : 'border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]',
                        variant.stock === 0 && 'cursor-not-allowed opacity-50'
                      )}
                      disabled={variant.stock === 0}
                    >
                      {variant.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Quantity */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={decrementQuantity}
                  className="rounded-md border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--muted))]"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="w-12 rounded-md border border-[hsl(var(--border))] p-2 text-center font-medium focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={incrementQuantity}
                  className="rounded-md border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--muted))]"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
                <StockBadge status={product.stockStatus} quantity={product.stock} />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleItem(product)}
                className={cn(inWishlist && 'text-red-500')}
              >
                <Heart className={cn('h-5 w-5', inWishlist && 'fill-current')} />
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleBuyNow}>
                Buy Now
              </Button>
              <Button className="flex-1 gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
            </div>

            {/* Shipping Info */}
            <div className="mt-6 space-y-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] p-3">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                {product.shipping.freeShipping ? (
                  <span className="text-[hsl(var(--success))]">Free Shipping</span>
                ) : (
                  <span>Shipping: {formatPrice(product.shipping.cost)}</span>
                )}
                <span className="text-[hsl(var(--muted-foreground))]">
                  • Delivery in {product.shipping.estimatedDays} days
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                <RotateCcw className="h-4 w-4" />
                <span>{product.returnPolicy}</span>
              </div>
            </div>

            {/* Key Features */}
            {product.keyFeatures.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium">Key Features</h4>
                <ul className="mt-2 space-y-1">
                  {product.keyFeatures.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]"
                    >
                      <span className="text-[hsl(var(--primary))]">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProductModal;
