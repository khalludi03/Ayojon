import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useFeaturedProducts } from '@/hooks/use-products';

export function FeaturedProductsSection() {
  const [displayLimit, setDisplayLimit] = useState(20);
  const { data: allFeaturedProducts, isLoading } = useFeaturedProducts(40); // Fetch more for load more functionality

  // Get products to display based on current limit
  const displayedProducts = allFeaturedProducts?.slice(0, displayLimit) || [];
  const hasMore = allFeaturedProducts && allFeaturedProducts.length > displayLimit;

  const handleLoadMore = () => {
    setDisplayLimit((prev) => Math.min(prev + 20, allFeaturedProducts?.length || 0));
  };

  return (
    <section className="py-10 bg-[hsl(var(--muted))]">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--primary))]">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Featured Products
            </h2>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Discover trending and recommended items
            </p>
          </div>
        </div>

        {/* Product Grid - 4 columns desktop, 2 columns mobile */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 20 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 flex justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleLoadMore}
                  className="min-w-[200px]"
                >
                  <Loader2 className="mr-2 h-4 w-4" />
                  Load More Products
                </Button>
              </div>
            )}

            {/* Results Info */}
            <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Showing {displayedProducts.length} of {allFeaturedProducts?.length || 0} featured products
            </p>
          </>
        )}
      </div>
    </section>
  );
}
