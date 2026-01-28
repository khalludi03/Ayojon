import { Clock, Zap } from 'lucide-react';
import { DealCard } from './DealCard';
import { HorizontalScroller } from './HorizontalScroller';
import { useTodayDeals } from '@/hooks/use-deals';
import { useDailyCountdown } from '@/hooks/use-countdown';
import { DealCardSkeleton } from '@/components/ui/skeleton';

export function DealsSection() {
  const { data: deals, isLoading } = useTodayDeals(12);
  const countdown = useDailyCountdown();

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--accent))]">
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

          {/* Countdown Timer */}
          <div className="flex items-center gap-2 text-[hsl(var(--accent))]">
            <Clock className="h-5 w-5" />
            <span className="text-sm font-medium">Ends in:</span>
            <div className="flex items-center gap-1 font-mono text-lg font-bold">
              <span className="rounded bg-[hsl(var(--accent))] px-2 py-1 text-white">
                {countdown.hours}
              </span>
              <span>:</span>
              <span className="rounded bg-[hsl(var(--accent))] px-2 py-1 text-white">
                {countdown.minutes}
              </span>
              <span>:</span>
              <span className="rounded bg-[hsl(var(--accent))] px-2 py-1 text-white">
                {countdown.seconds}
              </span>
            </div>
          </div>
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <HorizontalScroller>
            {Array.from({ length: 6 }).map((_, i) => (
              <DealCardSkeleton key={i} />
            ))}
          </HorizontalScroller>
        ) : deals && deals.length > 0 ? (
          <HorizontalScroller>
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </HorizontalScroller>
        ) : (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            No deals available at the moment
          </div>
        )}
      </div>
    </section>
  );
}

export default DealsSection;
