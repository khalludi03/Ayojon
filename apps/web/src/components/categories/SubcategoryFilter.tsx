import { cn } from '@/lib/utils';
import type { Subcategory } from '@/types';

interface SubcategoryFilterProps {
  subcategories: Subcategory[];
  activeSubcategoryId?: string;
  onSubcategoryChange: (subcategoryId: string | undefined) => void;
  className?: string;
}

export function SubcategoryFilter({
  subcategories,
  activeSubcategoryId,
  onSubcategoryChange,
  className,
}: SubcategoryFilterProps) {
  if (!subcategories || subcategories.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Horizontal scroll */}
      <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {/* All option */}
        <button
          onClick={() => onSubcategoryChange(undefined)}
          className={cn(
            'flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
            !activeSubcategoryId
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent'
          )}
          type="button"
        >
          All
        </button>

        {/* Subcategory options */}
        {subcategories.map((subcategory) => (
          <button
            key={subcategory.id}
            onClick={() => onSubcategoryChange(subcategory.id)}
            className={cn(
              'flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              activeSubcategoryId === subcategory.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-accent'
            )}
            type="button"
          >
            {subcategory.name}
          </button>
        ))}
      </div>
    </div>
  );
}
