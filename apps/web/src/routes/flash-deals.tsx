import { useState, useMemo } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Clock, Zap, Flame, Sparkles, Filter, ArrowUpDown } from 'lucide-react';
import { DealCard } from '@/components/deals/DealCard';
import { useFlashDeals } from '@/hooks/use-deals';
import { useCountdown } from '@/hooks/use-countdown';
import { ProductCardSkeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SORT_OPTIONS } from '@/types/filters';

export const Route = createFileRoute('/flash-deals')({
  component: FlashDealsPage,
});

function FlashDealsPage() {
  const { data: deals, isLoading } = useFlashDeals(40); // Fetch more for the full page
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Use the first deal's end time for the global countdown, or a default (24h from now)
  const globalEndTime = useMemo(() => {
    return deals?.[0]?.dealEndsAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  }, [deals]);

  const countdown = useCountdown(globalEndTime);

  // Derive categories from deals
  const categories = useMemo(() => {
    if (!deals) return [];
    const cats = new Set(deals.map((d) => d.categoryId)); // Assuming categoryId is sufficient, or use category object if available
    return Array.from(cats);
  }, [deals]);

  // Filter and Sort Deals
  const filteredDeals = useMemo(() => {
    if (!deals) return [];

    let result = [...deals];

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((deal) => deal.categoryId === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.pricing.currentPrice - b.pricing.currentPrice);
        break;
      case 'price_desc':
        result.sort((a, b) => b.pricing.currentPrice - a.pricing.currentPrice);
        break;
      case 'rating_desc':
        result.sort((a, b) => b.rating.average - a.rating.average);
        break;
      // Add other sort options if needed
      default:
        // 'relevance' - assume default order is relevant
        break;
    }

    return result;
  }, [deals, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Hero Header with Countdown */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] py-12 text-white sm:py-16 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-7xl px-4 text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Zap className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          
          <h1 className="mb-4 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            FLASH DEALS
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 sm:text-xl">
            Unbeatable prices on event essentials. These deals won't last long, grab them before they're gone!
          </p>

          {/* Countdown Timer */}
          <div className="inline-flex flex-col items-center gap-4 rounded-3xl bg-black/20 backdrop-blur-xl p-6 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-2 text-white/80">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Deals Ending In</span>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-6" suppressHydrationWarning>
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-black text-[hsl(var(--accent))] shadow-lg sm:h-20 sm:w-20 sm:text-4xl">
                  {countdown.hours}
                </div>
                <span className="text-xs font-bold uppercase text-white/80">Hours</span>
              </div>
              <span className="text-3xl font-bold text-white sm:text-4xl">:</span>
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-black text-[hsl(var(--accent))] shadow-lg sm:h-20 sm:w-20 sm:text-4xl">
                  {countdown.minutes}
                </div>
                <span className="text-xs font-bold uppercase text-white/80">Mins</span>
              </div>
              <span className="text-3xl font-bold text-white sm:text-4xl">:</span>
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-black text-[hsl(var(--accent))] shadow-lg sm:h-20 sm:w-20 sm:text-4xl">
                  {countdown.seconds}
                </div>
                <span className="text-xs font-bold uppercase text-white/80">Secs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Bar */}
      <div className="bg-[hsl(var(--card))] border-b border-[hsl(var(--border))] py-4">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Limited Quantities</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span>Verified Quality</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              <Zap className="h-4 w-4 text-[hsl(var(--accent))]" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Flash Deals</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] sm:text-3xl">
              Live Deals
            </h2>
             {!isLoading && (
              <p className="text-sm text-[hsl(var(--muted-foreground))] mt-1">
                Showing {filteredDeals.length} {filteredDeals.length === 1 ? 'deal' : 'deals'}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             {/* Category Filter */}
             <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[160px] h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="capitalize">
                        {cat.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>

             {/* Sort Dropdown */}
             <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[160px] h-9 text-xs sm:text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredDeals.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredDeals.map((deal) => (
              <div key={deal.id} className="transition-transform duration-300 hover:-translate-y-1">
                <DealCard deal={deal} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-[hsl(var(--border))]">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
              <Zap className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
            </div>
            <h3 className="text-xl font-bold text-[hsl(var(--foreground))]">No Deals Found</h3>
            <p className="mt-2 text-[hsl(var(--muted-foreground))]">
              Try adjusting your filters or check back later for new offers.
            </p>
            {selectedCategory !== 'all' && (
              <button 
                onClick={() => setSelectedCategory('all')}
                className="mt-4 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
