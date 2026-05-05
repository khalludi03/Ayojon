import { CategoryCard } from './CategoryCard'
import { useCategories } from '@/hooks/use-categories'
import { CategoryCardSkeleton } from '@/components/ui/skeleton'

export function CategoriesSection() {
  const { data: categories, isLoading } = useCategories()

  return (
    <section className="py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">
            Shop by Category
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Browse our wide selection of products
          </p>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[hsl(var(--muted-foreground))]">
            No categories available
          </div>
        )}
      </div>
    </section>
  )
}

export default CategoriesSection
