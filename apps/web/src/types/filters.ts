// Filter & Sort Types - Based on PRD Section 4.5.4 & 4.5.5

export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'created_desc'
  | 'sales_desc'
  | 'rating_desc';

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  freeShipping?: boolean;
  onSale?: boolean;
  inStock?: boolean;
  vendorIds?: Array<string>;
  search?: string;
  sort?: SortOption;
  page?: number;
  limit?: number;
  eventType?: string;
}

export interface FilterState extends ProductFilters {
  activeFilterCount: number;
}

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Rating: High to Low' },
  { value: 'created_desc', label: 'Newest First' },
  { value: 'sales_desc', label: 'Most Popular' },
];

export const PRICE_PRESETS: Array<{ label: string; min: number; max: number }> = [
  { label: 'Under 500', min: 0, max: 500 },
  { label: '500 - 2,000', min: 500, max: 2000 },
  { label: '2,000 - 5,000', min: 2000, max: 5000 },
  { label: '5,000 - 10,000', min: 5000, max: 10000 },
  { label: 'Over 10,000', min: 10000, max: 100000 },
];
