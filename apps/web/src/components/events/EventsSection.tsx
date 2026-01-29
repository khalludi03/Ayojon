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
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] md:text-4xl">
            Shop by Event Type
          </h2>
          <p className="mt-2 text-[hsl(var(--muted-foreground))]">
            Find everything you need for your celebration - rent from trusted vendors
          </p>
        </div>

        {/* Events Grid - Responsive: 2 columns (mobile), 3 columns (tablet), 6 columns (desktop) */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6 lg:gap-6">
          {eventTypes.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}
