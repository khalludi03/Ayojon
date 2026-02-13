// Filter & Sort Types - Based on PRD Section 4.5.4 & 4.5.5

export type SortOption =
  | 'relevance'
  | 'price_asc'
  | 'price_desc'
  | 'created_desc'
  | 'sales_desc'
  | 'rating_desc'

export interface PriceRange {
  min: number
  max: number
}

export type AvailabilityType = 'rental' | 'purchase' | 'both'
export type ProductCondition = 'new' | 'like-new' | 'good'
export type DeliveryOption = 'same-day' | 'next-day' | 'standard'

export interface ProductFilters {
  category?: string
  categoryIds?: Array<string>
  subcategory?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  freeShipping?: boolean
  onSale?: boolean
  inStock?: boolean
  vendorIds?: Array<string>
  search?: string
  sort?: SortOption
  page?: number
  limit?: number
  eventTypes?: Array<string>
  availability?: AvailabilityType
  productCondition?: ProductCondition
  vendorLocation?: string
  deliveryOption?: DeliveryOption
  featured?: boolean
  dealType?: string
}

export interface FilterState extends ProductFilters {
  activeFilterCount: number
}

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating_desc', label: 'Rating: High to Low' },
  { value: 'created_desc', label: 'Newest First' },
  { value: 'sales_desc', label: 'Most Popular' },
]

export const PRICE_PRESETS: Array<{ label: string; min: number; max: number }> =
  [
    { label: 'Under 500', min: 0, max: 500 },
    { label: '500 - 2,000', min: 500, max: 2000 },
    { label: '2,000 - 5,000', min: 2000, max: 5000 },
    { label: '5,000 - 10,000', min: 5000, max: 10000 },
    { label: 'Over 10,000', min: 10000, max: 100000 },
  ]

export const EVENT_TYPES = [
  { value: 'wedding', label: 'Wedding' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'anniversary', label: 'Anniversary' },
  { value: 'conference', label: 'Conference' },
  { value: 'party', label: 'Party' },
  { value: 'other', label: 'Other' },
]

export const DIVISIONS = [
  { value: 'all', label: 'All Divisions' },
  { value: 'dhaka', label: 'Dhaka' },
  { value: 'chittagong', label: 'Chittagong' },
  { value: 'rajshahi', label: 'Rajshahi' },
  { value: 'khulna', label: 'Khulna' },
  { value: 'barishal', label: 'Barishal' },
  { value: 'sylhet', label: 'Sylhet' },
  { value: 'rangpur', label: 'Rangpur' },
  { value: 'mymensingh', label: 'Mymensingh' },
]

export const PRODUCT_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
]

export const DELIVERY_OPTIONS = [
  { value: 'same-day', label: 'Same Day' },
  { value: 'next-day', label: 'Next Day' },
  { value: 'standard', label: 'Standard' },
]
