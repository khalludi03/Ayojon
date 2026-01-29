import { ChevronLeft, ChevronRight, Clock, Zap } from 'lucide-react';
import { useRef } from 'react';
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
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))]">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
                Today's Deals
              </h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Limited time offers - Don't miss out!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Countdown Timer */}
            <div className="flex items-center gap-2 text-[hsl(var(--accent))]">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Ends in:</span>
              <div className="flex items-center gap-1 font-mono text-lg font-bold">
                <span className="rounded bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] px-2 py-1 text-white">
                  {countdown.hours}
                </span>
                <span>:</span>
                <span className="rounded bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] px-2 py-1 text-white">
                  {countdown.minutes}
                </span>
                <span>:</span>
                <span className="rounded bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--primary))] px-2 py-1 text-white">
                  {countdown.seconds}
                </span>
              </div>
            </div>
            <a
              href="/deals"
              className="mr-2 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
            >
              View All
            </a>
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
            : deals && deals.length > 0 ? (
                deals.map((deal) => (
                  <div key={deal.id} className="w-[200px] shrink-0">
                    <ProductCard product={deal} />
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
                  No deals available at the moment
                </div>
              )}
        </div>
      </div>
    </section>
  );
}

export default DealsSection;
