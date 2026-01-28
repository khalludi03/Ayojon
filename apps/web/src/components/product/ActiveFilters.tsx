import { X } from 'lucide-react';
import { useFilters } from '@/stores/filter-store';
import { useCategories } from '@/hooks/use-categories';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export function ActiveFilters() {
  const { filters, clearFilter, clearAllFilters, activeFilterCount } = useFilters();
  const { data: categories } = useCategories();

  if (activeFilterCount === 0) return null;

  const getCategoryName = (id: string) => {
    return categories?.find((c) => c.id === id)?.name || id;
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-[hsl(var(--muted-foreground))]">Active filters:</span>

      {filters.category && (
        <Badge variant="outline" className="gap-1 pr-1">
          Category: {getCategoryName(filters.category)}
          <button
            onClick={() => clearFilter('category')}
            className="ml-1 rounded-full p-0.5 hover:bg-[hsl(var(--muted))]"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
        <Badge variant="outline" className="gap-1 pr-1">
          Price: {formatPrice(filters.minPrice || 0)} - {formatPrice(filters.maxPrice || 50000)}
          <button
            onClick={() => {
              clearFilter('minPrice');
              clearFilter('maxPrice');
            }}
            className="ml-1 rounded-full p-0.5 hover:bg-[hsl(var(--muted))]"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.minRating !== undefined && (
        <Badge variant="outline" className="gap-1 pr-1">
          Rating: {filters.minRating}+ Stars
          <button
            onClick={() => clearFilter('minRating')}
            className="ml-1 rounded-full p-0.5 hover:bg-[hsl(var(--muted))]"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.freeShipping && (
        <Badge variant="outline" className="gap-1 pr-1">
          Free Shipping
          <button
            onClick={() => clearFilter('freeShipping')}
            className="ml-1 rounded-full p-0.5 hover:bg-[hsl(var(--muted))]"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.onSale && (
        <Badge variant="outline" className="gap-1 pr-1">
          On Sale
          <button
            onClick={() => clearFilter('onSale')}
            className="ml-1 rounded-full p-0.5 hover:bg-[hsl(var(--muted))]"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.inStock && (
        <Badge variant="outline" className="gap-1 pr-1">
          In Stock
          <button
            onClick={() => clearFilter('inStock')}
            className="ml-1 rounded-full p-0.5 hover:bg-[hsl(var(--muted))]"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {filters.search && (
        <Badge variant="outline" className="gap-1 pr-1">
          Search: "{filters.search}"
          <button
            onClick={() => clearFilter('search')}
            className="ml-1 rounded-full p-0.5 hover:bg-[hsl(var(--muted))]"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      )}

      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
        Clear all
      </Button>
    </div>
  );
}

export default ActiveFilters;
