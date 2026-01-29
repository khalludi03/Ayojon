// Product Hooks - Based on PRD Section 7.8

import {  useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type {UseQueryOptions} from '@tanstack/react-query';
import type { Product, ProductFilters } from '@/types';
import { productService } from '@/mock/services/product-service';

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
    queryFn: () => productService.getProducts(filters),
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
      productService.getProducts({ ...filters, page: pageParam }),
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
 * Fetch single product by ID
 */
export function useProduct(
  id: string,
  options?: Omit<UseQueryOptions<Product | undefined>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
    ...options,
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
    queryFn: () => productService.getProductBySlug(slug),
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
    queryFn: () => productService.getRelatedProducts(productId, limit),
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
    queryFn: () => productService.getNewArrivals(limit),
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
    queryFn: () => productService.getTopRated(limit),
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
    queryFn: () => productService.getBestSellers(limit),
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
    queryFn: () => productService.getFlashSale(limit),
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
    queryFn: () => productService.getHotDeals(limit),
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
    queryFn: () => productService.getForYou(limit),
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
    queryFn: () => productService.getFeaturedProducts(limit),
    ...options,
  });
}
