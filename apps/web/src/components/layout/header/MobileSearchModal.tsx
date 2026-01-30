import { useEffect, useRef, useState } from 'react';
import { Search, X, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import { useSearchState } from '@/hooks/use-search';
import { useCategories } from '@/hooks/use-categories';
import { SearchResultsSkeleton } from '@/components/ui/skeleton';
import { cn, formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const POPULAR_SEARCHES = [
  'Wedding decorations',
  'Birthday balloons',
  'Sound system',
  'LED lights',
  'Furniture rental',
];

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSearchModal({ isOpen, onClose }: MobileSearchModalProps) {
  const { query, setQuery, results, isLoading, hasResults } = useSearchState();
  const { data: categories } = useCategories();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updated = [searchQuery, ...recentSearches.filter((s) => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearch = (searchQuery: string) => {
    const updated = recentSearches.filter((s) => s !== searchQuery);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const matchingCategories =
    query.length >= 2
      ? categories?.filter((cat) => cat.name.toLowerCase().includes(query.toLowerCase())).slice(0, 3) || []
      : [];

  const totalSuggestions = results.length + matchingCategories.length;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalSuggestions - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (selectedIndex < matchingCategories.length) {
          const category = matchingCategories[selectedIndex];
          window.location.href = `/category/${category.slug}`;
        } else {
          const product = results[selectedIndex - matchingCategories.length];
          window.location.href = `/product/${product.slug}`;
        }
      } else if (query.trim()) {
        saveRecentSearch(query);
        window.location.href = `/products?search=${encodeURIComponent(query)}`;
      }
    }
  };

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

  const showRecent = query.length === 0 && recentSearches.length > 0;
  const showSuggestions = query.length >= 2;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="flex h-14 items-center gap-2 border-b border-[hsl(var(--border))] px-2">
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close search">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search for products..."
            className="h-10 w-full rounded-lg border border-[hsl(var(--input))] bg-[hsl(var(--background))] pl-10 pr-10 text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-3.5rem)] overflow-auto p-4">
        {showRecent && (
          <div className="mb-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
              <Clock className="h-4 w-4" />
              <span>Recent Searches</span>
            </div>
            <div className="space-y-2">
              {recentSearches.map((search, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-[hsl(var(--muted))] p-3">
                  <button
                    onClick={() => {
                      setQuery(search);
                      saveRecentSearch(search);
                      window.location.href = `/products?search=${encodeURIComponent(search)}`;
                    }}
                    className="flex-1 text-left text-sm"
                  >
                    {search}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearRecentSearch(search);
                    }}
                    className="rounded p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSuggestions && (
          <>
            {isLoading ? (
              <SearchResultsSkeleton count={5} />
            ) : (
              <div className="space-y-4">
                {query.length === 2 && !hasResults && matchingCategories.length === 0 && (
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-[hsl(var(--muted-foreground))]">
                      <TrendingUp className="h-4 w-4" />
                      <span>Popular Searches</span>
                    </div>
                    <div className="space-y-2">
                      {POPULAR_SEARCHES.map((search, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setQuery(search);
                            saveRecentSearch(search);
                            window.location.href = `/products?search=${encodeURIComponent(search)}`;
                          }}
                          className="w-full rounded-lg bg-[hsl(var(--muted))] p-3 text-left text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {matchingCategories.length > 0 && (
                  <div>
                    <div className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Categories</div>
                    <div className="space-y-2">
                      {matchingCategories.map((category, idx) => (
                        <a
                          key={category.id}
                          href={`/category/${category.slug}`}
                          className={cn(
                            'flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-3',
                            selectedIndex === idx && 'ring-2 ring-[hsl(var(--primary))]'
                          )}
                          onClick={() => {
                            saveRecentSearch(query);
                            onClose();
                          }}
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary))]/10">
                            {category.icon}
                          </div>
                          <span className="font-medium">{highlightMatch(category.name, query)}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {hasResults && (
                  <div>
                    <div className="mb-3 text-sm font-medium text-[hsl(var(--muted-foreground))]">Products</div>
                    <div className="space-y-2">
                      {results.map((product, idx) => {
                        const itemIndex = matchingCategories.length + idx;
                        return (
                          <a
                            key={product.id}
                            href={`/product/${product.slug}`}
                            className={cn(
                              'flex items-center gap-3 rounded-lg bg-[hsl(var(--muted))] p-3',
                              selectedIndex === itemIndex && 'ring-2 ring-[hsl(var(--primary))]'
                            )}
                            onClick={() => {
                              saveRecentSearch(query);
                              onClose();
                            }}
                          >
                            <img src={product.images[0]?.url} alt={product.title} className="h-16 w-16 rounded object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{highlightMatch(product.title, query)}</p>
                              <p className="text-sm font-semibold text-[hsl(var(--brand-orange))]">
                                {formatPrice(product.pricing.currentPrice)}
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {!hasResults && matchingCategories.length === 0 && query.length > 2 && (
                  <div className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">
                    No results found for "{query}"
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
