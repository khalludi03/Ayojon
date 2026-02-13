import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface ProductSectionProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  products: Array<Product>
  isLoading?: boolean
  viewAllLink?: string
  className?: string
}

export function ProductSection({
  title,
  subtitle,
  icon,
  products,
  isLoading,
  viewAllLink,
  className,
}: ProductSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className={cn('py-5 sm:py-6 md:py-8', className)}>
      <div className="mx-auto max-w-7xl px-2 sm:px-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[var(--shadow-card)] sm:p-5 md:p-6">
          {/* Section Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              {icon && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] text-white sm:h-10 sm:w-10">
                  {icon}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-[hsl(var(--foreground))] sm:text-xl">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))] sm:text-sm">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              {viewAllLink && (
                <Link
                  to={viewAllLink}
                  className="hidden text-sm font-medium text-[hsl(var(--primary))] hover:underline sm:inline"
                >
                  View All
                </Link>
              )}
              <button
                onClick={() => scroll('left')}
                className="hidden rounded-full border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--muted))] sm:block"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scroll('right')}
                className="hidden rounded-full border border-[hsl(var(--border))] p-2 hover:bg-[hsl(var(--muted))] sm:block"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          <div
            ref={scrollRef}
            className="scrollbar-hide -mx-2 flex gap-2 overflow-x-auto px-2 pb-2 sm:-mx-4 sm:gap-3 sm:px-4 md:gap-4"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[145px] shrink-0 sm:w-[170px] md:w-[190px] lg:w-[200px]"
                  >
                    <ProductCardSkeleton />
                  </div>
                ))
              : products.map((product) => (
                  <div
                    key={product.id}
                    className="w-[145px] shrink-0 sm:w-[170px] md:w-[190px] lg:w-[200px]"
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductSection
