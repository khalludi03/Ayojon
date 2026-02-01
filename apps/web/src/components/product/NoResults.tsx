import { Link } from '@tanstack/react-router';
import { Search, Lightbulb, Grid3x3 } from 'lucide-react';
import { useCategories } from '@/hooks/use-categories';
import { CategoryCard } from '@/components/categories/CategoryCard';

interface NoResultsProps {
  searchQuery?: string;
  onClearFilters?: () => void;
}

export function NoResults({ searchQuery, onClearFilters }: NoResultsProps) {
  const { data: categories } = useCategories();

  // Get top 6 popular categories
  const popularCategories = categories?.slice(0, 6) || [];

  return (
    <div className="py-12 text-center">
      {/* No Results Icon & Message */}
      <div className="mb-8">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
          <Search className="h-10 w-10 text-[hsl(var(--muted-foreground))]" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-[hsl(var(--foreground))]">
          No Results Found
        </h2>
        {searchQuery && (
          <p className="text-[hsl(var(--muted-foreground))]">
            We couldn't find any products matching "{searchQuery}"
          </p>
        )}
      </div>

      {/* Search Suggestions */}
      <div className="mx-auto mb-12 max-w-2xl rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="mb-4 flex items-center gap-2 text-left">
          <Lightbulb className="h-5 w-5 text-[hsl(var(--primary))]" />
          <h3 className="font-semibold text-[hsl(var(--foreground))]">
            Search Tips
          </h3>
        </div>
        <ul className="space-y-2 text-left text-sm text-[hsl(var(--muted-foreground))]">
          <li className="flex items-start gap-2">
            <span className="mt-1 text-[hsl(var(--primary))]">•</span>
            <span>Check your spelling or try different keywords</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-[hsl(var(--primary))]">•</span>
            <span>Use more general terms or try fewer keywords</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-[hsl(var(--primary))]">•</span>
            <span>Browse our categories to discover products</span>
          </li>
          {onClearFilters && (
            <li className="flex items-start gap-2">
              <span className="mt-1 text-[hsl(var(--primary))]">•</span>
              <span>
                Try{' '}
                <button
                  onClick={onClearFilters}
                  className="font-medium text-[hsl(var(--primary))] underline-offset-4 hover:underline"
                >
                  clearing all filters
                </button>{' '}
                to see more results
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Popular Categories */}
      {popularCategories.length > 0 && (
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Grid3x3 className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
              Popular Categories
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {popularCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      )}

      {/* Browse All Link */}
      <div className="mt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[hsl(var(--primary))] underline-offset-4 hover:underline"
        >
          Browse all products
        </Link>
      </div>
    </div>
  );
}
