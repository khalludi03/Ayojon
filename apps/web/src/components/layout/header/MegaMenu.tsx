import { Baby,
  BookOpen,
  Camera,
  Car,
  Download,
  Dumbbell,
  Flower,
  Gamepad2,
  Home,
  LayoutPanelTop,
  Mic,
  PartyPopper,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  UtensilsCrossed,
  X } from 'lucide-react';
import type { CategoryIconName } from '@/types';
import { useCategories } from '@/hooks/use-categories';

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
  Mic,
  UtensilsCrossed,
  Camera,
  PartyPopper,
  LayoutPanelTop,
  Flower,
  Gamepad2,
};

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MegaMenu({ isOpen, onClose }: MegaMenuProps) {
  const { data: categories, isLoading } = useCategories();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Desktop only */}
      <div
        className="hidden lg:block fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mega Menu Dropdown - Desktop only */}
      <div className="hidden lg:block fixed left-0 right-0 top-[var(--header-height,140px)] z-50 mx-auto max-w-7xl px-4">
        <div className="rounded-b-lg border border-t-0 border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl animate-slide-down overflow-hidden">
          <div className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/50 px-6 py-3">
            <h2 className="text-lg font-semibold">All Categories</h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 hover:bg-[hsl(var(--muted))] transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="p-6">
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-lg bg-[hsl(var(--muted))]" />
                ))}
              </div>
            </div>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-4">
                {categories?.map((category) => {
                  const Icon = iconMap[category.icon];
                  return (
                    <div key={category.id} className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-4 hover:shadow-md transition-shadow">
                      <a
                        href={`/category/${category.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                          <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
                        </div>
                        <span>{category.name}</span>
                      </a>

                      <div className="mt-3 space-y-1">
                        {category.subcategories.slice(0, 5).map((sub) => (
                          <a
                            key={sub.id}
                            href={`/category/${category.slug}/${sub.slug}`}
                            onClick={onClose}
                            className="block text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] hover:underline transition-colors"
                          >
                            {sub.name}
                          </a>
                        ))}
                        {category.subcategories.length > 5 && (
                          <a
                            href={`/category/${category.slug}`}
                            onClick={onClose}
                            className="block text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                          >
                            +{category.subcategories.length - 5} more
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
