import { useState } from 'react'
import {
  Baby,
  ChevronRight,
  Home,
  LayoutGrid,
  Monitor,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Tv,
  Watch,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Category data with subcategories
const SIDEBAR_CATEGORIES = [
  {
    id: 'womens-clothing',
    name: "Women's Clothing",
    slug: 'womens-clothing',
    icon: Shirt,
    color: 'text-pink-500',
    subcategories: [
      { id: 'dresses', name: 'Dresses', slug: 'dresses' },
      { id: 'tops', name: 'Tops & Blouses', slug: 'tops' },
      { id: 'sarees', name: 'Sarees', slug: 'sarees' },
      { id: 'kurtis', name: 'Kurtis & Salwar', slug: 'kurtis' },
      { id: 'western-wear', name: 'Western Wear', slug: 'western-wear' },
    ],
  },
  {
    id: 'mens-clothing',
    name: "Men's Clothing",
    slug: 'mens-clothing',
    icon: Shirt,
    color: 'text-blue-500',
    subcategories: [
      { id: 'shirts', name: 'Shirts', slug: 'shirts' },
      { id: 't-shirts', name: 'T-Shirts', slug: 't-shirts' },
      { id: 'pants', name: 'Pants & Jeans', slug: 'pants' },
      { id: 'traditional', name: 'Traditional Wear', slug: 'traditional' },
      { id: 'activewear', name: 'Activewear', slug: 'activewear' },
    ],
  },
  {
    id: 'phones-accessories',
    name: 'Phones & Accessories',
    slug: 'phones-accessories',
    icon: Smartphone,
    color: 'text-emerald-500',
    subcategories: [
      { id: 'smartphones', name: 'Smartphones', slug: 'smartphones' },
      { id: 'cases-covers', name: 'Cases & Covers', slug: 'cases-covers' },
      { id: 'chargers', name: 'Chargers & Cables', slug: 'chargers' },
      {
        id: 'screen-protectors',
        name: 'Screen Protectors',
        slug: 'screen-protectors',
      },
      { id: 'earphones', name: 'Earphones & Headsets', slug: 'earphones' },
    ],
  },
  {
    id: 'computer-office',
    name: 'Computer & Office',
    slug: 'computer-office',
    icon: Monitor,
    color: 'text-violet-500',
    subcategories: [
      { id: 'laptops', name: 'Laptops', slug: 'laptops' },
      { id: 'desktops', name: 'Desktops', slug: 'desktops' },
      { id: 'monitors', name: 'Monitors', slug: 'monitors' },
      {
        id: 'keyboards-mice',
        name: 'Keyboards & Mice',
        slug: 'keyboards-mice',
      },
      { id: 'printers', name: 'Printers & Scanners', slug: 'printers' },
    ],
  },
  {
    id: 'consumer-electronics',
    name: 'Consumer Electronics',
    slug: 'consumer-electronics',
    icon: Tv,
    color: 'text-orange-500',
    subcategories: [
      { id: 'televisions', name: 'Televisions', slug: 'televisions' },
      { id: 'audio', name: 'Audio & Speakers', slug: 'audio' },
      { id: 'cameras', name: 'Cameras', slug: 'cameras' },
      { id: 'gaming', name: 'Gaming Consoles', slug: 'gaming' },
      {
        id: 'home-appliances',
        name: 'Home Appliances',
        slug: 'home-appliances',
      },
    ],
  },
  {
    id: 'jewelry-watches',
    name: 'Jewelry & Watches',
    slug: 'jewelry-watches',
    icon: Watch,
    color: 'text-amber-500',
    subcategories: [
      { id: 'necklaces', name: 'Necklaces', slug: 'necklaces' },
      { id: 'earrings', name: 'Earrings', slug: 'earrings' },
      { id: 'bracelets', name: 'Bracelets', slug: 'bracelets' },
      { id: 'mens-watches', name: "Men's Watches", slug: 'mens-watches' },
      { id: 'womens-watches', name: "Women's Watches", slug: 'womens-watches' },
    ],
  },
  {
    id: 'bags-shoes',
    name: 'Bags & Shoes',
    slug: 'bags-shoes',
    icon: ShoppingBag,
    color: 'text-rose-500',
    subcategories: [
      { id: 'handbags', name: 'Handbags', slug: 'handbags' },
      { id: 'backpacks', name: 'Backpacks', slug: 'backpacks' },
      { id: 'mens-shoes', name: "Men's Shoes", slug: 'mens-shoes' },
      { id: 'womens-shoes', name: "Women's Shoes", slug: 'womens-shoes' },
      { id: 'sports-shoes', name: 'Sports Shoes', slug: 'sports-shoes' },
    ],
  },
  {
    id: 'beauty-health',
    name: 'Beauty & Health',
    slug: 'beauty-health',
    icon: Sparkles,
    color: 'text-fuchsia-500',
    subcategories: [
      { id: 'skincare', name: 'Skincare', slug: 'skincare' },
      { id: 'makeup', name: 'Makeup', slug: 'makeup' },
      { id: 'haircare', name: 'Hair Care', slug: 'haircare' },
      { id: 'fragrance', name: 'Fragrance', slug: 'fragrance' },
    ],
  },
  {
    id: 'kids-baby',
    name: 'Kids & Baby',
    slug: 'kids-baby',
    icon: Baby,
    color: 'text-cyan-500',
    subcategories: [
      { id: 'baby-clothing', name: 'Baby Clothing', slug: 'baby-clothing' },
      { id: 'toys', name: 'Toys', slug: 'toys' },
      { id: 'baby-gear', name: 'Baby Gear', slug: 'baby-gear' },
    ],
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    slug: 'home-living',
    icon: Home,
    color: 'text-teal-500',
    subcategories: [
      { id: 'furniture', name: 'Furniture', slug: 'furniture' },
      { id: 'decor', name: 'Home Decor', slug: 'decor' },
      { id: 'kitchen', name: 'Kitchen & Dining', slug: 'kitchen' },
      { id: 'bedding', name: 'Bedding', slug: 'bedding' },
    ],
  },
]

interface CategorySidebarProps {
  className?: string
  onCategorySelect?: (categorySlug: string) => void
}

export function CategorySidebar({
  className,
  onCategorySelect,
}: CategorySidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  return (
    <aside
      className={cn(
        'w-64 flex-shrink-0 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary))]/80 px-4 py-3">
        <h2 className="flex items-center gap-2 font-bold text-white">
          <LayoutGrid className="h-5 w-5" />
          Browse Categories
        </h2>
      </div>

      {/* Category List */}
      <nav className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <ul className="py-2">
          {SIDEBAR_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category.id
            const isHovered = hoveredCategory === category.id
            const Icon = category.icon

            return (
              <li
                key={category.id}
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                {/* Main Category Item */}
                <button
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    'flex w-full items-center justify-between px-4 py-3 text-left transition-all duration-200',
                    'hover:bg-[hsl(var(--muted))] hover:pl-5',
                    isExpanded &&
                      'bg-[hsl(var(--primary))]/5 border-l-4 border-[hsl(var(--primary))]',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                        isHovered || isExpanded
                          ? 'bg-[hsl(var(--primary))]/10'
                          : 'bg-[hsl(var(--muted))]',
                      )}
                    >
                      <Icon className={cn('h-4 w-4', category.color)} />
                    </div>
                    <span
                      className={cn(
                        'text-sm font-medium transition-colors',
                        isExpanded
                          ? 'text-[hsl(var(--primary))]'
                          : 'text-[hsl(var(--foreground))]',
                      )}
                    >
                      {category.name}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'transition-transform duration-200',
                      isExpanded && 'rotate-90',
                    )}
                  >
                    <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  </div>
                </button>

                {/* Subcategories with animation */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
                  )}
                >
                  <ul className="border-l-2 border-[hsl(var(--border))] ml-6 py-1 bg-[hsl(var(--muted))]/30">
                    {category.subcategories.map((sub) => (
                      <li key={sub.id}>
                        <a
                          href={`/category/${category.slug}/${sub.slug}`}
                          onClick={(e) => {
                            e.preventDefault()
                            onCategorySelect?.(`${category.slug}/${sub.slug}`)
                          }}
                          className={cn(
                            'block py-2 pl-4 pr-4 text-sm text-[hsl(var(--muted-foreground))]',
                            'hover:text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5',
                            'transition-all duration-150 hover:pl-5',
                          )}
                        >
                          {sub.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ul>

        {/* View All Link */}
        <div className="border-t border-[hsl(var(--border))] p-3">
          <a
            href="/categories"
            className="flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--muted))] px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-all hover:bg-[hsl(var(--primary))] hover:text-white"
          >
            <LayoutGrid className="h-4 w-4" />
            View All Categories
          </a>
        </div>
      </nav>
    </aside>
  )
}

export default CategorySidebar
