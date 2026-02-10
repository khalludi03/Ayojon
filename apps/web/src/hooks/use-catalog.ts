import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
import { orpc } from '@/utils/orpc';
import type { Category, EventType } from '@/types';
import { Heart, Cake, Briefcase, Church, Calendar, Baby, PartyPopper } from 'lucide-react';

const iconMap: Record<string, any> = {
  'wedding': Heart,
  'birthday': Cake,
  'corporate': Briefcase,
  'religious': Church,
  'anniversary': Calendar,
  'baby-shower': Baby,
  'default': PartyPopper
};

/**
 * Fetch all active event types
 */
export function useEventTypes(
  options?: Omit<UseQueryOptions<Array<EventType>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['catalog', 'event-types'],
    queryFn: async () => {
      const data = await orpc.catalog.listEventTypes();
      
      return data.map(et => ({
        id: et.id,
        name: et.name,
        slug: et.slug,
        icon: iconMap[et.slug] || iconMap['default']
      })) as Array<EventType>;
    },
    ...options,
  });
}
