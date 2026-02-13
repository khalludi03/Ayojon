// Deal Hooks - Based on PRD Section 7.8

import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'
import type { DealProduct } from '@/types'
import { orpc } from '@/utils/orpc'

// Query keys factory
export const dealKeys = {
  all: ['deals'] as const,
  today: () => [...dealKeys.all, 'today'] as const,
  flash: () => [...dealKeys.all, 'flash'] as const,
}

/**
 * Fetch today's deals
 */
export function useTodayDeals(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<DealProduct>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, featured: true },
      refetchInterval: 5 * 60 * 1000,
      select: (result: any) => result.data,
      ...(options as any),
    }),
  ) as any
}

/**
 * Fetch flash deals
 */
export function useFlashDeals(
  limit: number = 8,
  options?: Omit<UseQueryOptions<Array<DealProduct>>, 'queryKey' | 'queryFn'>,
) {
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, dealType: 'flash' },
      refetchInterval: 60 * 1000,
      select: (result: any) => result.data,
      ...(options as any),
    }),
  ) as any
}
