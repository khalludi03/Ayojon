import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Search } from 'lucide-react';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { SortDropdown } from '@/components/product/SortDropdown';
import { ActiveFilters } from '@/components/product/ActiveFilters';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/product/Pagination';
import { NoResults } from '@/components/product/NoResults';
import { useProducts } from '@/hooks/use-products';
import { useFilters, filterStore } from '@/stores/filter-store';
import z from 'zod';

// Define search params schema
const searchParamsSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
});

export const Route = createFileRoute('/products')({
  component: SearchResultsPage,
  validateSearch: searchParamsSchema,
});

function SearchResultsPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const { filters } = useFilters();

  // Get search query from URL or filters
  const searchQuery = searchParams.search || filters.search || '';
  const currentPage = searchParams.page || 1;

  // Update filter store with search query from URL
  useEffect(() => {
    if (searchParams.search && searchParams.search !== filters.search) {
      filterStore.setFilter('search', searchParams.search);
    }
  }, [searchParams.search, filters.search]);

  // Fetch products with pagination
  const { data, isLoading } = useProducts({
    search: searchQuery,
    category: filters.category,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    freeShipping: filters.freeShipping,
    onSale: filters.onSale,
    inStock: filters.inStock,
    sort: filters.sort,
    page: currentPage,
    limit: 20,
  });

  const products = data?.data || [];
  const totalCount = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  // Handle page change
  const handlePageChange = (page: number) => {
    navigate({
      to: '/products',
      search: {
        ...searchParams,
        page,
      },
    });
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    filterStore.clearAllFilters();
    navigate({
      to: '/products',
      search: {
        search: searchQuery,
        page: 1,
      },
    });
  };

  // Check if there are active filters (excluding search and sort)
  const hasActiveFilters =
    filters.category ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating ||
    filters.freeShipping ||
    filters.onSale ||
    filters.inStock;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Search Header */}
      <section className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 sm:h-12 sm:w-12">
              <Search className="h-5 w-5 text-[hsl(var(--primary))] sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0 flex-1">
              {searchQuery ? (
                <>
                  <h1 className="text-xl font-bold text-[hsl(var(--foreground))] sm:text-2xl md:text-3xl">
                    Search Results
                  </h1>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
                    {isLoading ? (
                      'Searching...'
                    ) : (
                      <>
                        Showing{' '}
                        <span className="font-semibold text-[hsl(var(--foreground))]">
                          {totalCount}
                        </span>{' '}
                        {totalCount === 1 ? 'result' : 'results'} for "
                        <span className="font-semibold text-[hsl(var(--foreground))]">
                          {searchQuery}
                        </span>
                        "
                      </>
                    )}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-[hsl(var(--foreground))] sm:text-2xl md:text-3xl">
                    All Products
                  </h1>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
                    {isLoading ? (
                      'Loading products...'
                    ) : (
                      <>
                        Showing{' '}
                        <span className="font-semibold text-[hsl(var(--foreground))]">
                          {totalCount}
                        </span>{' '}
                        {totalCount === 1 ? 'product' : 'products'}
                      </>
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-6 sm:py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="flex gap-6 lg:gap-8">
            {/* Filter Sidebar - Hidden on mobile and tablet */}
            <div className="hidden lg:block lg:w-64 xl:w-72">
              <FilterSidebar />
            </div>

            {/* Products Area */}
            <div className="min-w-0 flex-1">
              {/* Sort & Active Filters */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <ActiveFilters />
                <SortDropdown />
              </div>

              {/* Product Grid or No Results */}
              {!isLoading && products.length === 0 ? (
                <NoResults
                  searchQuery={searchQuery}
                  onClearFilters={hasActiveFilters ? handleClearFilters : undefined}
                />
              ) : (
                <>
                  {/* Product Grid */}
                  <ProductGrid
                    products={products}
                    isLoading={isLoading}
                    skeletonCount={20}
                  />

                  {/* Pagination */}
                  {!isLoading && totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}

                  {/* Results Summary at Bottom */}
                  {!isLoading && products.length > 0 && (
                    <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                      Showing {(currentPage - 1) * 20 + 1}-
                      {Math.min(currentPage * 20, totalCount)} of {totalCount}{' '}
                      {totalCount === 1 ? 'product' : 'products'}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
