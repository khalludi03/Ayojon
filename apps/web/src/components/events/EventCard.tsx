import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import type { EventType } from '@/types';
import { cn } from '@/lib/utils';

interface EventCardProps {
  event: EventType;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const Icon = event.icon;

  return (
    <Link
      to="/products"
      search={{ eventType: event.slug }}
      className={cn(
        'group relative flex flex-col items-center gap-4 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 transition-all duration-300 hover:shadow-lg hover:border-[hsl(var(--primary))] hover:-translate-y-1',
        className
      )}
    >
      {/* Icon Container */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 transition-all duration-300 group-hover:bg-[hsl(var(--primary))]/20 group-hover:scale-110">
        <Icon className="h-10 w-10 text-[hsl(var(--primary))]" />
      </div>

      {/* Event Name */}
      <h3 className="text-center text-lg font-semibold text-[hsl(var(--foreground))]">
        {event.name}
      </h3>

      {/* Shop Now Link */}
      <div className="flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))] transition-all duration-300 group-hover:gap-3">
        <span>Shop Now</span>
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
