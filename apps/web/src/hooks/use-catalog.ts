import { useQuery } from '@tanstack/react-query'
import {
  Baby,
  Briefcase,
  Cake,
  Calendar,
  Church,
  Heart,
  PartyPopper,
} from 'lucide-react'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { EventType } from '@/types'
import { orpc } from '@/utils/orpc'

const iconMap: Record<string, any> = {
  wedding: Heart,
  birthday: Cake,
  corporate: Briefcase,
  religious: Church,
  anniversary: Calendar,
  'baby-shower': Baby,
  default: PartyPopper,
}

/**
 * Fetch all active event types
 */
export function useEventTypes(
  options?: Omit<UseQueryOptions<Array<EventType>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: ['catalog', 'event-types'],
    queryFn: async () => {
      const data = await orpc.product.listEventTypes()

      return data.map((et: any) => ({
        id: et.id,
        name: et.name,
        slug: et.slug,
        icon: iconMap[et.slug] || iconMap['default'],
      })) as Array<EventType>
    },
    ...options,
  })
}
