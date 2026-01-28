// Search Hook with debouncing

import {  useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import type {UseQueryOptions} from '@tanstack/react-query';
import type { Product } from '@/types';
import { productService } from '@/mock/services/product-service';

// Query keys factory
export const searchKeys = {
  all: ['search'] as const,
  query: (query: string) => [...searchKeys.all, query] as const,
};

/**
 * Custom hook for debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Search products with debouncing
 */
export function useSearch(
  query: string,
  limit: number = 10,
  options?: Omit<UseQueryOptions<Array<Product>>, 'queryKey' | 'queryFn'>
) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: searchKeys.query(debouncedQuery),
    queryFn: () => productService.searchProducts(debouncedQuery, limit),
    enabled: debouncedQuery.length >= 2, // Only search if at least 2 characters
    ...options,
  });
}

/**
 * Hook for managing search state
 */
export function useSearchState() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: results, isLoading } = useSearch(query);

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  return {
    query,
    setQuery,
    results: results || [],
    isLoading,
    isOpen,
    setIsOpen,
    clearSearch,
    hasResults: (results?.length || 0) > 0,
  };
}
