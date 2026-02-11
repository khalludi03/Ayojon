import { Link, useNavigate } from '@tanstack/react-router';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ReviewsSection } from '@/components/product/ReviewsSection';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/stores/cart-store';
import { 
    Facebook, 
    Twitter, 
    Share2, 
    Copy, 
    CheckCircle2, 
    Truck, 
    AlertTriangle,
    CheckCircle,
    Minus,
    Plus,
    ShoppingCart,
    Loader2,
    Star
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { HorizontalScroller } from '@/components/deals/HorizontalScroller';
import { ProductCard } from '@/components/product/ProductCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductDetailPageProps {
  product: Product;
  relatedProducts: Array<Product>;
}

export function ProductDetailPage({ product, relatedProducts }: ProductDetailPageProps) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const isLowStock = product.stock < 10 && product.stock > 0;
  const isOutOfStock = product.stockStatus === 'out_of_stock' || product.stock === 0;
  const savings = product.pricing.originalPrice - product.pricing.currentPrice;

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

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Stock availability check
    if (isOutOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setIsAddingToCart(true);
    
    // Simulate async operation
    setTimeout(() => {
      addItem(product, quantity);
      setIsAddingToCart(false);
      setShowCartModal(true);
      toast.success(`Added ${quantity} item(s) to cart`);
    }, 300);
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Stock availability check
    if (isOutOfStock) {
      toast.error('This product is currently out of stock');
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setIsBuyingNow(true);
    
    // Simulate async operation
    setTimeout(() => {
      addItem(product, quantity);
      setIsBuyingNow(false);
      navigate({ to: '/cart' });
    }, 300);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
      toast.error('Failed to copy link to clipboard');
    }
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.title)}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const stockStatusInfo = {
    in_stock: { label: 'In Stock', color: 'text-green-600', bg: 'bg-green-50', icon: CheckCircle2 },
    low_stock: { label: 'Limited Stock', color: 'text-orange-600', bg: 'bg-orange-50', icon: AlertTriangle },
    out_of_stock: { label: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
  };

  const status = stockStatusInfo[product.stockStatus] || stockStatusInfo.in_stock;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          {/* Product Gallery */}
          <div className="product-gallery-container">
            <ProductGallery 
                images={product.images} 
            />
          </div>

          {/* Product Info */}
          <div className="product-info-container">
            {/* Brand & SKU */}
            <div className="flex items-center justify-between mb-2">
                <Link 
                    to="/products" // In a real app, this would be /brand/$brandSlug
                    className="text-sm font-medium text-primary hover:underline"
                >
                    {product.brand || 'Ayojon Brand'}
                </Link>
                <span className="text-xs text-muted-foreground">
                    SKU: {product.id.split('-').pop()?.toUpperCase()}
                </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">{product.title}</h1>
            
            {/* Rating & Availability */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => {
                            const fullStars = Math.floor(product.rating.average);
                            const hasHalfStar = product.rating.average % 1 >= 0.5;
                            return (
                                <Star
                                    key={i}
                                    className={`h-5 w-5 ${
                                        i < fullStars
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : i === fullStars && hasHalfStar
                                                ? 'fill-yellow-400/50 text-yellow-400'
                                                : 'fill-gray-200 text-gray-200'
                                    }`}
                                />
                            );
                        })}
                    </div>
                    <span className="text-sm font-semibold text-foreground">{product.rating.average}</span>
                    <span className="text-sm text-muted-foreground">({product.rating.count} reviews)</span>
                </div>
                
                {!isOutOfStock && (
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        <status.icon className="w-3.5 h-3.5 mr-1" />
                        {status.label}
                    </div>
                )}
            </div>

            {/* Price & Delivery */}
            <div className="space-y-4 mb-8">
                <div className="rounded-lg border bg-card p-5 shadow-sm">
                    <div className="flex items-end gap-3 flex-wrap">
                        <span className="text-4xl font-bold text-foreground">
                            {product.pricing.currencySymbol}{product.pricing.currentPrice.toLocaleString()}
                        </span>
                        {product.pricing.originalPrice !== product.pricing.currentPrice && (
                            <>
                                <span className="text-xl text-muted-foreground line-through">
                                    {product.pricing.currencySymbol}{product.pricing.originalPrice.toLocaleString()}
                                </span>
                                <Badge variant="destructive" className="mb-1">
                                    -{product.pricing.discountPercentage || Math.round(((product.pricing.originalPrice - product.pricing.currentPrice) / product.pricing.originalPrice) * 100)}% OFF
                                </Badge>
                            </>
                        )}
                    </div>
                    
                    {product.pricing.originalPrice !== product.pricing.currentPrice && (
                        <div className="mt-2 text-sm font-medium text-green-600">
                            You save {product.pricing.currencySymbol}{savings.toLocaleString()}
                        </div>
                    )}
                    
                    <div className="mt-2 text-xs text-muted-foreground">
                        (Incl. VAT)
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    {product.shipping.freeShipping ? (
                        <span className="font-semibold text-green-600">Free Delivery</span>
                    ) : (
                        <span>Delivery: {product.pricing.currencySymbol}{product.shipping.cost}</span>
                    )}
                </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm font-medium">Quantity:</span>
                    <div className="flex items-center rounded-md border">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-none" 
                            onClick={handleDecrement}
                            disabled={quantity <= 1 || isOutOfStock}
                            type="button"
                        >
                            <Minus className="h-4 w-4" />
                            <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={quantity}
                            onChange={handleQuantityChange}
                            disabled={isOutOfStock}
                            className="h-9 w-16 border-x text-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-none" 
                            onClick={handleIncrement}
                            disabled={quantity >= product.stock || isOutOfStock}
                            type="button"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="sr-only">Increase quantity</span>
                        </Button>
                    </div>
                </div>
                
                {/* Stock Information */}
                <div className="text-sm">
                    {isOutOfStock ? (
                        <p className="font-medium text-destructive">Out of Stock</p>
                    ) : isLowStock ? (
                        <p className="font-medium text-orange-600 animate-pulse">
                            Only {product.stock} items left in stock! Order soon.
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            {product.stock} available (Max {product.stock} per order)
                        </p>
                    )}
                </div>
            </div>

            {/* Vendor Info Card */}
            <div className="bg-muted/30 rounded-xl p-4 mb-8 border border-muted flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {product.vendor.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <Link 
                                to="/vendor/$vendorId" 
                                params={{ vendorId: product.vendor.slug || product.vendor.id }}
                                className="font-semibold text-sm hover:underline"
                            >
                                {product.vendor.name}
                            </Link>
                            {product.vendor.isVerified && (
                                <CheckCircle className="h-3.5 w-3.5 text-blue-500" fill="currentColor" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Storefront</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link to="/vendor/$vendorId" params={{ vendorId: product.vendor.slug || product.vendor.id }}>Visit Store</Link>
                </Button>
            </div>

            {/* Actions */}
            {isOutOfStock ? (
              <div className="flex flex-col gap-3 mb-8">
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-14 text-lg w-full"
                  disabled
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Out of Stock
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  This product is currently unavailable
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg gap-2"
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="flex-1 h-14 text-lg font-bold"
                  onClick={handleBuyNow}
                  disabled={isBuyingNow}
                >
                  {isBuyingNow ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Buy Now'
                  )}
                </Button>
              </div>
            )}
            {/* Share Buttons */}
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground mr-2">Share:</span>
                <button type="button" onClick={handleFacebookShare} aria-label="Share on Facebook" className="h-9 w-9 rounded-full border border-muted flex items-center justify-center text-muted-foreground hover:bg-[#1877F2] hover:text-white transition-colors">
                    <Facebook className="h-4 w-4" />
                </button>
                <button type="button" onClick={handleTwitterShare} aria-label="Share on Twitter" className="h-9 w-9 rounded-full border border-muted flex items-center justify-center text-muted-foreground hover:bg-[#1DA1F2] hover:text-white transition-colors">
                    <Twitter className="h-4 w-4" />
                </button>
                <button type="button" onClick={handleNativeShare} aria-label="Share" className="h-9 w-9 rounded-full border border-muted flex items-center justify-center text-muted-foreground hover:bg-[#25D366] hover:text-white transition-colors">
                    <Share2 className="h-4 w-4" />
                </button>
                <button 
                    type="button"
                    onClick={handleCopyLink}
                    aria-label="Copy link"
                    className="h-9 w-9 rounded-full border border-muted flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                >
                    <Copy className="h-4 w-4" />
                </button>
            </div>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="mt-16 border-t border-[hsl(var(--border))] pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-foreground mb-6">Product Details</h2>
                    <div className="text-base leading-relaxed text-muted-foreground space-y-4">
                        <p>{product.description}</p>
                    </div>
                </div>
                
                <div className="bg-muted/20 rounded-xl p-6 border h-fit">
                    <h3 className="font-bold mb-4">Highlights</h3>
                    <ul className="space-y-3">
                        {product.keyFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>

        {/* Customer Reviews Section */}
        <ReviewsSection 
          productId={product.id} 
          productName={product.title}
          productImage={product.images[0]?.url}
        />

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
            <div className="mt-16 border-t border-[hsl(var(--border))] pt-10 mb-16">
                <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                <HorizontalScroller>
                    {relatedProducts.map((relatedProduct) => (
                        <div key={relatedProduct.id} className="w-[160px] flex-shrink-0 sm:w-[200px] md:w-[240px]">
                            <ProductCard product={relatedProduct} />
                        </div>
                    ))}
                </HorizontalScroller>
            </div>
        )}
      </div>

      {/* Add to Cart Success Modal */}
      <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Added to Cart
            </DialogTitle>
            <DialogDescription>
              {quantity} {quantity === 1 ? 'item' : 'items'} added to your cart successfully!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCartModal(false)}
              className="w-full sm:w-auto"
            >
              Continue Shopping
            </Button>
            <Button
              onClick={() => {
                setShowCartModal(false);
                navigate({ to: '/cart' });
              }}
              className="w-full sm:w-auto"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Go to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
