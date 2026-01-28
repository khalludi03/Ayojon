import { ProductCard } from './ProductCard';
import type { Product } from '@/types';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Array<Product>;
  isLoading?: boolean;
  skeletonCount?: number;
  className?: string;
}

export function ProductGrid({
  products,
  isLoading,
  skeletonCount = 10,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
          className
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-lg font-medium text-[hsl(var(--foreground))]">
          No products found
        </p>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default ProductGrid;
