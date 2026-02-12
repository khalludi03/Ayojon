import { createFileRoute, useNavigate, notFound } from '@tanstack/react-router';
import { useEffect } from 'react';
import { CategoryBanner } from '@/components/categories/CategoryBanner';
import { CategoryDescription } from '@/components/categories/CategoryDescription';
import { SubcategoryFilter } from '@/components/categories/SubcategoryFilter';
import { RelatedCategories } from '@/components/categories/RelatedCategories';
import { FilterSidebar } from '@/components/product/FilterSidebar';
import { SortDropdown } from '@/components/product/SortDropdown';
import { ActiveFilters } from '@/components/product/ActiveFilters';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/product/Pagination';
import { NoResults } from '@/components/product/NoResults';
import { useCategoryBySlug } from '@/hooks/use-categories';
import { useProducts } from '@/hooks/use-products';
import { useFilters, filterStore } from '@/stores/filter-store';
import { orpcClient } from '@/utils/orpc';
import z from 'zod';

const searchParamsSchema = z.object({
  page: z.coerce.number().optional().default(1),
  subcategory: z.string().optional(),
});

export const Route = createFileRoute('/category/$categorySlug')({
  component: CategoryPage,
  validateSearch: searchParamsSchema,
  loader: async ({ params }) => {
    const category = await orpcClient.product.getCategoryBySlug({ slug: params.categorySlug });
    return { category };
  },
  head: ({ loaderData, params }) => {
    const category = loaderData?.category;
    if (!category) {
      return {
        meta: [
          { title: 'Category Not Found - Ayojon' },
          { name: 'description', content: 'The category you are looking for could not be found.' },
        ],
      };
    }

    const title = `${category.name} - Event Rentals | Ayojon`;
    const description = category.description || `Browse ${category.name} for your next event. Quality rentals available at Ayojon marketplace.`;
    const url = `https://ayojon.com/category/${params.categorySlug}`;

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'keywords', content: `${category.name}, event rental, ${category.name} rental, Ayojon` },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Ayojon' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [
        { rel: 'canonical', href: url },
      ],
    };
  },
});

function CategoryPage() {
  const navigate = useNavigate();
  const { categorySlug } = Route.useParams();
  const searchParams = Route.useSearch();
  const { filters } = useFilters();

  // Fetch category data
  const { data: category, isLoading: isCategoryLoading } = useCategoryBySlug(categorySlug);

  // Handle 404 if category not found
  useEffect(() => {
    if (!isCategoryLoading && !category) {
      throw notFound();
    }
  }, [category, isCategoryLoading]);

  const currentPage = searchParams.page || 1;
  const activeSubcategoryId = searchParams.subcategory || filters.subcategory;

  const activeSubcategory = category?.subcategories?.find(s => s.id === activeSubcategoryId);

  const displayCategory = category ? (activeSubcategory ? {
    ...category,
    name: activeSubcategory.name,
    description: `Explore our extensive collection of ${activeSubcategory.name}. Part of our ${category.name} selection.`,
  } : category) : null;

  // Update filter store with category ID when component mounts or category changes
  useEffect(() => {
    if (category && filters.category !== category.id) {
      filterStore.setFilter('category', category.id);
    }
  }, [category, filters.category]);

  // Update subcategory filter from URL
  useEffect(() => {
    if (searchParams.subcategory && searchParams.subcategory !== filters.subcategory) {
      filterStore.setFilter('subcategory', searchParams.subcategory);
    } else if (!searchParams.subcategory && filters.subcategory) {
      filterStore.clearFilter('subcategory');
    }
  }, [searchParams.subcategory, filters.subcategory]);

  // Fetch products with pagination and filters
  const { data, isLoading: isProductsLoading } = useProducts({
    category: category?.id,
    subcategory: activeSubcategoryId,
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

  // Debug logging
  useEffect(() => {
    if (activeSubcategoryId) {
      console.log(`[CategoryPage] Active subcategory: ${activeSubcategoryId}`, {
        categoryId: category?.id,
        productsCount: products.length,
      });
    }
  }, [activeSubcategoryId, category?.id, products.length]);

  // Handle page change
  const handlePageChange = (page: number) => {
    navigate({
      to: '/category/$categorySlug',
      params: { categorySlug },
      search: {
        ...searchParams,
        page,
      },
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle subcategory change
  const handleSubcategoryChange = (subcategoryId: string | undefined) => {
    filterStore.setFilter('subcategory', subcategoryId);
    navigate({
      to: '/category/$categorySlug',
      params: { categorySlug },
      search: {
        ...searchParams,
        subcategory: subcategoryId,
        page: 1, // Reset to first page when changing subcategory
      },
    });
  };

  // Handle clear all filters
  const handleClearFilters = () => {
    // Keep category and subcategory, clear other filters
    const categoryId = category?.id;
    filterStore.clearAllFilters();
    if (categoryId) {
      filterStore.setFilter('category', categoryId);
    }
    if (activeSubcategoryId) {
      filterStore.setFilter('subcategory', activeSubcategoryId);
    }
    navigate({
      to: '/category/$categorySlug',
      params: { categorySlug },
      search: {
        subcategory: activeSubcategoryId,
        page: 1,
      },
    });
  };

  // Check if there are active filters (excluding category and subcategory)
  const hasActiveFilters =
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.minRating ||
    filters.freeShipping ||
    filters.onSale ||
    filters.inStock;

  // Show loading state
  if (isCategoryLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </div>
    );
  }

  // Category not found
  if (!category || !displayCategory) {
    return null; // notFound will be thrown in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Category Banner */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <CategoryBanner category={displayCategory} />
        </div>
      </section>

      {/* Category Description */}
      {displayCategory.description && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <CategoryDescription description={displayCategory.description} />
          </div>
        </section>
      )}

      {/* Subcategory Filter */}
      {category.subcategories && category.subcategories.length > 0 && (
        <section className="border-b border-border bg-card">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <SubcategoryFilter
              subcategories={category.subcategories}
              activeSubcategoryId={activeSubcategoryId}
              onSubcategoryChange={handleSubcategoryChange}
            />
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-20">
              <FilterSidebar />
            </div>
          </aside>

          {/* Products Section */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Results Count */}
              <div className="text-sm text-muted-foreground">
                {isProductsLoading ? (
                  <span>Loading...</span>
                ) : (
                  <span>
                    Showing {products.length > 0 ? ((currentPage - 1) * 20) + 1 : 0}-
                    {Math.min(currentPage * 20, totalCount)} of {totalCount} results
                  </span>
                )}
              </div>

              {/* Sort Dropdown */}
              <SortDropdown />
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="mb-6">
                <ActiveFilters onClearAll={handleClearFilters} />
              </div>
            )}

            {/* Products Grid */}
            {isProductsLoading ? (
              <ProductGrid products={[]} isLoading={true} />
            ) : products.length > 0 ? (
              <>
                <ProductGrid products={products} isLoading={false} />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <NoResults />
            )}
          </main>
        </div>
      </div>

      {/* Related Categories */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <RelatedCategories currentCategoryId={category.id} />
        </div>
      </section>
    </div>
  );
}
