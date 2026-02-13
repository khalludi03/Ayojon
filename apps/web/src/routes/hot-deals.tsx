import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  ArrowUpDown,
  Filter,
  Flame,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { useHotDeals } from '@/hooks/use-products'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SORT_OPTIONS } from '@/types/filters'

export const Route = createFileRoute('/hot-deals')({
  component: HotDealsPage,
})

function HotDealsPage() {
  const { data: products, isLoading } = useHotDeals(40)
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Derive categories from products
  const categories = useMemo(() => {
    if (!products) return []
    const cats = new Set(products.map((p) => p.categoryId))
    return Array.from(cats)
  }, [products])

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    if (!products) return []

    let result = [...products]

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.categoryId === selectedCategory)
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        result.sort((a, b) => a.pricing.currentPrice - b.pricing.currentPrice)
        break
      case 'price_desc':
        result.sort((a, b) => b.pricing.currentPrice - a.pricing.currentPrice)
        break
      case 'rating_desc':
        result.sort((a, b) => b.rating.average - a.rating.average)
        break
      // Add other sort options if needed
      default:
        // 'relevance' - assume default order is relevant
        break
    }

    return result
  }, [products, selectedCategory, sortBy])

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Dynamic Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 py-12 text-white sm:py-16 md:py-24">
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div
            className="absolute right-1/4 bottom-0 h-64 w-64 translate-x-1/2 rounded-full bg-red-400/20 blur-3xl animate-pulse"
            style={{ animationDelay: '1s' }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-4 text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md shadow-xl border border-white/30">
              <Flame className="h-9 w-9 text-white animate-bounce" />
            </div>
          </div>

          <h1 className="mb-4 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            HOT DEALS
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium text-orange-50/90 sm:text-xl md:text-2xl">
            Our most popular items with massive discounts. Don't wait - these
            trending deals are moving fast!
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold backdrop-blur-md border border-white/20">
              <TrendingUp className="h-4 w-4" />
              <span>Trending Now</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold backdrop-blur-md border border-white/20">
              <Zap className="h-4 w-4" />
              <span>Up to 70% Off</span>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Hot Deals</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-[hsl(var(--border))] pb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-[hsl(var(--foreground))] sm:text-3xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-orange-500" />
              Current Promotions
            </h2>
            <p className="mt-1 text-[hsl(var(--muted-foreground))]">
              Hand-picked best sellers at exclusive prices
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[160px] h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group transition-all duration-500 hover:-translate-y-2"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
              <Flame className="h-12 w-12 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              No Hot Deals Found
            </h3>
            <p className="mt-2 max-w-md text-[hsl(var(--muted-foreground))]">
              {selectedCategory !== 'all'
                ? "We couldn't find any hot deals in this category."
                : "We're currently preparing new offers for you. Please check back later."}
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Featured Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900 p-8 sm:p-12">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-orange-600/20 to-transparent" />
          <div className="relative z-10 max-w-xl">
            <h3 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
              Want to know about deals first?
            </h3>
            <p className="mb-8 text-neutral-400">
              Subscribe to our newsletter and get instant notifications about
              mega flash sales and exclusive hot deals.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl bg-neutral-800 border-neutral-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="rounded-xl bg-orange-600 px-8 py-3 font-bold text-white transition-all hover:bg-orange-700 active:scale-95">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
