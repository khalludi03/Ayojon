import { useState } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  
  const { 
    title, 
    vendor, 
    pricing, 
    rating, 
    description, 
    keyFeatures, 
    stock, 
    stockStatus, 
    id, 
    categoryId 
  } = product;

  const { currentPrice, originalPrice, currencySymbol, discountPercentage } = pricing;
  const savings = originalPrice - currentPrice;
  const isLowStock = stock < 10 && stock > 0;
  const isOutOfStock = stockStatus === 'out_of_stock' || stock === 0;

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(1);
      return;
    }
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= 1) {
      setQuantity(Math.min(numValue, stock));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <div className="mt-2 text-sm text-muted-foreground">
            Sold by <span className="font-medium text-foreground">{vendor.name}</span>
            {vendor.isVerified && (
                <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-800">✓</span>
            )}
        </div>
      </div>

      {/* Pricing Section */}
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-foreground">
                {currencySymbol}{currentPrice.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
                (Incl. VAT)
            </span>
        </div>
        
        {discountPercentage > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-lg text-muted-foreground line-through">
                    {currencySymbol}{originalPrice.toLocaleString()}
                </span>
                <Badge variant="destructive" className="uppercase">
                    {discountPercentage}% OFF
                </Badge>
                <span className="text-sm font-medium text-green-600">
                    You save {currencySymbol}{savings.toLocaleString()}
                </span>
            </div>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center">
        <div className="flex items-center">
            {[0, 1, 2, 3, 4].map((r) => (
                <svg
                    key={r}
                    className={`h-5 w-5 flex-shrink-0 ${
                        rating.average > r ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        fillRule="evenodd"
                        d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                        clipRule="evenodd"
                    />
                </svg>
            ))}
        </div>
        <p className="ml-2 text-sm text-muted-foreground">
            {rating.average} ({rating.count} reviews)
        </p>
      </div>

      <p className="text-base text-muted-foreground">{description}</p>

      {/* Quantity & Stock */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
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
                    max={stock}
                    value={quantity}
                    onChange={handleQuantityChange}
                    disabled={isOutOfStock}
                    className="h-9 w-12 border-x text-center text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 rounded-none" 
                    onClick={handleIncrement}
                    disabled={quantity >= stock || isOutOfStock}
                    type="button"
                >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Increase quantity</span>
                </Button>
            </div>
            <span className="text-sm text-muted-foreground">
                {isOutOfStock ? '0' : stock} available
            </span>
        </div>

        {isLowStock && (
            <p className="text-sm font-medium text-red-600 animate-pulse">
                Only {stock} items left! Order soon.
            </p>
        )}
        
        {!isLowStock && stockStatus === 'in_stock' && (
             <p className="text-sm font-medium text-green-600">
                In Stock
            </p>
        )}
        
        {isOutOfStock && (
             <p className="text-sm font-medium text-destructive">
                Out of Stock
            </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1 gap-2" disabled={isOutOfStock}>
            <ShoppingCart className="h-5 w-5" />
            Add to Cart
        </Button>
        <Button size="lg" variant="secondary" className="flex-1 gap-2" disabled={isOutOfStock}>
            Buy Now
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-4 border-t pt-4 text-xs text-muted-foreground space-y-1">
         <div className="flex justify-between">
            <span>SKU:</span>
            <span className="font-medium text-foreground">{id.split('-').pop()}</span>
         </div>
         <div className="flex justify-between">
            <span>Category:</span>
            <span className="font-medium text-foreground capitalize">{categoryId}</span>
         </div>
      </div>
      
      {/* Key Features */}
        {keyFeatures && keyFeatures.length > 0 && (
            <div className="mt-4">
                <h3 className="text-sm font-medium text-foreground mb-2">Highlights</h3>
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {keyFeatures.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                    ))}
                </ul>
            </div>
        )}
    </div>
  );
}
