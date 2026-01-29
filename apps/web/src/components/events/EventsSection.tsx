import { Heart, Cake, Briefcase, Church, Calendar, Baby } from 'lucide-react';
import type { EventType } from '@/types';
import { EventCard } from './EventCard';

const eventTypes: EventType[] = [
  {
    id: '1',
    name: 'Wedding',
    slug: 'wedding',
    icon: Heart,
  },
  {
    id: '2',
    name: 'Birthday',
    slug: 'birthday',
    icon: Cake,
  },
  {
    id: '3',
    name: 'Corporate',
    slug: 'corporate',
    icon: Briefcase,
  },
  {
    id: '4',
    name: 'Religious',
    slug: 'religious',
    icon: Church,
  },
  {
    id: '5',
    name: 'Anniversary',
    slug: 'anniversary',
    icon: Calendar,
  },
  {
    id: '6',
    name: 'Baby Shower',
    slug: 'baby-shower',
    icon: Baby,
  },
];

export function EventsSection() {
  return (
    <section className="py-5 sm:py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        {/* Section Header */}
        <div className="mb-6 text-center sm:mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl md:text-4xl">
            Shop by Event Type
          </h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
            Find everything you need for your celebration - rent from trusted vendors
          </p>
        </div>

        {/* Events Grid - Responsive: 2 columns (mobile), 3 columns (tablet), 6 columns (desktop) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
          {eventTypes.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
