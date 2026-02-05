// Deal Hooks - Based on PRD Section 7.8

import {  useQuery } from '@tanstack/react-query';
import type {UseQueryOptions} from '@tanstack/react-query';
import type { DealProduct } from '@/types';
import { orpc } from '@/utils/orpc';

// Query keys factory
export const dealKeys = {
  all: ['deals'] as const,
  today: () => [...dealKeys.all, 'today'] as const,
  flash: () => [...dealKeys.all, 'flash'] as const,
};

/**
 * Fetch today's deals
 */
export function useTodayDeals(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<DealProduct>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dealKeys.today(),
    queryFn: () => orpc.products.todayDeals.call({ limit }) as Promise<DealProduct[]>,
    // Refetch every 5 minutes to keep deals fresh
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Fetch flash deals
 */
export function useFlashDeals(
  limit: number = 8,
  options?: Omit<UseQueryOptions<Array<DealProduct>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: dealKeys.flash(),
    queryFn: () => orpc.products.flashDeals.call({ limit }) as Promise<DealProduct[]>,
    // Refetch every minute for time-sensitive flash deals
    refetchInterval: 60 * 1000,
    ...options,
  });
}
