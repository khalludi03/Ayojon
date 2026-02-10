// Product Hooks - Based on PRD Section 7.8

import {  useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type {UseQueryOptions} from '@tanstack/react-query';
import type { Product, ProductFilters } from '@/types';
import { orpc, orpcClient } from '@/utils/orpc';

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
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: {
        page: filters.page,
        limit: filters.limit,
        category: filters.category,
        subcategory: filters.subcategory,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        q: filters.search,
      },
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch products with infinite scroll pagination
 */
export function useInfiniteProducts(filters: Omit<ProductFilters, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite', filters],
    queryFn: ({ pageParam = 1 }) =>
      orpcClient.product.getProducts({
        page: pageParam as number,
        limit: filters.limit,
        category: filters.category,
        subcategory: filters.subcategory,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        q: filters.search,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      if (lastPage?.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
}

/**
 * Fetch single product by ID
 * Note: Our catalog API primarily uses slug, but we'll use it as ID for now if needed.
 */
export function useProduct(
  id: string,
  options?: Omit<UseQueryOptions<Product | undefined>, 'queryKey' | 'queryFn'>
) {
  // If id is a slug (common in this app), use slug hook. Otherwise, we might need a getProductById on backend.
  return useProductBySlug(id, options);
}

/**
 * Fetch single product by slug
 */
export function useProductBySlug(
  slug: string,
  options?: Omit<UseQueryOptions<Product | undefined>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getProductBySlug.queryOptions({
      input: { slug },
      enabled: !!slug,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch related products
 */
export function useRelatedProducts(
  productId: string,
  limit: number = 6,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  // Simplification: Fetch products in same category (or first one)
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit },
      enabled: !!productId,
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch new arrivals
 */
export function useNewArrivals(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, sort: 'newest' },
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch top rated products
 */
export function useTopRated(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, sort: 'rating_desc' },
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch best sellers
 */
export function useBestSellers(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  // Using rating_desc as proxy for popularity if sales_desc is not implemented
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, sort: 'rating_desc' },
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch flash sale products
 */
export function useFlashSale(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, dealType: 'flash' },
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch hot deals products
 */
export function useHotDeals(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, featured: true },
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch "For You" personalized products
 */
export function useForYou(
  limit: number = 12,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, featured: true },
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch featured products
 */
export function useFeaturedProducts(
  limit: number = 20,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { limit, featured: true },
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
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
  return useQuery(
    orpc.product.getProducts.queryOptions({
      input: { category: categoryId, limit },
      enabled: !!categoryId,
      select: (result: any) => result.data,
      ...options as any,
    })
  ) as any;
}

/**
 * Fetch paginated products by category with full filter support
 */
export function useCategoryProducts(
  categorySlug: string,
  filters: Omit<ProductFilters, 'category'> = {},
  options?: Omit<UseQueryOptions<PaginatedResult<Product>>, 'queryKey' | 'queryFn'>
) {
  return useProducts({ ...filters, category: categorySlug }, options);
}
