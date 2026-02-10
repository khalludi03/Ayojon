import { Link, useNavigate } from '@tanstack/react-router';
import type { Vendor, Product, SortOption } from '@/types';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Star, Clock, Package, CheckCircle, MapPin, Calendar, Share2, MessageCircle, ChevronDown, ChevronUp, Search, SlidersHorizontal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/product/Pagination';
import { ActiveFilters } from '@/components/product/ActiveFilters';
import { SortDropdown } from '@/components/product/SortDropdown';
import { useFilters } from '@/stores/filter-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface VendorStorePageProps {
  vendor: Vendor;
  initialCategoryIds?: string[];
  initialSort?: SortOption;
}

export function VendorStorePage({ vendor, initialCategoryIds, initialSort }: VendorStorePageProps) {
  const navigate = useNavigate();
  const { filters, setFilter, clearAllFilters, activeFilterCount } = useFilters();
  const { data: allCategories } = useCategories();
  
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const itemsPerPage = 24;

  // Initialize filters from URL on mount
  useEffect(() => {
    if (initialCategoryIds && initialCategoryIds.length > 0) {
      setFilter('categoryIds', initialCategoryIds);
    } else {
      setFilter('categoryIds', undefined);
    }

    if (initialSort) {
      setFilter('sort', initialSort);
    } else {
      setFilter('sort', 'created_desc'); // Default: Newest First
    }

    // Also ensure we are filtering by this vendor
    setFilter('vendorIds', [vendor.id]);
  }, [initialCategoryIds, initialSort, vendor.id, setFilter]);

  // Sync filters to URL
  useEffect(() => {
    const categoryParam = filters.categoryIds && filters.categoryIds.length > 0 
      ? filters.categoryIds 
      : undefined;
      
    void navigate({
      to: '/vendor/$vendorId',
      params: { vendorId: vendor.slug || vendor.id },
      search: {
        category: categoryParam,
        sort: filters.sort === 'created_desc' ? undefined : filters.sort,
      },
      replace: true,
    });
  }, [filters.categoryIds, filters.sort, vendor.id, navigate]);

  // Fetch products for current page with filters
  const { data: productsData, isLoading: isProductsLoading } = useProducts({
    vendorIds: [vendor.id],
    categoryIds: filters.categoryIds,
    sort: filters.sort,
    page: currentPage,
    limit: itemsPerPage,
  });

  // Fetch all vendor products (no pagination) to calculate category counts
  const { data: allVendorProductsData } = useProducts({
    vendorIds: [vendor.id],
    limit: 1000,
  });

  const products = productsData?.data || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = productsData?.totalPages || 0;

  // Calculate vendor-specific categories and their counts
  const vendorCategories = useMemo(() => {
    if (!allVendorProductsData?.data || !allCategories) return [];

    const counts: Record<string, number> = {};
    allVendorProductsData.data.forEach((p: Product) => {
      counts[p.categoryId] = (counts[p.categoryId] || 0) + 1;
    });

    return allCategories
      .filter(c => counts[c.id])
      .map(c => ({
        ...c,
        vendorProductCount: counts[c.id]
      }))
      .sort((a, b) => b.vendorProductCount - a.vendorProductCount);
  }, [allVendorProductsData, allCategories]);

  const formattedJoinedDate = useMemo(() => new Date(vendor.joinedAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  }), [vendor.joinedAt]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Store link copied!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const toggleCategory = (categoryId: string) => {
    const current = filters.categoryIds || [];
    const updated = current.includes(categoryId)
      ? current.filter(id => id !== categoryId)
      : [...current, categoryId];
    
    setFilter('categoryIds', updated.length > 0 ? updated : undefined);
    setCurrentPage(1); // Reset to first page on filter change
  };

  const whatsappUrl = vendor.phone 
    ? `https://wa.me/88${vendor.phone.replace(/^0/, '')}?text=${encodeURIComponent("Hi, I'm interested in your products on Ayojon")}`
    : '#';

  const isLongDescription = (vendor.description?.length || 0) > 150;
  const displayDescription = isLongDescription && !isDescriptionExpanded
    ? `${vendor.description?.slice(0, 150)}...`
    : vendor.description;

  const FilterContent = () => (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Categories</h3>
          {filters.categoryIds && filters.categoryIds.length > 0 && (
            <button 
              onClick={() => setFilter('categoryIds', undefined)}
              className="text-xs font-bold text-primary hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {vendorCategories.map((category) => {
            const isSelected = filters.categoryIds?.includes(category.id);
            return (
              <label
                key={category.id}
                className={cn(
                  "group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 transition-colors",
                  isSelected ? "bg-primary/10 text-primary" : "hover:bg-[hsl(var(--muted))]/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-5 w-5 items-center justify-center rounded border transition-colors",
                    isSelected ? "border-primary bg-primary text-white" : "border-[hsl(var(--border))] bg-background group-hover:border-primary/50"
                  )}>
                    {isSelected && <CheckCircle className="h-3.5 w-3.5" />}
                  </div>
                  <span className="text-sm font-medium">{category.name}</span>
                </div>
                <span className={cn(
                  "text-xs font-bold",
                  isSelected ? "text-primary" : "text-[hsl(var(--muted-foreground))]"
                )}>
                  {category.vendorProductCount}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => toggleCategory(category.id)}
                />
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] pb-24 sm:pb-12">
      {/* Breadcrumbs */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 py-3 sm:py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="text-xs transition-colors hover:text-primary sm:text-sm">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/products" className="text-xs transition-colors hover:text-primary sm:text-sm">Vendors</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-xs font-semibold text-[hsl(var(--foreground))] sm:text-sm">{vendor.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Branded Header with Banner */}
      <div className="relative w-full">
        <div className="relative h-40 w-full overflow-hidden sm:h-64 md:h-80">
          {vendor.bannerUrl ? (
            <img 
              src={vendor.bannerUrl} 
              alt={`${vendor.name} banner`} 
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700" />
          )}
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="relative z-10 flex flex-col items-center sm:flex-row sm:items-end sm:gap-8">
            <div className="relative -mt-12 sm:-mt-20 md:-mt-24">
              <div className="rounded-full bg-[hsl(var(--background))] p-1.5 shadow-xl md:p-2">
                <Avatar className="h-24 w-24 border-2 border-[hsl(var(--border))] sm:h-32 sm:w-32 md:h-40 md:w-40">
                  <AvatarImage src={vendor.logoUrl} alt={vendor.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/5 text-2xl font-black text-primary sm:text-4xl md:text-5xl">
                    {vendor.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {vendor.isVerified && (
                <div className="absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-md ring-2 ring-[hsl(var(--background))] sm:h-8 sm:w-8 md:bottom-4 md:right-4">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              )}
            </div>

            <div className="flex-1 pb-2 pt-4 text-center sm:pt-0 sm:text-left">
              <div className="mb-3 space-y-1">
                <h1 className="text-3xl font-black tracking-tighter text-[hsl(var(--foreground))] sm:text-4xl md:text-5xl">
                  {vendor.name}
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-medium text-[hsl(var(--muted-foreground))] sm:justify-start sm:text-base">
                  <div className="flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-2.5 py-0.5 text-yellow-600 dark:bg-yellow-400/5">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-bold text-yellow-700">{vendor.rating}</span>
                    <span className="text-xs sm:text-sm">({vendor.reviewCount} reviews)</span>
                  </div>
                  <span className="hidden opacity-30 sm:inline">|</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    <span>{vendor.location}</span>
                  </div>
                  <span className="hidden opacity-30 sm:inline">|</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary/70" />
                    <span>Joined {formattedJoinedDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
                <Button 
                  asChild 
                  className="h-11 gap-2 rounded-xl px-6 font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-primary/30 active:translate-y-0"
                  disabled={!vendor.phone}
                >
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-5 w-5" />
                    Contact Vendor
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="h-11 gap-2 rounded-xl border-2 px-6 font-bold transition-all hover:-translate-y-0.5 hover:bg-primary/5 hover:text-primary active:translate-y-0"
                >
                  <Share2 className="h-5 w-5" />
                  Share Store
                </Button>
              </div>
            </div>

            <div className="hidden items-end gap-4 pb-2 lg:flex">
              <div className="flex items-center gap-4 rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 shadow-sm transition-colors hover:border-primary/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black leading-tight">{vendor.productCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Products</p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-2xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 shadow-sm transition-colors hover:border-primary/30">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-black leading-tight text-success">{vendor.responseTime || 'N/A'}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Resp. Time</p>
                </div>
              </div>
            </div>
          </div>

          {vendor.description && (
            <div className="mt-8 border-t border-[hsl(var(--border))] pt-8">
              <div className="max-w-4xl">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">About this Store</h2>
                <div className="relative">
                  <p className="text-base leading-relaxed text-[hsl(var(--foreground))]/80 md:text-lg whitespace-pre-line">
                    {displayDescription}
                  </p>
                  {isLongDescription && (
                    <button 
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-primary transition-colors hover:text-primary/80"
                    >
                      {isDescriptionExpanded ? (
                        <>Show less info <ChevronUp className="h-4 w-4" /></>
                      ) : (
                        <>Read full description <ChevronDown className="h-4 w-4" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Desktop Sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-24 space-y-8 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[hsl(var(--border))] pb-4">
                <SlidersHorizontal className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-black tracking-tight">Filter Catalog</h2>
              </div>
              <FilterContent />
            </div>
          </aside>

          {/* Main Products Grid */}
          <main className="flex-1">
            <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-end">
              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight sm:text-3xl">Vendor Products</h2>
                <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">
                  Showing {products.length} of {totalProducts} products
                </p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Mobile Filter Trigger */}
                <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="h-10 gap-2 rounded-xl border-2 font-bold lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                      {activeFilterCount > 0 && (
                        <Badge className="ml-1 h-5 w-5 items-center justify-center rounded-full p-0">
                          {activeFilterCount}
                        </Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl p-6">
                    <SheetHeader className="mb-6">
                      <div className="flex items-center justify-between">
                        <SheetTitle className="text-2xl font-black">Filters</SheetTitle>
                        {activeFilterCount > 0 && (
                          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="font-bold text-primary">
                            Clear All
                          </Button>
                        )}
                      </div>
                    </SheetHeader>
                    <div className="overflow-y-auto pb-12">
                      <FilterContent />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4">
                      <Button className="w-full rounded-xl font-bold" size="lg" onClick={() => setIsMobileFilterOpen(false)}>
                        Apply Filters
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort Dropdown - Responsive handling via className */}
                <div className="w-full sm:w-auto">
                  <SortDropdown />
                </div>

                <div className="hidden rounded-full bg-[hsl(var(--muted))]/50 px-4 py-1.5 text-sm font-bold text-[hsl(var(--foreground))] sm:block">
                  {isProductsLoading ? (
                    <span className="animate-pulse">Loading collection...</span>
                  ) : (
                    <span>
                      Showing {products.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0}-
                      {Math.min(currentPage * itemsPerPage, totalProducts)} of {totalProducts} products
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Active Filter Tags */}
            <div className="mb-6">
              <ActiveFilters />
            </div>

            {isProductsLoading ? (
              <ProductGrid products={[]} isLoading={true} skeletonCount={8} />
            ) : products.length > 0 ? (
              <>
                <ProductGrid 
                  products={products} 
                  isLoading={false} 
                  className="grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                />
                <div className="mt-16">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[hsl(var(--border))] py-24 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]/40">
                  <Search className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black">No matching products</h3>
                <p className="max-w-xs text-[hsl(var(--muted-foreground))]">
                  We couldn't find any products in this category. Try clearing your filters.
                </p>
                <Button onClick={clearAllFilters} className="mt-8 rounded-xl font-bold" variant="outline" size="lg">
                  Clear All Filters
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Sticky Mobile Contact Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]/80 p-4 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md lg:hidden">
        <Button 
          asChild 
          size="lg"
          className="h-12 w-full gap-2 rounded-xl font-bold shadow-lg shadow-primary/20"
          disabled={!vendor.phone}
        >
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" />
            Contact Vendor
          </a>
        </Button>
      </div>
    </div>
  );
}
