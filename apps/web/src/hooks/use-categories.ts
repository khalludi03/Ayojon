// Category Hooks - Based on PRD Section 7.8

import {  useQuery } from '@tanstack/react-query';
import type {UseQueryOptions} from '@tanstack/react-query';
import type { Category } from '@/types';
import { orpc } from '@/utils/orpc';

// Query keys factory
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
  slug: (slug: string) => [...categoryKeys.all, 'slug', slug] as const,
};

/**
 * Fetch all categories
 */
export function useCategories(
  options?: Omit<UseQueryOptions<Array<Category>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => orpc.categories.list.call() as Promise<Category[]>,
    // Categories rarely change, cache for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Fetch single category by slug
 */
export function useCategoryBySlug(
  slug: string,
  options?: Omit<UseQueryOptions<Category | undefined>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: categoryKeys.slug(slug),
    queryFn: () => orpc.categories.bySlug.call({ slug }) as Promise<Category>,
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}
