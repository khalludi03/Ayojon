// Product Hooks - Based on PRD Section 7.8

import {  useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type {UseQueryOptions} from '@tanstack/react-query';
import type { Product, ProductFilters } from '@/types';
import { orpc } from '@/utils/orpc';

interface PaginatedResult<T> {
  data: Array<T>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// Query keys factory
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  infinite: (filters: ProductFilters) => [...productKeys.all, 'infinite', filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  slug: (slug: string) => [...productKeys.all, 'slug', slug] as const,
  related: (productId: string) => [...productKeys.all, 'related', productId] as const,
  newArrivals: () => [...productKeys.all, 'new-arrivals'] as const,
  topRated: () => [...productKeys.all, 'top-rated'] as const,
  bestSellers: () => [...productKeys.all, 'best-sellers'] as const,
};

/**
 * Fetch paginated products with filters
 */
export function useProducts(
  filters: ProductFilters = {},
  options?: Omit<UseQueryOptions<PaginatedResult<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => orpc.products.list.call(filters) as Promise<PaginatedResult<Product>>,
    ...options,
  });
}

/**
 * Fetch products with infinite scroll pagination
 */
export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: productKeys.infinite(filters),
    queryFn: ({ pageParam = 1 }) =>
      orpc.products.list.call({ ...filters, page: pageParam }) as Promise<PaginatedResult<Product>>,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}

/**
 * Fetch single product by slug
 */
export function useProductBySlug(
  slug: string,
  options?: Omit<UseQueryOptions<Product | undefined>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.slug(slug),
    queryFn: () => orpc.products.detail.call({ slug }) as Promise<Product>,
    enabled: !!slug,
    ...options,
  });
}

/**
 * Fetch related products
 */
export function useRelatedProducts(
  productId: string,
  limit: number = 6,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.related(productId),
    queryFn: () => orpc.products.related.call({ productId, limit }) as Promise<Product[]>,
    enabled: !!productId,
    ...options,
  });
}

/**
 * Fetch new arrivals
 */
export function useNewArrivals(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: () => orpc.products.newArrivals.call({ limit }) as Promise<Product[]>,
    ...options,
  });
}

/**
 * Fetch top rated products
 */
export function useTopRated(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.topRated(),
    queryFn: () => orpc.products.topRated.call({ limit }) as Promise<Product[]>,
    ...options,
  });
}

/**
 * Fetch best sellers
 */
export function useBestSellers(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.bestSellers(),
    queryFn: () => orpc.products.bestSellers.call({ limit }) as Promise<Product[]>,
    ...options,
  });
}

/**
 * Fetch flash sale products
 */
export function useFlashSale(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productKeys.all, 'flash-sale'],
    queryFn: () => orpc.products.flashSale.call({ limit }) as Promise<Product[]>,
    ...options,
  });
}

/**
 * Fetch hot deals products
 */
export function useHotDeals(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productKeys.all, 'hot-deals'],
    queryFn: () => orpc.products.hotDeals.call({ limit }) as Promise<Product[]>,
    ...options,
  });
}

/**
 * Fetch "For You" personalized products
 */
export function useForYou(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productKeys.all, 'for-you'],
    queryFn: () => orpc.products.forYou.call({ limit }) as Promise<Product[]>,
    ...options,
  });
}

/**
 * Fetch featured products
 */
export function useFeaturedProducts(
  limit: number = 20,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productKeys.all, 'featured'],
    queryFn: () => orpc.products.featured.call({ limit }) as Promise<Product[]>,
    ...options,
  });
}

/**
 * Fetch products by category with full pagination support
 * @deprecated Use useProducts with category filter instead
 */
export function useProductsByCategory(
  categoryId: string,
  limit: number = 8,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...productKeys.all, 'category', categoryId, limit],
    queryFn: () => (orpc.products.list.call({ category: categoryId, limit }) as Promise<PaginatedResult<Product>>).then(result => result.data),
    enabled: !!categoryId,
    ...options,
  });
}

/**
 * Fetch paginated products by category with full filter support
 */
export function useCategoryProducts(
  categorySlug: string,
  filters: Omit<ProductFilters, 'category'> = {},
  options?: Omit<UseQueryOptions<PaginatedResult<Product>>, 'queryKey' | 'queryFn'>
) {
  const fullFilters = { ...filters, category: categorySlug };
  return useQuery({
    queryKey: [...productKeys.all, 'category-page', categorySlug, filters],
    queryFn: () => orpc.products.list.call(fullFilters) as Promise<PaginatedResult<Product>>,
    enabled: !!categorySlug,
    ...options,
  });
}
