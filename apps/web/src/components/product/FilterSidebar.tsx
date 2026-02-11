import { SlidersHorizontal } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { useFilters, usePriceRange } from '@/stores/filter-store';
import { RangeSlider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRICE_PRESETS, EVENT_TYPES, PRODUCT_CONDITIONS } from '@/types';
import type { ProductCondition } from '@/types';
import { cn, formatPrice } from '@/lib/utils';

interface FilterSidebarProps {
  className?: string;
}

export function FilterSidebar({ className }: FilterSidebarProps) {
  const { data: categories } = useCategories();
  const { filters, setFilter, clearFilter, clearAllFilters, activeFilterCount } = useFilters();
  const { minPrice, maxPrice, setPriceRange } = usePriceRange();

  const toggleEventType = (eventType: string) => {
    const current = filters.eventTypes || [];
    const updated = current.includes(eventType)
      ? current.filter((t) => t !== eventType)
      : [...current, eventType];
    setFilter('eventTypes', updated.length > 0 ? updated : undefined);
  };

  return (
    <aside className={cn('w-64 shrink-0 space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Filters</h2>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="mb-3 font-medium">Category</h3>
        <div className="space-y-2">
          {categories?.map((category) => (
            <label
              key={category.id}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="category"
                checked={filters.category === category.id}
                onChange={() => setFilter('category', category.id)}
                className="h-4 w-4 border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
              <span className="text-sm">{category.name}</span>
              {category.productCount !== undefined && (
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  ({category.productCount})
                </span>
              )}
            </label>
          ))}
          {filters.category && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => clearFilter('category')}
            >
              Clear category
            </Button>
          )}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h3 className="mb-3 font-medium">Price Range</h3>
        <RangeSlider
          min={0}
          max={50000}
          step={100}
          value={[minPrice || 0, maxPrice || 50000]}
          onChange={([min, max]) => setPriceRange(min || undefined, max === 50000 ? undefined : max)}
          formatLabel={(value) => formatPrice(value)}
        />

        {/* Presets */}
        <div className="mt-3 flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setPriceRange(preset.min, preset.max)}
              className={cn(
                'rounded-full border border-[hsl(var(--border))] px-3 py-1 text-xs transition-colors',
                minPrice === preset.min && maxPrice === preset.max
                  ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-white'
                  : 'hover:border-[hsl(var(--primary))]'
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Event Type Filter */}
      <div>
        <h3 className="mb-3 font-medium">Event Type</h3>
        <div className="space-y-2">
          {EVENT_TYPES.map((event) => (
            <label
              key={event.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={filters.eventTypes?.includes(event.value) || false}
                onChange={() => toggleEventType(event.value)}
                className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
              <span className="text-sm">{event.label}</span>
            </label>
          ))}
          {filters.eventTypes && filters.eventTypes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => clearFilter('eventTypes')}
            >
              Clear event types
            </Button>
          )}
        </div>
      </div>

      {/* Product Condition Filter */}
      <div>
        <h3 className="mb-3 font-medium">Product Condition</h3>
        <div className="space-y-2">
          {PRODUCT_CONDITIONS.map((condition) => (
            <label
              key={condition.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="condition"
                checked={filters.productCondition === condition.value}
                onChange={() => setFilter('productCondition', condition.value as ProductCondition)}
                className="h-4 w-4 border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
              <span className="text-sm">{condition.label}</span>
            </label>
          ))}
          {filters.productCondition && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => clearFilter('productCondition')}
            >
              Any condition
            </Button>
          )}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="mb-3 font-medium">Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === rating}
                onChange={() => setFilter('minRating', rating)}
                className="h-4 w-4 border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
              />
              <span className="text-sm">{rating}+ Stars</span>
            </label>
          ))}
          {filters.minRating && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs"
              onClick={() => clearFilter('minRating')}
            >
              Any rating
            </Button>
          )}
        </div>
      </div>

      {/* Checkbox Filters */}
      <div>
        <h3 className="mb-3 font-medium">More Options</h3>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.freeShipping || false}
              onChange={(e) => setFilter('freeShipping', e.target.checked || undefined)}
              className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <span className="text-sm">Free Shipping</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.onSale || false}
              onChange={(e) => setFilter('onSale', e.target.checked || undefined)}
              className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <span className="text-sm">On Sale</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) => setFilter('inStock', e.target.checked || undefined)}
              className="h-4 w-4 rounded border-[hsl(var(--border))] text-[hsl(var(--primary))] focus:ring-[hsl(var(--primary))]"
            />
            <span className="text-sm">In Stock Only</span>
          </label>
        </div>
      </div>
    </aside>
  );
}

export default FilterSidebar;
