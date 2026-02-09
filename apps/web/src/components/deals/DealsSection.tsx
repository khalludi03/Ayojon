import { ChevronLeft, ChevronRight, Clock, Zap } from 'lucide-react';
import { useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { ProductCard } from '../product/ProductCard';
import { useTodayDeals } from '@/hooks/use-deals';
import { useDailyCountdown } from '@/hooks/use-countdown';
import { ProductCardSkeleton } from '@/components/ui/skeleton';

export function DealsSection() {
  const { data: deals, isLoading } = useTodayDeals(12);
  const countdown = useDailyCountdown();
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
    <section className="bg-[radial-gradient(70%_40%_at_50%_0%,hsla(40,95%,55%,0.12)_0%,transparent_70%)] py-5 sm:py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-card)] sm:p-5 md:p-6">
          {/* Section Header */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] sm:h-10 sm:w-10">
                <Zap className="h-4 w-4 text-white sm:h-5 sm:w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
                  Today's Deals
                </h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                  Limited time offers - Don't miss out!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Countdown Timer */}
              <div className="flex items-center gap-1.5 text-[hsl(var(--accent))] sm:gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden text-sm font-medium sm:inline">Ends in:</span>
                <div className="flex items-center gap-0.5 font-mono text-sm font-bold sm:gap-1 sm:text-base lg:text-lg" suppressHydrationWarning>
                  <span className="rounded bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] px-1.5 py-0.5 text-white sm:px-2 sm:py-1" suppressHydrationWarning>
                    {countdown.hours}
                  </span>
                  <span className="text-xs sm:text-base">:</span>
                  <span className="rounded bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] px-1.5 py-0.5 text-white sm:px-2 sm:py-1" suppressHydrationWarning>
                    {countdown.minutes}
                  </span>
                  <span className="text-xs sm:text-base">:</span>
                  <span className="rounded bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] px-1.5 py-0.5 text-white sm:px-2 sm:py-1" suppressHydrationWarning>
                    {countdown.seconds}
                  </span>
                </div>
              </div>
              <Link
                to="/hot-deals"
                className="hidden text-sm font-medium text-[hsl(var(--primary))] hover:underline sm:inline"
              >
                View All
              </Link>
              <button
                onClick={() => scroll('left')}
                className="hidden rounded-full border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--muted))] sm:block"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden rounded-full border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--muted))] sm:block"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div
            ref={scrollRef}
            className="scrollbar-hide -mx-2 flex gap-2 overflow-x-auto px-2 pb-2 sm:-mx-4 sm:gap-3 sm:px-4 md:gap-4"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="w-[165px] shrink-0 sm:w-[175px] md:w-[185px] lg:w-[190px]">
                    <ProductCardSkeleton />
                  </div>
                ))
              : deals && deals.length > 0 ? (
                  deals.map((deal) => (
                    <div key={deal.id} className="w-[165px] shrink-0 sm:w-[175px] md:w-[185px] lg:w-[190px]">
                      <ProductCard product={deal} />
                    </div>
                  ))
                ) : (
                  <div className="w-full py-12 text-center text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
                    No deals available at the moment
                  </div>
                )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DealsSection;
