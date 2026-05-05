import * as React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Baby,
  BookOpen,
  Camera,
  Car,
  ChevronRight,
  Download,
  Dumbbell,
  Flower,
  Gamepad2,
  Home,
  LayoutPanelTop,
  Menu,
  Mic,
  PartyPopper,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
} from 'lucide-react'
import type { CategoryIconName } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCategories } from '@/hooks/use-categories'

const iconMap: Record<
  CategoryIconName,
  React.ComponentType<{ className?: string }>
> = {
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  BookOpen,
  Dumbbell,
  ShoppingBasket,
  Baby,
  Car,
  Download,
  Mic,
  UtensilsCrossed,
  Camera,
  PartyPopper,
  LayoutPanelTop,
  Flower,
  Gamepad2,
}

export function MegaMenu() {
  const { data: categories } = useCategories()
  const [activeCategoryId, setActiveCategoryId] = React.useState<string | null>(
    null,
  )

  // Set first category as active by default when categories load
  React.useEffect(() => {
    if (categories && categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id)
    }
  }, [categories, activeCategoryId])

  const activeCategory = categories?.find((c) => c.id === activeCategoryId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="hidden gap-2 md:flex">
          <Menu className="h-5 w-5" />
          Categories
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[800px] p-0"
        align="start"
        sideOffset={8}
      >
        <div className="flex h-[400px]">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0 border-r bg-[hsl(var(--muted))]/30 py-2">
            <div className="px-4 py-2 text-xs font-semibold uppercase text-[hsl(var(--muted-foreground))]">
              Categories
            </div>
            <div className="flex flex-col gap-1 px-2 h-[350px] overflow-y-auto">
              {categories?.map((category) => {
                const Icon = iconMap[category.icon]
                return (
                  <button
                    key={category.id}
                    className={cn(
                      'flex w-full items-center justify-between rounded-sm px-2 py-2 text-sm font-medium transition-colors hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
                      activeCategoryId === category.id &&
                        'bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]',
                    )}
                    onMouseEnter={() => setActiveCategoryId(category.id)}
                    onClick={() => setActiveCategoryId(category.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{category.name}</span>
                    </div>
                    {activeCategoryId === category.id && (
                      <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeCategory ? (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight">
                    {activeCategory.name}
                  </h3>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Explore the best {activeCategory.name} products.
                  </p>
                </div>

                {activeCategory.subcategories &&
                activeCategory.subcategories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {activeCategory.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to="/products"
                        // search={{ category: activeCategory.slug, subcategory: sub.slug }}
                        className="block rounded-md border p-3 hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                      >
                        <div className="font-medium">{sub.name}</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                    No subcategories found.
                  </div>
                )}

                <div className="mt-4">
                  <Link
                    to="/products"
                    className="text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                  >
                    View all {activeCategory.name}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-[hsl(var(--muted-foreground))]">
                Select a category
              </div>
            )}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
