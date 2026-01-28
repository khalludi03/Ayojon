import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-skeleton rounded-md bg-[hsl(var(--muted))]', className)}
      {...props}
    />
  );
}

// Product Card Skeleton
function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-full flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3',
        className
      )}
    >
      {/* Image - Fixed aspect ratio */}
      <Skeleton className="aspect-square w-full flex-shrink-0 rounded-md" />

      {/* Card Content */}
      <div className="flex flex-1 flex-col">
        {/* Badge - Fixed height h-5 */}
        <Skeleton className="mt-3 h-5 w-20" />

        {/* Title - Fixed height h-10 (2 lines) */}
        <div className="mt-2 h-10">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-3/4" />
        </div>

        {/* Rating - Fixed height h-4 */}
        <Skeleton className="mt-2 h-4 w-24" />

        {/* Price - Fixed height h-7 */}
        <Skeleton className="mt-2 h-7 w-20" />

        {/* Shipping - Fixed height h-4 */}
        <Skeleton className="mt-2 h-4 w-28" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Buttons */}
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    </div>
  );
}

// Deal Card Skeleton
function DealCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex h-[340px] w-44 shrink-0 flex-col rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3',
        className
      )}
    >
      {/* Image - Fixed aspect ratio */}
      <Skeleton className="aspect-square w-full shrink-0 rounded-md" />

      {/* Card Content */}
      <div className="flex flex-1 flex-col">
        {/* Badge - Fixed height h-5 */}
        <Skeleton className="mt-2 h-5 w-14" />

        {/* Title - Fixed height h-10 */}
        <div className="mt-2 h-10">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1 h-4 w-2/3" />
        </div>

        {/* Price - Fixed height h-6 */}
        <Skeleton className="mt-2 h-6 w-20" />

        {/* Timer - Fixed height h-4 */}
        <Skeleton className="mt-2 h-4 w-16" />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Button */}
        <Skeleton className="mt-2 h-8 w-full rounded-md" />
      </div>
    </div>
  );
}

// Category Card Skeleton
function CategoryCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      <Skeleton className="h-20 w-20 rounded-full" />
      <Skeleton className="mt-2 h-4 w-16" />
    </div>
  );
}

// Carousel Skeleton
function CarouselSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full', className)}>
      <Skeleton className="h-[200px] w-full rounded-lg md:h-[400px]" />
      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-2 w-2 rounded-full" />
        ))}
      </div>
    </div>
  );
}

// Product Grid Skeleton
function ProductGridSkeleton({
  count = 10,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid auto-rows-fr grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Search Results Skeleton
function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-1 h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export {
  Skeleton,
  ProductCardSkeleton,
  DealCardSkeleton,
  CategoryCardSkeleton,
  CarouselSkeleton,
  ProductGridSkeleton,
  SearchResultsSkeleton,
};
