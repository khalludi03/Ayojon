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
    <section className="bg-[radial-gradient(70%_40%_at_50%_0%,hsla(12,85%,55%,0.12)_0%,transparent_70%)] py-6 sm:py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-card)] sm:p-6 md:p-8">
          {/* Section Header */}
          <div className="mb-6 flex items-center gap-2 sm:mb-8 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] sm:h-12 sm:w-12">
              <Sparkles className="h-5 w-5 text-white sm:h-6 sm:w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] bg-clip-text text-transparent sm:text-2xl">
                Featured Products
              </h2>
              <p className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                Discover trending and recommended items
              </p>
            </div>
          </div>

        {/* Product Grid - Responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop, 5 cols xl */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
              {Array.from({ length: 20 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
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
              <p className="mt-4 text-center text-xs text-[hsl(var(--muted-foreground))] sm:mt-6 sm:text-sm">
                Showing {displayedProducts.length} of {allFeaturedProducts?.length || 0} featured products
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
