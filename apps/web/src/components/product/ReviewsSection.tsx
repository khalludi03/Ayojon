import { useState, useEffect } from 'react';
import { Star, Filter, ChevronDown, Loader2, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewCard } from './ReviewCard';
import { mockDb } from '@/mock/db';
import type { Review, ReviewSummary, ReviewFilter, ReviewSort } from '@/types/product';
import { cn } from '@/lib/utils';

interface ReviewsSectionProps {
  productId: string;
  hasPurchased?: boolean;
}

export function ReviewsSection({ productId, hasPurchased = false }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [sort, setSort] = useState<ReviewSort>('most_recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loadReviews = async (resetPage = false, nextPage?: number) => {
    setIsLoading(true);
    const currentPage = resetPage ? 1 : (nextPage || page);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const result = mockDb.getProductReviews(productId, {
      filter,
      sort,
      page: currentPage,
      limit: 10,
    });

    if (resetPage) {
      setReviews(result.data);
      setPage(1);
    } else {
      setReviews(prev => [...prev, ...result.data]);
      if (nextPage) {
        setPage(nextPage);
      }
    }
    
    setHasMore(result.hasMore);
    setIsLoading(false);
  };

  const loadSummary = () => {
    const reviewSummary = mockDb.getReviewSummary(productId);
    setSummary(reviewSummary);
  };

  useEffect(() => {
    loadSummary();
    loadReviews(true);
  }, [productId, filter, sort]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    loadReviews(false, nextPage);
  };

  const filterOptions: { value: ReviewFilter; label: string }[] = [
    { value: 'all', label: 'All Reviews' },
    { value: 'with_photos', label: 'With Photos' },
    { value: 'verified_purchase', label: 'Verified Purchase' },
  ];

  const sortOptions: { value: ReviewSort; label: string }[] = [
    { value: 'most_recent', label: 'Most Recent' },
    { value: 'most_helpful', label: 'Most Helpful' },
    { value: 'highest_rating', label: 'Highest Rating' },
    { value: 'lowest_rating', label: 'Lowest Rating' },
  ];

  if (!summary) return null;

  const getRatingPercentage = (rating: number) => {
    if (summary.totalReviews === 0) return 0;
    return (summary.ratingBreakdown[rating as keyof typeof summary.ratingBreakdown] / summary.totalReviews) * 100;
  };

  return (
    <div className="mt-16 border-t border-[hsl(var(--border))] pt-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-8">
          Customer Reviews
        </h2>

        {/* Overall Rating Summary */}
        <div className="grid gap-8 md:grid-cols-[300px_1fr] mb-8">
          {/* Left: Average Rating */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
            <div className="text-5xl font-bold text-[hsl(var(--foreground))]">
              {summary.averageRating.toFixed(1)}
            </div>
            <div className="mt-2 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-5 w-5',
                    i < Math.floor(summary.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
              Based on {summary.totalReviews} {summary.totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Right: Rating Breakdown */}
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = getRatingPercentage(rating);
              const count = summary.ratingBreakdown[rating as keyof typeof summary.ratingBreakdown];
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex w-20 items-center gap-1 text-sm">
                    <span>{rating}</span>
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                      <div
                        className="h-full bg-yellow-400 transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-12 text-right text-sm text-[hsl(var(--muted-foreground))]">
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="w-12 text-right text-sm text-[hsl(var(--muted-foreground))]">
                    ({count})
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Write Review Button */}
        {hasPurchased && (
          <div className="mb-6">
            <Button className="gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Write a Review
            </Button>
          </div>
        )}

        {/* Filter and Sort Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 w-full sm:w-auto"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {sortOptions.find(opt => opt.value === sort)?.label}
              <ChevronDown className="h-4 w-4" />
            </Button>
            
            {showFilters && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowFilters(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-lg">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        'w-full px-4 py-2 text-left text-sm hover:bg-[hsl(var(--muted))] transition-colors first:rounded-t-md last:rounded-b-md',
                        sort === option.value && 'bg-[hsl(var(--muted))] font-semibold'
                      )}
                      onClick={() => {
                        setSort(option.value);
                        setShowFilters(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Reviews'
              )}
            </Button>
          </div>
        )}

        {/* No Reviews Message */}
        {reviews.length === 0 && !isLoading && (
          <div className="py-12 text-center">
            <p className="text-[hsl(var(--muted-foreground))]">
              No reviews match your current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
