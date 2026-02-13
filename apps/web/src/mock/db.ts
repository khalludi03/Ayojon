// Mock Database - Based on PRD Section 7.6

import { faker } from '@faker-js/faker'
import { createDealProducts, createProducts } from './factories/product'
import { createVendors } from './factories/vendor'
import { calculateReviewSummary, createReviews } from './factories/review'
import { CATEGORIES } from './seeds/categories'
import type {
  Category,
  DealProduct,
  Product,
  ProductFilters,
  Review,
  ReviewFilter,
  ReviewSort,
  ReviewSummary,
  Vendor,
} from '@/types'

// Set seed for reproducible data
faker.seed(12345)

interface PaginatedResult<T> {
  data: Array<T>
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

class MockDatabase {
  private products: Array<Product> = []
  private dealProducts: Array<DealProduct> = []
  private vendors: Array<Vendor> = []
  private categories: Array<Category> = CATEGORIES
  private reviews: Map<string, Array<Review>> = new Map()
  private initialized = false

  // eslint-disable-next-line @typescript-eslint/require-await
  async init(): Promise<void> {
    if (this.initialized) return

    // Note: This mock DB is only used for the public product catalog and reviews.
    // Admin panel and vendor dashboard use real API data.

    // Generate vendors first
    this.vendors = createVendors(50)

    // Generate products with vendor references
    const vendorRefs = this.vendors.map((v) => ({
      id: v.id,
      name: v.name,
      isVerified: v.isVerified,
    }))

    this.products = createProducts(500, vendorRefs)

    // Generate deal products (subset with high discounts)
    this.dealProducts = createDealProducts(24)

    // Generate reviews for each product (varying counts)
    this.products.forEach((product) => {
      const reviewCount = faker.number.int({ min: 5, max: 50 })
      this.reviews.set(product.id, createReviews(product.id, reviewCount))
    })

    // Update category product counts
    this.categories = this.categories.map((cat) => ({
      ...cat,
      productCount: this.products.filter((p) => p.categoryId === cat.id).length,
    }))

    this.initialized = true
    // Reduced logging noise - only log in development if needed
    if (import.meta.env.DEV && import.meta.env.VITE_DEBUG_MOCK_DB === 'true') {
      console.log(
        `[MockDB] Initialized with ${this.products.length} products, ${this.vendors.length} vendors`,
      )
    }
  }

  getProducts(filters: ProductFilters = {}): PaginatedResult<Product> {
    let result = [...this.products]

    // Apply filters
    if (filters.category) {
      result = result.filter((p) => p.categoryId === filters.category)
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      result = result.filter((p) => filters.categoryIds!.includes(p.categoryId))
    }

    if (filters.subcategory) {
      const beforeCount = result.length
      result = result.filter((p) => p.subcategoryId === filters.subcategory)
      console.log(
        `[MockDB] Subcategory filter: ${filters.subcategory}, Before: ${beforeCount}, After: ${result.length}`,
      )
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower),
      )
    }

    if (filters.minPrice !== undefined) {
      result = result.filter((p) => p.pricing.currentPrice >= filters.minPrice!)
    }

    if (filters.maxPrice !== undefined) {
      result = result.filter((p) => p.pricing.currentPrice <= filters.maxPrice!)
    }

    if (filters.minRating !== undefined) {
      result = result.filter((p) => p.rating.average >= filters.minRating!)
    }

    if (filters.freeShipping) {
      result = result.filter((p) => p.shipping.freeShipping)
    }

    if (filters.onSale) {
      result = result.filter((p) => p.pricing.discountPercentage > 0)
    }

    if (filters.inStock) {
      result = result.filter((p) => p.stockStatus !== 'out_of_stock')
    }

    if (filters.vendorIds && filters.vendorIds.length > 0) {
      result = result.filter((p) => filters.vendorIds!.includes(p.vendor.id))
    }

    // Apply sorting
    const sort = filters.sort || 'relevance'
    switch (sort) {
      case 'price_asc':
        result.sort((a, b) => a.pricing.currentPrice - b.pricing.currentPrice)
        break
      case 'price_desc':
        result.sort((a, b) => b.pricing.currentPrice - a.pricing.currentPrice)
        break
      case 'created_desc':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        break
      case 'rating_desc':
        result.sort((a, b) => b.rating.average - a.rating.average)
        break
      case 'discount_desc':
        result.sort(
          (a, b) => b.pricing.discountPercentage - a.pricing.discountPercentage,
        )
        break
      case 'sales_desc':
        // Simulate by rating count as proxy for sales
        result.sort((a, b) => b.rating.count - a.rating.count)
        break
      case 'relevance':
      default:
        // Default: mix of rating and recency
        result.sort((a, b) => {
          const scoreA = a.rating.average * 0.7 + (a.rating.count / 2000) * 0.3
          const scoreB = b.rating.average * 0.7 + (b.rating.count / 2000) * 0.3
          return scoreB - scoreA
        })
    }

    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 20
    const total = result.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedData = result.slice(startIndex, startIndex + limit)

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    }
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id)
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug)
  }

  getCategories(): Array<Category> {
    return this.categories
  }

  getCategoryById(id: string): Category | undefined {
    return this.categories.find((c) => c.id === id)
  }

  getCategoryBySlug(slug: string): Category | undefined {
    return this.categories.find((c) => c.slug === slug)
  }

  getVendors(): Array<Vendor> {
    return this.vendors
  }

  getVendorById(id: string): Vendor | undefined {
    return this.vendors.find((v) => v.id === id)
  }

  getTodayDeals(limit: number = 12): Array<DealProduct> {
    // Get products with 30%+ discount
    const dealsFromProducts = this.products
      .filter((p) => p.pricing.discountPercentage >= 30)
      .slice(0, limit)
      .map((p) => ({
        ...p,
        dealType: 'daily' as const,
        dealStartedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        dealEndsAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      }))

    // Combine with generated deal products
    return [...this.dealProducts.slice(0, 6), ...dealsFromProducts.slice(0, 6)]
  }

  getFlashDeals(limit: number = 8): Array<DealProduct> {
    return this.dealProducts
      .filter((d) => d.dealType === 'flash')
      .slice(0, limit)
  }

  searchProducts(query: string, limit: number = 10): Array<Product> {
    if (!query.trim()) return []

    const queryLower = query.toLowerCase()
    return this.products
      .filter(
        (p) =>
          p.title.toLowerCase().includes(queryLower) ||
          p.description.toLowerCase().includes(queryLower) ||
          p.categoryId.toLowerCase().includes(queryLower),
      )
      .slice(0, limit)
  }

  getRelatedProducts(productId: string, limit: number = 6): Array<Product> {
    const product = this.getProductById(productId)
    if (!product) return []

    return this.products
      .filter((p) => p.id !== productId && p.categoryId === product.categoryId)
      .slice(0, limit)
  }

  getNewArrivals(limit: number = 12): Array<Product> {
    return [...this.products]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit)
  }

  getTopRated(limit: number = 12): Array<Product> {
    return [...this.products]
      .sort((a, b) => b.rating.average - a.rating.average)
      .slice(0, limit)
  }

  getBestSellers(limit: number = 12): Array<Product> {
    return [...this.products]
      .sort((a, b) => b.rating.count - a.rating.count)
      .slice(0, limit)
  }

  getFlashSale(limit: number = 12): Array<Product> {
    // Flash sale: products with 40%+ discount, sorted by discount
    return [...this.products]
      .filter((p) => p.pricing.discountPercentage >= 40)
      .sort(
        (a, b) => b.pricing.discountPercentage - a.pricing.discountPercentage,
      )
      .slice(0, limit)
  }

  getHotDeals(limit: number = 12): Array<Product> {
    // Hot deals: products with 25%+ discount and good ratings
    return [...this.products]
      .filter(
        (p) => p.pricing.discountPercentage >= 25 && p.rating.average >= 3.5,
      )
      .sort((a, b) => b.rating.count - a.rating.count)
      .slice(0, limit)
  }

  getForYou(limit: number = 12): Array<Product> {
    // For You: personalized mix - top rated products from various categories
    const categories = [...new Set(this.products.map((p) => p.categoryId))]
    const result: Array<Product> = []

    // Get 2 products from each category
    for (const cat of categories) {
      const catProducts = this.products
        .filter((p) => p.categoryId === cat)
        .sort((a, b) => b.rating.average - a.rating.average)
        .slice(0, 2)
      result.push(...catProducts)
      if (result.length >= limit) break
    }

    return result.slice(0, limit)
  }

  getFeaturedProducts(limit: number = 20): Array<Product> {
    // Featured Products: high-quality products with good ratings and diverse categories
    return this.products
      .filter((p) => p.rating.average >= 4.0 && p.rating.count >= 10)
      .sort((a, b) => {
        // Sort by a combination of rating and popularity
        const scoreA = a.rating.average * 0.7 + (a.rating.count / 1000) * 0.3
        const scoreB = b.rating.average * 0.7 + (b.rating.count / 1000) * 0.3
        return scoreB - scoreA
      })
      .slice(0, limit)
  }

  // Review methods
  getProductReviews(
    productId: string,
    options: {
      filter?: ReviewFilter
      sort?: ReviewSort
      page?: number
      limit?: number
    } = {},
  ): PaginatedResult<Review> {
    const {
      filter = 'all',
      sort = 'most_recent',
      page = 1,
      limit = 10,
    } = options

    let reviews = this.reviews.get(productId) || []

    // Apply filters
    if (filter === 'with_photos') {
      reviews = reviews.filter((r) => r.images.length > 0)
    } else if (filter === 'verified_purchase') {
      reviews = reviews.filter((r) => r.isVerifiedPurchase)
    }

    // Apply sorting
    reviews = [...reviews].sort((a, b) => {
      switch (sort) {
        case 'most_recent':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'most_helpful':
          return b.helpfulVotes - a.helpfulVotes
        case 'highest_rating':
          return b.rating - a.rating
        case 'lowest_rating':
          return a.rating - b.rating
        default:
          return 0
      }
    })

    // Pagination
    const total = reviews.length
    const totalPages = Math.ceil(total / limit)
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedReviews = reviews.slice(start, end)

    return {
      data: paginatedReviews,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    }
  }

  getReviewSummary(productId: string): ReviewSummary {
    const reviews = this.reviews.get(productId) || []
    return calculateReviewSummary(reviews)
  }
}

// Export singleton instance
export const mockDb = new MockDatabase()

// Auto-initialize on import (only in browser)
if (typeof window !== 'undefined') {
  mockDb.init()
}
