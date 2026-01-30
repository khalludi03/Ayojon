// Filter Store - Based on PRD Section 4.5.4

import { useCallback, useSyncExternalStore } from 'react';
import type { ProductFilters, SortOption } from '@/types';

interface FilterState extends ProductFilters {
  activeFilterCount: number;
}

interface FilterStore {
  getState: () => FilterState;
  setFilter: <TKey extends keyof ProductFilters>(key: TKey, value: ProductFilters[TKey]) => void;
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilter: (key: keyof ProductFilters) => void;
  clearAllFilters: () => void;
  getActiveFilterCount: () => number;
  subscribe: (callback: () => void) => () => void;
}

const DEFAULT_FILTERS: FilterState = {
  category: undefined,
  subcategory: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  minRating: undefined,
  freeShipping: undefined,
  onSale: undefined,
  inStock: undefined,
  vendorIds: undefined,
  search: undefined,
  sort: 'relevance',
  page: 1,
  limit: 20,
  eventTypes: undefined,
  availability: undefined,
  productCondition: undefined,
  vendorLocation: undefined,
  deliveryOption: undefined,
  activeFilterCount: 0,
};

function calculateActiveFilterCount(filters: ProductFilters): number {
  let count = 0;
  if (filters.category) count++;
  if (filters.subcategory) count++;
  if (filters.minPrice !== undefined) count++;
  if (filters.maxPrice !== undefined) count++;
  if (filters.minRating !== undefined) count++;
  if (filters.freeShipping) count++;
  if (filters.onSale) count++;
  if (filters.inStock) count++;
  if (filters.vendorIds && filters.vendorIds.length > 0) count++;
  if (filters.search) count++;
  if (filters.eventTypes && filters.eventTypes.length > 0) count++;
  if (filters.availability) count++;
  if (filters.productCondition) count++;
  if (filters.vendorLocation && filters.vendorLocation !== 'all') count++;
  if (filters.deliveryOption) count++;
  return count;
}

function createFilterStore(): FilterStore {
  let state: FilterState = { ...DEFAULT_FILTERS };
  const listeners = new Set<() => void>();

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const updateActiveFilterCount = () => {
    state.activeFilterCount = calculateActiveFilterCount(state);
  };

  return {
    getState: () => state,

    setFilter: <TKey extends keyof ProductFilters>(key: TKey, value: ProductFilters[TKey]) => {
      state = { ...state, [key]: value, page: key === 'page' ? (value as number) : 1 };
      updateActiveFilterCount();
      notify();
    },

    setFilters: (filters: Partial<ProductFilters>) => {
      state = { ...state, ...filters, page: 1 };
      updateActiveFilterCount();
      notify();
    },

    clearFilter: (key: keyof ProductFilters) => {
      state = { ...state, [key]: DEFAULT_FILTERS[key], page: 1 };
      updateActiveFilterCount();
      notify();
    },

    clearAllFilters: () => {
      state = { ...DEFAULT_FILTERS };
      notify();
    },

    getActiveFilterCount: () => {
      return state.activeFilterCount;
    },

    subscribe: (callback: () => void) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

// Singleton instance
export const filterStore = createFilterStore();

// Stable callbacks for useSyncExternalStore
const subscribe = (callback: () => void) => filterStore.subscribe(callback);
const getSnapshot = () => filterStore.getState();
const getServerSnapshot = () => DEFAULT_FILTERS;

// React hook
export function useFilters() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    filters: state,
    activeFilterCount: state.activeFilterCount,
    setFilter: filterStore.setFilter,
    setFilters: filterStore.setFilters,
    clearFilter: filterStore.clearFilter,
    clearAllFilters: filterStore.clearAllFilters,
  };
}

// Helper hook for price range
export function usePriceRange() {
  const { filters, setFilters } = useFilters();

  const setPriceRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      setFilters({ minPrice: min, maxPrice: max });
    },
    [setFilters]
  );

  return {
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    setPriceRange,
  };
}

// Helper hook for sort
export function useSort() {
  const { filters, setFilter } = useFilters();

  const setSort = useCallback(
    (sort: SortOption) => {
      setFilter('sort', sort);
    },
    [setFilter]
  );

  return {
    sort: filters.sort || 'relevance',
    setSort,
  };
}
