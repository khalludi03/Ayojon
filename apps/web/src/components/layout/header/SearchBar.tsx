import { useEffect, useRef, useState } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useSearchState } from '@/hooks/use-search';
import { useCategories } from '@/hooks/use-categories';
import { SearchResultsSkeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';

const POPULAR_SEARCHES = [
  'Wedding decorations',
  'Birthday balloons',
  'Sound system',
  'LED lights',
  'Furniture rental',
];

export function SearchBar() {
  const { query, setQuery, results, isLoading, isOpen, setIsOpen, clearSearch, hasResults } =
    useSearchState();
  const { data: categories } = useCategories();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save search to recent searches
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Clear recent search
  const clearRecentSearch = (searchQuery: string) => {
    const updated = recentSearches.filter((s) => s !== searchQuery);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

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

  // Filter matching categories
  const matchingCategories =
    query.length >= 2
      ? categories?.filter((cat) =>
          cat.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3) || []
      : [];

  // Total suggestions count
  const totalSuggestions = results.length + matchingCategories.length;

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalSuggestions - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        // Navigate to selected item
        if (selectedIndex < matchingCategories.length) {
          const category = matchingCategories[selectedIndex];
          window.location.href = `/category/${category.slug}`;
        } else {
          const product = results[selectedIndex - matchingCategories.length];
          window.location.href = `/product/${product.slug}`;
        }
      } else if (query.trim()) {
        // Perform full search
        saveRecentSearch(query);
        window.location.href = `/products?search=${encodeURIComponent(query)}`;
      }
      setIsOpen(false);
    }
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-900 font-medium">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const showRecent = isOpen && query.length === 0 && recentSearches.length > 0;
  const showSuggestions = isOpen && query.length >= 2;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search for products, brands and more..."
          className="h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          aria-label="Search products"
          aria-expanded={isOpen && (showRecent || showSuggestions)}
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `search-item-${selectedIndex}` : undefined}
          role="combobox"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors hover:bg-[hsl(var(--muted))]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {(showRecent || showSuggestions) && (
        <div
          id="search-results"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[32rem] overflow-auto rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--popover))] shadow-lg"
          role="listbox"
        >
          {/* Recent Searches */}
          {showRecent && (
            <div className="border-b border-[hsl(var(--border))] p-3">
              <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                <Clock className="h-3.5 w-3.5" />
                <span>Recent Searches</span>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded p-2 transition-colors hover:bg-[hsl(var(--muted))]"
                  >
                    <button
                      onClick={() => {
                        setQuery(search);
                        saveRecentSearch(search);
                        window.location.href = `/products?search=${encodeURIComponent(search)}`;
                      }}
                      className="flex-1 text-left text-sm text-[hsl(var(--foreground))]"
                    >
                      {search}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearRecentSearch(search);
                      }}
                      className="rounded p-1 transition-colors hover:bg-[hsl(var(--accent))]"
                      aria-label="Remove from recent"
                    >
                      <X className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {showSuggestions && (
            <>
              {isLoading ? (
                <SearchResultsSkeleton count={5} />
              ) : (
                <div className="p-2">
                  {/* Popular Searches */}
                  {query.length === 2 && !hasResults && matchingCategories.length === 0 && (
                    <div className="mb-3">
                      <div className="mb-2 flex items-center gap-2 px-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Popular Searches</span>
                      </div>
                      <div className="space-y-1">
                        {POPULAR_SEARCHES.map((search, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setQuery(search);
                              saveRecentSearch(search);
                              window.location.href = `/products?search=${encodeURIComponent(search)}`;
                            }}
                            className="w-full rounded px-2 py-1.5 text-left text-sm text-[hsl(var(--foreground))] transition-colors hover:bg-[hsl(var(--muted))]"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categories */}
                  {matchingCategories.length > 0 && (
                    <div className="mb-3">
                      <div className="mb-2 px-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        Categories
                      </div>
                      <ul className="space-y-1">
                        {matchingCategories.map((category, idx) => (
                          <li key={category.id}>
                            <a
                              id={`search-item-${idx}`}
                              href={`/category/${category.slug}`}
                              className={cn(
                                'flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-[hsl(var(--muted))]',
                                selectedIndex === idx && 'bg-[hsl(var(--muted))]'
                              )}
                              onClick={() => {
                                saveRecentSearch(query);
                                setIsOpen(false);
                              }}
                              role="option"
                              aria-selected={selectedIndex === idx}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
                                {category.icon}
                              </div>
                              <span className="font-medium text-[hsl(var(--foreground))]">
                                {highlightMatch(category.name, query)}
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Products */}
                  {hasResults && (
                    <div>
                      <div className="mb-2 px-2 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                        Products
                      </div>
                      <ul className="space-y-1">
                        {results.map((product, idx) => {
                          const itemIndex = matchingCategories.length + idx;
                          return (
                            <li key={product.id}>
                              <a
                                id={`search-item-${itemIndex}`}
                                href={`/product/${product.slug}`}
                                className={cn(
                                  'flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-[hsl(var(--muted))]',
                                  selectedIndex === itemIndex && 'bg-[hsl(var(--muted))]'
                                )}
                                onClick={() => {
                                  saveRecentSearch(query);
                                  setIsOpen(false);
                                }}
                                role="option"
                                aria-selected={selectedIndex === itemIndex}
                              >
                                <img
                                  src={product.images[0]?.url}
                                  alt={product.title}
                                  className="h-12 w-12 rounded object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                                    {highlightMatch(product.title, query)}
                                  </p>
                                  <p className="text-sm font-semibold text-[hsl(var(--brand-orange))]">
                                    {formatPrice(product.pricing.currentPrice)}
                                  </p>
                                </div>
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {/* No Results */}
                  {!hasResults && matchingCategories.length === 0 && query.length > 2 && (
                    <div className="p-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
                      No results found for "{query}"
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
