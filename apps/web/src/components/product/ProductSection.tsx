import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  products: Array<Product>;
  isLoading?: boolean;
  viewAllLink?: string;
  className?: string;
}

export function ProductSection({
  title,
  subtitle,
  icon,
  products,
  isLoading,
  viewAllLink,
  className,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className={cn('py-6', className)}>
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white">
                {icon}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {viewAllLink && (
              <a
                href={viewAllLink}
                className="mr-2 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
              >
                View All
              </a>
            )}
            <button
              onClick={() => scroll('left')}
              className="rounded-full border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--muted))]"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="rounded-full border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--muted))]"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scroll Container */}
        <div
          ref={scrollRef}
          className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2"
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-[200px] shrink-0">
                  <ProductCardSkeleton />
                </div>
              ))
            : products.map((product) => (
                <div key={product.id} className="w-[200px] shrink-0">
                  <ProductCard product={product} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

export default ProductSection;
