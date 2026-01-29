import { createFileRoute } from '@tanstack/react-router'
import { Award, Flame, Heart, Sparkles, TrendingUp, Zap } from 'lucide-react'

import { HeroCarousel } from '@/components/carousel/HeroCarousel'
import { HeroBanner } from '@/components/carousel/HeroBanner'
import { CategorySidebar } from '@/components/categories/CategorySidebar'
import { DealsSection } from '@/components/deals/DealsSection'
import { ProductSection } from '@/components/product/ProductSection'
import { FilterSidebar } from '@/components/product/FilterSidebar'
import { SortDropdown } from '@/components/product/SortDropdown'
import { ActiveFilters } from '@/components/product/ActiveFilters'
import { InfiniteProductGrid } from '@/components/product/InfiniteProductGrid'
import { EventsSection } from '@/components/events/EventsSection'
import { FeaturedProductsSection } from '@/components/product/FeaturedProductsSection'
import { useFlashSale, useForYou, useHotDeals } from '@/hooks/use-products'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  // Fetch product sections
  const { data: flashSaleProducts, isLoading: flashSaleLoading } = useFlashSale(12)
  const { data: forYouProducts, isLoading: forYouLoading } = useForYou(12)
  const { data: hotDealsProducts, isLoading: hotDealsLoading } = useHotDeals(12)

  return (
    <>
      {/* Hero Section with Category Sidebar */}
      <section className="bg-gradient-to-b from-[hsl(var(--muted))]/50 to-transparent py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex gap-6">
            {/* Category Sidebar - Hidden on mobile/tablet */}
            <div className="hidden lg:block sticky top-32 self-start">
              <CategorySidebar />
            </div>

            {/* Main Hero Content */}
            <div className="flex-1 min-w-0">
              {/* Hero Carousel */}
              <HeroCarousel />
              
              {/* Hero Banner with promo cards */}
              <div className="mt-6">
                <HeroBanner />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges / Features Bar */}
      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--card))] py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                <TrendingUp className="h-6 w-6 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))]">Free Shipping</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">On orders over ৳999</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--secondary))]/20">
                <Award className="h-6 w-6 text-[hsl(var(--secondary))]" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))]">Best Quality</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Verified products</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(var(--accent))]/10">
                <Zap className="h-6 w-6 text-[hsl(var(--accent))]" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))]">Fast Delivery</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">24/7 express service</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10">
                <Sparkles className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-semibold text-[hsl(var(--foreground))]">Secure Payment</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">100% protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Event Section */}
      <EventsSection />

      {/* Featured Products Section */}
      <FeaturedProductsSection />

      {/* Today's Deals */}
      <DealsSection />

      {/* Flash Sale Section */}
      <ProductSection
        title="Flash Sale"
        subtitle="Limited time offers - Grab them fast!"
        icon={<Zap className="h-5 w-5" />}
        products={flashSaleProducts || []}
        isLoading={flashSaleLoading}
        viewAllLink="/deals/flash"
        className="bg-gradient-to-r from-[hsl(var(--accent))]/10 to-transparent"
      />

      {/* For You Section */}
      <ProductSection
        title="For You"
        subtitle="Personalized picks based on your preferences"
        icon={<Heart className="h-5 w-5" />}
        products={forYouProducts || []}
        isLoading={forYouLoading}
        viewAllLink="/for-you"
      />

      {/* Hot Deals Section */}
      <ProductSection
        title="Hot Deals"
        subtitle="Best offers from top sellers"
        icon={<Flame className="h-5 w-5" />}
        products={hotDealsProducts || []}
        isLoading={hotDealsLoading}
        viewAllLink="/deals/hot"
        className="bg-[hsl(var(--muted))]"
      />

      {/* All Products Section with Filters */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-4">
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
              All Products
            </h2>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Explore our wide selection of quality products
            </p>
          </div>

          {/* Filters + Products Layout */}
          <div className="flex gap-8">
            {/* Filter Sidebar - Hidden on mobile */}
            <div className="hidden lg:block">
              <FilterSidebar />
            </div>

            {/* Products Area */}
            <div className="flex-1">
              {/* Sort & Active Filters */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <ActiveFilters />
                <SortDropdown />
              </div>

              {/* Product Grid with Load More */}
              <InfiniteProductGrid />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
