import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import type { Product } from "@/types";
import { useWishlist } from "@/stores/wishlist-store";
import { useCart } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  showRemoveButton?: boolean; // For wishlist page - shows Remove button instead of heart
  onRemove?: () => void; // Callback when Remove button is clicked
  className?: string;
}

export function ProductCard({
  product,
  showRemoveButton = false,
  onRemove,
  className,
}: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const inWishlist = isInWishlist(product.id);

  // Handle add to cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();

    try {
      // Add with quantity 1 and first variant if available
      addToCart(product, 1, product.variants?.[0]);
      toast.success("Added to cart");
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  // Handle remove (for wishlist page)
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove?.();
  };

  // Get stock status styling
  const getStockStatusColor = () => {
    switch (product.stockStatus) {
      case "in_stock":
        return "text-green-600";
      case "low_stock":
        return "text-orange-600";
      case "out_of_stock":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStockStatusText = () => {
    switch (product.stockStatus) {
      case "in_stock":
        return "In Stock";
      case "low_stock":
        return `Only ${product.stock} left`;
      case "out_of_stock":
        return "Out of Stock";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      {/* Wishlist/Remove Button - Top Right */}
      <div className="absolute right-2 top-2 z-10 flex gap-2">
        {showRemoveButton ? (
          <Button
            variant="destructive"
            size="icon"
            className="h-9 w-9 rounded-full shadow-sm"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-full shadow-sm transition-colors",
              inWishlist && "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
            )}
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("h-4 w-4", inWishlist && "fill-current")} />
          </Button>
        )}
      </div>

      {/* Product Link - wraps image and details */}
      <Link
        to="/product/$productSlug"
        params={{ productSlug: product.slug }}
        className="flex flex-1 flex-col"
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden rounded-t-xl bg-[hsl(var(--muted))]/30">
          <img
            src={product.images[0]?.url || "/placeholder-product.png"}
            alt={product.images[0]?.alt || product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Badges */}
          {product.badges.length > 0 && (
            <div className="absolute left-2 top-2 flex flex-wrap gap-1">
              {product.badges.map((badge) => (
                <Badge
                  key={badge}
                  variant={badge === "choice" ? "default" : "secondary"}
                  className="text-[10px] uppercase"
                >
                  {badge.replace("_", " ")}
                </Badge>
              ))}
            </div>
          )}

          {/* Discount Badge */}
          {product.pricing.discountPercentage > 0 && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="destructive" className="text-xs font-bold">
                -{product.pricing.discountPercentage}%
              </Badge>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-1 flex-col gap-2 p-4">
          {/* Vendor */}
          <div className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
            <span>{product.vendor.name}</span>
            {product.vendor.isVerified && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                ✓
              </Badge>
            )}
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-sm font-semibold text-[hsl(var(--foreground))] transition-colors group-hover:text-primary">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{product.rating.average.toFixed(1)}</span>
            </div>
            <span className="text-xs text-[hsl(var(--muted-foreground))]">
              ({product.rating.count})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[hsl(var(--foreground))]">
              {formatPrice(product.pricing.currentPrice)}
            </span>
            {product.pricing.discountPercentage > 0 && (
              <span className="text-sm text-[hsl(var(--muted-foreground))] line-through">
                {formatPrice(product.pricing.originalPrice)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <p className={cn("text-xs font-medium", getStockStatusColor())}>
            {getStockStatusText()}
          </p>

          {/* Shipping */}
          {product.shipping.freeShipping && (
            <p className="text-xs font-medium text-green-600">Free Shipping</p>
          )}
        </div>
      </Link>

      {/* Add to Cart Button - Bottom */}
      <div className="border-t border-[hsl(var(--border))] p-3">
        <Button
          className="w-full"
          size="sm"
          onClick={handleAddToCart}
          disabled={product.stockStatus === "out_of_stock"}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.stockStatus === "out_of_stock" ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
