// Category Hooks - Based on PRD Section 7.8

import {  useQuery } from '@tanstack/react-query';
import type {UseQueryOptions} from '@tanstack/react-query';
import type { Category } from '@/types';
import { categoryService } from '@/mock/services/product-service';

// Query keys factory
export const categoryKeys = {
  all: ['categories'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};

/**
 * Fetch all categories
 */
export function useCategories(
  options?: Omit<UseQueryOptions<Array<Category>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => categoryService.getCategories(),
    // Categories rarely change, cache for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

/**
 * Fetch single category by ID
 */
export function useCategory(
  id: string,
  options?: Omit<UseQueryOptions<Category | undefined>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryService.getCategoryById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}
