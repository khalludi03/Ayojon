import { createFileRoute, notFound, Link, useNavigate } from '@tanstack/react-router';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ReviewsSection } from '@/components/product/ReviewsSection';
import { ProductDescription } from '@/components/product/ProductDescription';
import type { Product } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockDb } from '@/mock/db';
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
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { HorizontalScroller } from '@/components/deals/HorizontalScroller';
import { ProductCard } from '@/components/product/ProductCard';

export const Route = createFileRoute('/product/$productSlug')({
  component: ProductDetailPage,
  // Load data before rendering if possible, or handle in component
  loader: async ({ params }) => {
    // Ensure DB is initialized
    await mockDb.init();
    const product = mockDb.getProductBySlug(params.productSlug);
    if (!product) {
       throw notFound();
    }
    const relatedProducts = mockDb.getRelatedProducts(product.id, 8);
    return { product, relatedProducts };
  },
  notFoundComponent: () => {
    return (
        <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="text-muted-foreground">The product you are looking for does not exist.</p>
            <Link to="/products">
                <Button variant="outline">Browse Products</Button>
            </Link>
        </div>
    );
  }
});

function ProductDetailPage() {
  const { product, relatedProducts } = Route.useLoaderData();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

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
        
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="capitalize">{product.categoryId}</span>
            <span className="mx-2">/</span>
            <span className="font-medium text-foreground line-clamp-1">{product.title}</span>
        </nav>

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
                <div className="flex items-center">
                    <div className="flex items-center text-yellow-400">
                        <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    </div>
                    <span className="ml-1 text-sm font-bold">{product.rating.average}</span>
                    <span className="ml-1 text-sm text-muted-foreground font-medium">★ ({product.rating.count} reviews)</span>
                </div>
                
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                    <status.icon className="w-3.5 h-3.5 mr-1" />
                    {status.label}
                </div>
            </div>

            {/* Price & Delivery */}
            <div className="space-y-4 mb-8">
                <div className="rounded-lg border bg-card p-5 shadow-sm">
                    <div className="flex items-end gap-3 flex-wrap">
                        <span className="text-4xl font-bold text-foreground">
                            {product.pricing.currencySymbol}{product.pricing.currentPrice.toLocaleString()}
                        </span>
                        {product.pricing.discountPercentage > 0 && (
                            <>
                                <span className="text-xl text-muted-foreground line-through">
                                    {product.pricing.currencySymbol}{product.pricing.originalPrice.toLocaleString()}
                                </span>
                                <Badge variant="destructive" className="mb-1">
                                    -{product.pricing.discountPercentage}% OFF
                                </Badge>
                            </>
                        )}
                    </div>
                    
                    {product.pricing.discountPercentage > 0 && (
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
                            <Link to="/products" className="font-semibold text-sm hover:underline">{product.vendor.name}</Link>
                            {product.vendor.isVerified && (
                                <CheckCircle className="h-3.5 w-3.5 text-blue-500" fill="currentColor" />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">Storefront</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                    <Link to="/products">Visit Store</Link>
                </Button>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                    size="lg" 
                    className="flex-1 h-14 text-lg gap-2" 
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart}
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
                    disabled={isOutOfStock || isBuyingNow}
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
                    <ProductDescription product={product} />
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
        {/* Customer Reviews Section */}
        <ReviewsSection productId={product.id} hasPurchased={false} />
      </div>
    </div>
  );
}

export default ProductDetailPage;
