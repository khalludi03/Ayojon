import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, ShoppingCart, Trash2, ArrowUpDown } from "lucide-react";
import { useWishlist } from "@/stores/wishlist-store";
import { useCart } from "@/stores/cart-store";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type SortOption = "recent" | "price-low" | "price-high";

export function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  // Sort wishlist items based on selected option
  const sortedItems = useMemo(() => {
    const itemsCopy = [...items];

    switch (sortBy) {
      case "recent":
        // Most recently added first
        return itemsCopy.sort(
          (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        );

      case "price-low":
        // Lowest price first
        return itemsCopy.sort(
          (a, b) => a.product.pricing.currentPrice - b.product.pricing.currentPrice
        );

      case "price-high":
        // Highest price first
        return itemsCopy.sort(
          (a, b) => b.product.pricing.currentPrice - a.product.pricing.currentPrice
        );

      default:
        return itemsCopy;
    }
  }, [items, sortBy]);

  // Move all items to cart
  const handleMoveAllToCart = () => {
    if (items.length === 0) return;

    let successCount = 0;
    items.forEach((item) => {
      try {
        // Add to cart with quantity 1 and first variant if available
        addToCart(item.product, 1, item.product.variants?.[0]);
        removeItem(item.productId);
        successCount++;
      } catch (error) {
        console.error("Failed to add item to cart:", error);
      }
    });

    if (successCount > 0) {
      toast.success(`Moved ${successCount} item(s) to cart`);
    }
  };

  // Empty wishlist state
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-dashed border-[hsl(var(--border))] p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--muted))]/40">
            <Heart className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Your wishlist is empty</h2>
            <p className="text-[hsl(var(--muted-foreground))]">
              Save items you love to view them here later.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/products">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Explore Products
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Wishlist</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-2">
          {items.length} {items.length === 1 ? "item" : "items"} saved
        </p>
      </div>

      {/* Controls Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recently Added</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Move All to Cart Button */}
        {items.length > 1 && (
          <Button onClick={handleMoveAllToCart} variant="outline">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Move All to Cart
          </Button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedItems.map((item) => (
          <ProductCard
            key={item.id}
            product={item.product}
            showRemoveButton
            onRemove={() => removeItem(item.productId)}
          />
        ))}
      </div>
    </div>
  );
}
