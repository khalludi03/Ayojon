import { useState, useEffect } from 'react';
import {
  Baby,
  BookOpen,
  Car,
  ChevronRight,
  Download,
  Dumbbell,
  Home,
  LayoutGrid,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react';
import type { CategoryIconName, Category } from '@/types';
import { useCategories } from '@/hooks/use-categories';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';

const iconMap: Record<CategoryIconName, React.ComponentType<{ className?: string }>> = {
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
};

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const { data: categories, isLoading } = useCategories();
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);

  // Reset active category when menu opens
  useEffect(() => {
    if (isOpen && categories && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  return (
    <div 
      onMouseLeave={() => {
        if (window.innerWidth >= 1024) {
          onClose();
        }
      }}
    >
      {/* Backdrop - Desktop only */}
      <div
        className="hidden lg:block fixed inset-0 z-40 bg-black/25 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mega Menu Dropdown - Desktop only */}
      <div className="hidden lg:block fixed left-1/2 -translate-x-1/2 top-[var(--header-height,140px)] z-50 w-full max-w-7xl px-4 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex h-[550px] overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl">
          
          {/* Sidebar - Category List */}
          <div className="w-[300px] flex-shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--primary))] px-6 py-4 text-white">
              <div className="flex items-center gap-2 font-bold">
                <LayoutGrid className="h-5 w-5" />
                <span>All Categories</span>
              </div>
            </div>
            
            <nav className="h-[calc(100%-60px)] overflow-y-auto py-2 scrollbar-thin">
              {isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
                  ))}
                </div>
              ) : (
                <ul className="space-y-0.5">
                  {categories?.map((category) => {
                    const Icon = iconMap[category.icon];
                    const isActive = activeCategory?.id === category.id;
                    
                    return (
                      <li key={category.id}>
                        <button
                          onMouseEnter={() => setActiveCategory(category)}
                          className={cn(
                            "group flex w-full items-center justify-between px-6 py-3.5 text-left transition-all",
                            isActive 
                              ? "bg-[hsl(var(--card))] text-[hsl(var(--primary))] font-semibold shadow-sm" 
                              : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--card))] hover:text-[hsl(var(--primary))]"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                              isActive ? "bg-[hsl(var(--primary))]/10" : "bg-[hsl(var(--muted))]"
                            )}>
                              <Icon className={cn("h-4.5 w-4.5", isActive ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground)) group-hover:text-[hsl(var(--primary))")]} />
                            </div>
                            <span className="text-[15px]">{category.name}</span>
                          </div>
                          <ChevronRight className={cn(
                            "h-4 w-4 transition-transform",
                            isActive ? "translate-x-1 opacity-100" : "opacity-0 group-hover:opacity-100"
                          )} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </nav>
          </div>

          {/* Content Area - Subcategories & Features */}
          <div className="flex-1 bg-[hsl(var(--card))] p-8 overflow-y-auto scrollbar-thin relative">
            <button
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] transition-all"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>

            {activeCategory ? (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="mb-8 flex items-center justify-between border-b border-[hsl(var(--border))] pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[hsl(var(--foreground))]">{activeCategory.name}</h3>
                    <p className="text-[hsl(var(--muted-foreground))]">Explore our collection of {activeCategory.name.toLowerCase()}</p>
                  </div>
                  <Link
                    to={`/category/${activeCategory.slug}`}
                    onClick={onClose}
                    className="group flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))] hover:underline"
                  >
                    View All {activeCategory.name}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-x-12 gap-y-10">
                  {activeCategory.subcategories.length > 0 ? (
                    // In a real app, you might have groups of subcategories. 
                    // For now, let's group them or just list them.
                    <div className="col-span-2 grid grid-cols-2 gap-x-8 gap-y-8">
                      {/* Subcategory Grid */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Popular Subcategories</h4>
                        <ul className="space-y-3">
                          {activeCategory.subcategories.slice(0, 8).map((sub) => (
                            <li key={sub.id}>
                              <Link
                                to={`/category/${activeCategory.slug}/${sub.slug}`}
                                onClick={onClose}
                                className="block text-[15px] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {activeCategory.subcategories.length > 8 && (
                        <div className="space-y-4 pt-9">
                          <ul className="space-y-3">
                            {activeCategory.subcategories.slice(8, 16).map((sub) => (
                              <li key={sub.id}>
                                <Link
                                  to={`/category/${activeCategory.slug}/${sub.slug}`}
                                  onClick={onClose}
                                  className="block text-[15px] text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="col-span-2 flex h-60 items-center justify-center rounded-xl border-2 border-dashed border-[hsl(var(--border))]">
                      <p className="text-[hsl(var(--muted-foreground))]">No subcategories found</p>
                    </div>
                  )}

                  {/* Featured / Promo Section */}
                  <div className="col-span-1 space-y-6">
                    <div className="overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] p-6 text-white shadow-lg">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="mb-2 text-xl font-bold">Special Offer!</h4>
                      <p className="mb-4 text-sm text-white/80">Get up to 40% off on all items in {activeCategory.name}.</p>
                      <button className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-[hsl(var(--primary))] transition-transform hover:scale-105">
                        Shop Now
                      </button>
                    </div>
                    
                    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/20 p-5">
                      <h5 className="mb-3 font-semibold">Need Help?</h5>
                      <p className="text-sm text-[hsl(var(--muted-foreground))] mb-3">Our experts are here to help you find the best {activeCategory.name.toLowerCase()} for your needs.</p>
                      <Link to="/help" className="text-sm font-medium text-[hsl(var(--primary))] hover:underline">Contact Support</Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="h-16 w-16 animate-bounce rounded-full bg-[hsl(var(--primary))]/10 flex items-center justify-center">
                      <LayoutGrid className="h-8 w-8 text-[hsl(var(--primary))]" />
                    </div>
                  </div>
                  <p className="text-[hsl(var(--muted-foreground))]">Select a category to explore</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
