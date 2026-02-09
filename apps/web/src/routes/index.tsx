import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { Award, Flame, Heart, Home, ShoppingCart, Sparkles, TrendingUp, UtensilsCrossed, Zap } from 'lucide-react'

import { HeroCarousel } from '@/components/carousel/HeroCarousel'
import { DealsSection } from '@/components/deals/DealsSection'
import { FlashSaleSection } from '@/components/deals/FlashSaleSection'
import { ProductSection } from '@/components/product/ProductSection'
import { FilterSidebar } from '@/components/product/FilterSidebar'
import { SortDropdown } from '@/components/product/SortDropdown'
import { ActiveFilters } from '@/components/product/ActiveFilters'
import { InfiniteProductGrid } from '@/components/product/InfiniteProductGrid'
import { EventsSection } from '@/components/events/EventsSection'
import { FeaturedProductsSection } from '@/components/product/FeaturedProductsSection'
import { useForYou, useHotDeals, useProductsByCategory } from '@/hooks/use-products'
import { getUser } from '@/functions/get-user'
import { useCart } from '@/stores/cart-store'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await getUser();
    if (session) {
      const user = session.user as any;
      // Redirect admin users to admin dashboard
      if (user.role === 'admin') {
        throw redirect({ to: '/admin/dashboard' });
      }
      // Redirect vendor users to vendor dashboard
      if (user.role === 'vendor') {
        throw redirect({ to: '/vendor/dashboard' });
      }
    }
  },
  component: HomePage
})

function HomePage() {
  const { itemCount } = useCart()
  // Fetch product sections
  const { data: forYouProducts, isLoading: forYouLoading } = useForYou(12)
  const { data: hotDealsProducts, isLoading: hotDealsLoading } = useHotDeals(12)
  
  // Fetch category sections
  const { data: decorationsProducts, isLoading: decorationsLoading } = useProductsByCategory('decorations', 8)
  const { data: soundLightingProducts, isLoading: soundLightingLoading } = useProductsByCategory('sound-lighting', 8)
  const { data: furnitureProducts, isLoading: furnitureLoading } = useProductsByCategory('furniture-tents', 8)
  const { data: cateringProducts, isLoading: cateringLoading } = useProductsByCategory('catering-equipment', 8)

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[radial-gradient(80%_60%_at_50%_0%,hsla(12,85%,55%,0.18)_0%,transparent_70%)] py-4 sm:py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[var(--shadow-card)]">
            {/* Hero Carousel */}
            <HeroCarousel />
          </div>
        </div>
      </section>

      {/* Cart Reminder - Only shown if cart has items */}
      {itemCount > 0 && (
        <section className="mx-auto max-w-7xl px-2 pt-2 sm:px-4">
          <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/5 p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10">
                <ShoppingCart className="h-5 w-5 text-[hsl(var(--primary))]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))] sm:text-base">
                  You have {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                  Continue where you left off and complete your purchase.
                </p>
              </div>
            </div>
            <Button asChild size="sm" className="hidden sm:flex">
              <Link to="/cart">View Cart</Link>
            </Button>
            <Button asChild size="icon" variant="ghost" className="sm:hidden">
              <Link to="/cart"><ShoppingCart className="h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      )}

      {/* Trust Badges / Features Bar */}
      <section className="bg-[radial-gradient(70%_40%_at_50%_0%,hsla(40,95%,55%,0.12)_0%,transparent_70%)] py-5 sm:py-6 md:py-8">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-[var(--shadow-card)] sm:p-3 md:p-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4 lg:gap-5 xl:gap-6">
              <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3 md:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 sm:h-12 sm:w-12 md:h-14 md:w-14">
                  <TrendingUp className="h-5 w-5 text-[hsl(var(--primary))] sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] md:text-base">Free Shipping</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] md:text-sm">On orders over ৳999</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3 md:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))]/20 sm:h-12 sm:w-12 md:h-14 md:w-14">
                  <Award className="h-5 w-5 text-[hsl(var(--secondary))] sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] md:text-base">Best Quality</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] md:text-sm">Verified products</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3 md:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent))]/10 sm:h-12 sm:w-12 md:h-14 md:w-14">
                  <Zap className="h-5 w-5 text-[hsl(var(--accent))] sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] md:text-base">Fast Delivery</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] md:text-sm">24/7 express service</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 sm:gap-3 sm:p-3 md:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 sm:h-12 sm:w-12 md:h-14 md:w-14">
                  <Sparkles className="h-5 w-5 text-emerald-500 sm:h-6 sm:w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[hsl(var(--foreground))] md:text-base">Secure Payment</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] md:text-sm">100% protected</p>
                </div>
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
      <FlashSaleSection className="bg-gradient-to-r from-[hsl(var(--accent))]/10 to-transparent" />

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

      {/* Category Sections */}
      
      {/* Decorations & Balloons */}
      <ProductSection
        title="Decorations & Balloons"
        subtitle="Create stunning atmospheres for your events"
        icon={<Sparkles className="h-5 w-5" />}
        products={decorationsProducts || []}
        isLoading={decorationsLoading}
        viewAllLink="/category/decorations-balloons"
      />

      {/* Sound & Lighting */}
      <ProductSection
        title="Sound & Lighting"
        subtitle="Professional audio and visual equipment"
        icon={<Zap className="h-5 w-5" />}
        products={soundLightingProducts || []}
        isLoading={soundLightingLoading}
        viewAllLink="/category/sound-lighting"
        className="bg-gradient-to-r from-[hsl(var(--muted))]/50 to-transparent"
      />

      {/* Furniture & Tents */}
      <ProductSection
        title="Furniture & Tents"
        subtitle="Comfortable seating and elegant setups"
        icon={<Home className="h-5 w-5" />}
        products={furnitureProducts || []}
        isLoading={furnitureLoading}
        viewAllLink="/category/furniture-tents"
      />

      {/* Catering Equipment */}
      <ProductSection
        title="Catering Equipment"
        subtitle="Everything you need to serve with style"
        icon={<UtensilsCrossed className="h-5 w-5" />}
        products={cateringProducts || []}
        isLoading={cateringLoading}
        viewAllLink="/category/catering-equipment"
        className="bg-[hsl(var(--muted))]"
      />

      {/* All Products Section with Filters */}
      <section className="bg-[radial-gradient(70%_40%_at_50%_0%,hsla(12,85%,55%,0.08)_0%,transparent_70%)] py-6 sm:py-8 md:py-10">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-card)] sm:p-6 md:p-8">
            {/* Section Header */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl font-bold text-[hsl(var(--foreground))] sm:text-2xl">
                All Products
              </h2>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                Explore our wide selection of quality products
              </p>
            </div>

            {/* Filters + Products Layout */}
            <div className="flex gap-6 lg:gap-8">
              {/* Filter Sidebar - Hidden on mobile and tablet */}
              <div className="hidden lg:block lg:w-64 xl:w-72">
                <FilterSidebar />
              </div>

              {/* Products Area */}
              <div className="flex-1 min-w-0">
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
        </div>
      </section>
    </>
  )
}
