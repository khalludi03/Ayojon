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
  return useQuery(
    orpc.product.listCategories.queryOptions({
      staleTime: 10 * 60 * 1000, // 10 minutes
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch single category by ID
 * Note: Catalog API uses slug, so we'll use slug hook.
 */
export function useCategory(
  id: string,
  options?: Omit<UseQueryOptions<Category | undefined>, 'queryKey' | 'queryFn'>
) {
  return useCategoryBySlug(id, options);
}

/**
 * Fetch single category by slug
 */
export function useCategoryBySlug(
  slug: string,
  options?: Omit<UseQueryOptions<Category | undefined>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getCategoryBySlug.queryOptions({
      input: { slug },
      enabled: !!slug,
      staleTime: 10 * 60 * 1000,
      ...options as any,
    })
  ) as any;
}
