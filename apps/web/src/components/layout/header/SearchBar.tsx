import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useSearchState } from '@/hooks/use-search';
import { SearchResultsSkeleton } from '@/components/ui/skeleton';
import { cn, formatPrice  } from '@/lib/utils';

export function SearchBar() {
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, clearSearch, hasResults } =
    useSearchState();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, brands and more..."
          className="h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]"
          aria-label="Search products"
          aria-expanded={isOpen && (hasResults || isLoading)}
          aria-controls="search-results"
          role="combobox"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-[hsl(var(--muted))]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          id="search-results"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg"
          role="listbox"
        >
          {isLoading ? (
            <SearchResultsSkeleton count={5} />
          ) : hasResults ? (
            <ul className="p-2">
              {results.map((product) => (
                <li key={product.id}>
                  <a
                    href={`/product/${product.slug}`}
                    className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[hsl(var(--muted))]"
                    onClick={() => setIsOpen(false)}
                    role="option"
                  >
                    <img
                      src={product.images[0]?.url}
                      alt={product.title}
                      className="h-12 w-12 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                        {product.title}
                      </p>
                      <p className="text-sm text-[hsl(var(--brand-orange))]">
                        {formatPrice(product.pricing.currentPrice)}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
