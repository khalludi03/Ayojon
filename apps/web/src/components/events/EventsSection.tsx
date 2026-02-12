import { Heart, Cake, Briefcase, Church, Calendar, Baby, GraduationCap, PartyPopper, Users, Sparkles, type LucideIcon } from 'lucide-react';
import type { EventType } from '@/types';
import { EventCard } from './EventCard';
import { orpc } from '@/utils/orpc';
import { useQuery } from '@tanstack/react-query';

const iconMap: Record<string, LucideIcon> = {
  'wedding': Heart,
  'birthday': Cake,
  'corporate': Briefcase,
  'religious': Church,
  'anniversary': Calendar,
  'baby-shower': Baby,
  'graduation': GraduationCap,
  'engagement': Heart,
  'conference': Users,
  'festival': PartyPopper,
};

const fallbackIcons = [Heart, Cake, Briefcase, Church, Calendar, Baby, GraduationCap, PartyPopper, Users, Sparkles];

export function EventsSection() {
  const { data: eventTypes, isLoading } = useQuery(
    orpc.product.listEventTypes.queryOptions({})
  ) as { data: Array<{ id: string; name: string; slug: string }> | undefined; isLoading: boolean };

  const eventsWithIcons: EventType[] = (eventTypes || []).map((event: { id: string; name: string; slug: string }, index: number) => ({
    id: event.id,
    name: event.name,
    slug: event.slug,
    icon: iconMap[event.slug] || fallbackIcons[index % fallbackIcons.length],
  }));

  if (isLoading || !eventsWithIcons.length) {
    return null;
  }

  return (
    <section className="bg-[radial-gradient(70%_40%_at_50%_0%,hsla(40,95%,55%,0.12)_0%,transparent_70%)] py-5 sm:py-6 md:py-8">
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-card)] sm:p-6 md:p-8">
          <div className="mb-6 text-center sm:mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl md:text-4xl">
              Shop by Event Type
            </h2>
            <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))] sm:text-base">
              Find everything you need for your celebration - rent from trusted vendors
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-6">
            {eventsWithIcons.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
