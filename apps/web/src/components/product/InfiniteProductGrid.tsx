import { Loader2 } from 'lucide-react'
import { ProductGrid } from './ProductGrid'
import { useInfiniteProducts } from '@/hooks/use-products'
import { useFilters } from '@/stores/filter-store'
import { Button } from '@/components/ui/button'

export function InfiniteProductGrid() {
  const { filters } = useFilters()

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteProducts({
      category: filters.category,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      minRating: filters.minRating,
      freeShipping: filters.freeShipping,
      onSale: filters.onSale,
      inStock: filters.inStock,
      search: filters.search,
      sort: filters.sort,
      limit: 20, // Fixed limit of 20 per page
    })

  // Flatten all pages of products
  const allProducts = data?.pages.flatMap((page) => page.data) || []
  const totalCount = data?.pages[0]?.total || 0
  const currentPage = data?.pages.length || 1
  const totalPages = data?.pages[0]?.totalPages || 1

  return (
    <div>
      {/* Results Count */}
      {!isLoading && (
        <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
          Showing {allProducts.length} of {totalCount} products (Page{' '}
          {currentPage} of {totalPages})
        </p>
      )}

      {/* Product Grid */}
      <ProductGrid
        products={allProducts}
        isLoading={isLoading}
        skeletonCount={20}
      />

      {/* Load More Button */}
      <div className="mt-8 flex flex-col items-center gap-2">
        {hasNextPage && (
          <Button
            variant="outline"
            size="lg"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="min-w-[200px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Products'
            )}
          </Button>
        )}
        {!hasNextPage && allProducts.length > 0 && (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            You've reached the end ({totalCount} products)
          </p>
        )}
      </div>
    </div>
  )
}

export default InfiniteProductGrid
