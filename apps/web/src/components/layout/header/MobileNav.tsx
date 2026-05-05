import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  Baby,
  BookOpen,
  Car,
  ChevronDown,
  ChevronRight,
  Download,
  Dumbbell,
  Flower,
  Gamepad2,
  Home,
  LayoutPanelTop,
  Menu,
  Mic,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Store,
  UtensilsCrossed,
  X,
  Zap,
} from 'lucide-react'
import type { CategoryIconName } from '@/types'
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
  LayoutPanelTop,
  Flower,
  Gamepad2,
}

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

interface NavSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: Array<{ href: string; label: string; description?: string }>
}

const navSections: Array<NavSection> = [
  {
    id: 'decor',
    label: 'Decor',
    icon: Sparkles,
    items: [
      {
        href: '/category/decorations-balloons?subcategory=balloon-arches',
        label: 'Balloon Arches & Bouquets',
      },
      {
        href: '/category/decorations-balloons?subcategory=backdrops',
        label: 'Backdrops & Photo Walls',
      },
      {
        href: '/category/decorations-balloons?subcategory=led-decor',
        label: 'LED Lights & Neon Signs',
      },
      {
        href: '/category/decorations-balloons?subcategory=themed-decor',
        label: 'Themed Decorations',
      },
      {
        href: '/category/decorations-balloons?subcategory=entrance-decor',
        label: 'Entrance & Gate Decor',
      },
      { href: '/category/decorations-balloons', label: 'View All' },
    ],
  },
  {
    id: 'sound-lighting',
    label: 'Sound & Lighting',
    icon: Mic,
    items: [
      {
        href: '/category/sound-lighting?subcategory=pa-systems',
        label: 'PA Systems & Speakers',
      },
      {
        href: '/category/sound-lighting?subcategory=microphones',
        label: 'Microphones & Wireless',
      },
      {
        href: '/category/sound-lighting?subcategory=dj-equipment',
        label: 'DJ Equipment',
      },
      {
        href: '/category/sound-lighting?subcategory=stage-lights',
        label: 'Stage Lights & Effects',
      },
      {
        href: '/category/sound-lighting?subcategory=projectors',
        label: 'Projectors & Screens',
      },
      { href: '/category/sound-lighting', label: 'View All' },
    ],
  },
  {
    id: 'catering',
    label: 'Catering',
    icon: UtensilsCrossed,
    items: [
      {
        href: '/category/catering-equipment?subcategory=chafing-dishes',
        label: 'Chafing Dishes & Warmers',
      },
      {
        href: '/category/catering-equipment?subcategory=glassware',
        label: 'Glassware & Drinkware',
      },
      {
        href: '/category/catering-equipment?subcategory=bar-equipment',
        label: 'Bar Equipment',
      },
      {
        href: '/category/catering-equipment?subcategory=serving-platters',
        label: 'Serving Platters & Bowls',
      },
      {
        href: '/category/catering-equipment?subcategory=beverage-dispensers',
        label: 'Beverage Dispensers',
      },
      { href: '/category/catering-equipment', label: 'View All' },
    ],
  },
]

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(false)
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-80 overflow-y-auto bg-[hsl(var(--background))] shadow-xl transition-transform duration-300 ease-in-out lg:hidden',
          'translate-x-0',
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-4">
          <div className="flex items-center gap-2">
            <Menu className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h2 className="text-lg font-semibold">Menu</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-2 hover:bg-[hsl(var(--muted))]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4">
          {/* Home Link */}
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
          >
            <Home className="h-5 w-5 text-[hsl(var(--primary))]" />
            <span>Home</span>
          </Link>

          {/* Navigation Sections with Dropdowns */}
          <div className="mt-2 space-y-1">
            {navSections.map((section) => {
              const isExpanded = expandedSection === section.id
              const SectionIcon = section.icon

              return (
                <div key={section.id} className="rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <SectionIcon className="h-5 w-5 text-[hsl(var(--primary))]" />
                      <span>{section.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isExpanded && 'rotate-180',
                      )}
                    />
                  </button>

                  {/* Dropdown Items */}
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-200',
                      isExpanded ? 'max-h-96' : 'max-h-0',
                    )}
                  >
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-[hsl(var(--border))] pl-4">
                      {section.items.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-[hsl(var(--muted))] transition-colors"
                        >
                          <ChevronRight className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                          <div>
                            <span className="text-[hsl(var(--foreground))]">
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="block text-xs text-[hsl(var(--muted-foreground))]">
                                {item.description}
                              </span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Flash Deals Highlight */}
          <Link
            to="/flash-deals"
            onClick={onClose}
            className="mt-4 flex items-center gap-3 rounded-lg bg-linear-to-r from-[hsl(var(--accent))] to-[hsl(var(--secondary))] px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg"
          >
            <Zap className="h-5 w-5" />
            <span>Flash Deals</span>
          </Link>

          {/* Become a Vendor - Highlighted CTA */}
          <Link
            to="/become-vendor"
            onClick={onClose}
            className="mt-3 flex items-center justify-between rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-95"
            aria-label="Become a vendor and start selling"
          >
            <div className="flex items-center gap-3">
              <Store className="h-5 w-5" />
              <span>Become a Vendor</span>
            </div>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
              NEW
            </span>
          </Link>

          {/* All Categories Button */}
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="mt-4 flex w-full items-center justify-between rounded-lg bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[hsl(var(--primary))]/90"
          >
            <div className="flex items-center gap-3">
              <Menu className="h-5 w-5" />
              <span>All Categories</span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                showCategories && 'rotate-180',
              )}
            />
          </button>

          {/* Categories List */}
          <div
            className={cn(
              'overflow-hidden transition-all duration-300',
              showCategories ? 'max-h-screen mt-2' : 'max-h-0',
            )}
          >
            {categoriesLoading ? (
              <div className="space-y-2 px-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded bg-[hsl(var(--muted))]"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-1 px-2">
                {categories?.map((category) => {
                  const Icon = iconMap[category.icon]
                  if (!Icon) return null

                  return (
                    <a
                      key={category.id}
                      href={`/category/${category.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2.5 text-sm hover:bg-[hsl(var(--muted))] transition-colors"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                        <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </>
  )
}
