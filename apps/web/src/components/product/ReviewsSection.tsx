import { useMemo, useState } from 'react'
import {
  ChevronDown,
  Filter,
  Loader2,
  MessageSquarePlus,
  Star,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ReviewCard } from './ReviewCard'
import { ReviewFormModal } from './ReviewFormModal'
import type {
  Review,
  ReviewFilter,
  ReviewSort,
  ReviewSummary,
} from '@/types/product'
import { Button } from '@/components/ui/button'
import { orpc } from '@/utils/orpc'
import { cn } from '@/lib/utils'

interface ReviewsSectionProps {
  productId: string
  productName?: string
  productImage?: string
}

export function ReviewsSection({
  productId,
  productName,
  productImage,
}: ReviewsSectionProps) {
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const [sort, setSort] = useState<ReviewSort>('most_recent')
  const [limit, setLimit] = useState(10)
  const [showFilters, setShowFilters] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { data: rawReviews, isLoading } = useQuery(
    orpc.review.getProductReviews.queryOptions({
      input: { productId, limit: 50 }, // Get more for filtering/sorting on client for now or handle on server
    }),
  )

  const { data: canReviewData } = useQuery(
    orpc.review.canReview.queryOptions({
      input: { productId },
    }),
  )

  const reviews = useMemo(() => {
    const raw = rawReviews as Array<any>

    let filtered = [...raw]

    if (filter === 'with_photos') {
      filtered = filtered.filter((r) => r.images && r.images.length > 0)
    } else if (filter === 'verified_purchase') {
      filtered = filtered.filter((r) => r.isVerifiedPurchase)
    }

    if (sort === 'most_recent') {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    } else if (sort === 'highest_rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sort === 'lowest_rating') {
      filtered.sort((a, b) => a.rating - b.rating)
    }
    // helpful_votes not yet fully implemented in DB as active field for sorting

    return filtered.map((r) => ({
      ...r,
      user: {
        id: r.user.id,
        name: r.user.name || 'Anonymous User',
        avatar: r.user.image || undefined,
      },
      images: (r.images || []).map((img: any) => ({
        url: img.url,
        alt: img.alt || '',
      })),
      helpfulVotes: r.helpfulVotes || 0,
      notHelpfulVotes: r.notHelpfulVotes || 0,
    })) as Array<Review>
  }, [rawReviews, filter, sort])

  const summary = useMemo<ReviewSummary | null>(() => {
    const raw = rawReviews as Array<any>
    if (raw.length === 0)
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      }

    const total = raw.length
    const sum = raw.reduce((acc, r) => acc + r.rating, 0)
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }

    raw.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[r.rating as keyof typeof breakdown]++
      }
    })

    return {
      averageRating: sum / total,
      totalReviews: total,
      ratingBreakdown: breakdown,
    }
  }, [rawReviews])

  const filterOptions: Array<{ value: ReviewFilter; label: string }> = [
    { value: 'all', label: 'All Reviews' },
    { value: 'with_photos', label: 'With Photos' },
    { value: 'verified_purchase', label: 'Verified Purchase' },
  ]

  const sortOptions: Array<{ value: ReviewSort; label: string }> = [
    { value: 'most_recent', label: 'Most Recent' },
    { value: 'highest_rating', label: 'Highest Rating' },
    { value: 'lowest_rating', label: 'Lowest Rating' },
  ]

  if (summary === null) {
    return null
  }

  const getRatingPercentage = (rating: number) => {
    if (summary.totalReviews === 0) return 0
    return (
      (summary.ratingBreakdown[rating as keyof typeof summary.ratingBreakdown] /
        summary.totalReviews) *
      100
    )
  }

  return (
    <div className="mt-16 border-t border-[hsl(var(--border))] pt-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">
            Customer Reviews
          </h2>
          {(canReviewData as any)?.canReview && (
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 font-bold"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Write a Review
            </Button>
          )}
        </div>

        {/* Overall Rating Summary */}
        <div className="grid gap-8 md:grid-cols-[300px_1fr] mb-12">
          {/* Left: Average Rating */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[hsl(var(--border))] bg-slate-50/50 dark:bg-slate-900/50 p-8">
            <div className="text-6xl font-black text-[hsl(var(--foreground))]">
              {summary.averageRating.toFixed(1)}
            </div>
            <div className="mt-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-6 w-6',
                    i < Math.floor(summary.averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-slate-200 text-slate-200 dark:fill-slate-800 dark:text-slate-800',
                  )}
                />
              ))}
            </div>
            <div className="mt-3 text-sm font-bold text-[hsl(var(--muted-foreground))]">
              Based on {summary.totalReviews}{' '}
              {summary.totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>

          {/* Right: Rating Breakdown */}
          <div className="flex flex-col justify-center space-y-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const percentage = getRatingPercentage(rating)
              const count =
                summary.ratingBreakdown[
                  rating as keyof typeof summary.ratingBreakdown
                ]

              return (
                <div key={rating} className="flex items-center gap-4">
                  <div className="flex w-24 items-center gap-2 text-sm font-bold">
                    <span>{rating} Star</span>
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full bg-amber-400 transition-all duration-1000"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-black text-slate-900 dark:text-white">
                    {percentage.toFixed(0)}%
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Filter and Sort Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={cn(
                  'rounded-full px-4 font-bold',
                  filter === option.value &&
                    'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100',
                )}
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
              className="gap-2 w-full sm:w-auto rounded-xl font-bold h-10 px-4"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              {sortOptions.find((opt) => opt.value === sort)?.label}
              <ChevronDown className="h-4 w-4" />
            </Button>

            {showFilters && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowFilters(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-2 w-48 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      className={cn(
                        'w-full px-4 py-3 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors font-medium',
                        sort === option.value &&
                          'bg-slate-50 dark:bg-slate-900 font-bold text-indigo-600',
                      )}
                      onClick={() => {
                        setSort(option.value)
                        setShowFilters(false)
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
        <div className="space-y-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* No Reviews Message */}
        {reviews.length === 0 && (
          <div className="py-20 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 font-bold">
              {filter === 'all'
                ? 'No reviews yet. Be the first to review this product!'
                : 'No reviews match your current filters.'}
            </p>
          </div>
        )}

        {/* Review Modal */}
        <ReviewFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          productId={productId}
          productName={productName || 'Product'}
          productImage={productImage}
        />
      </div>
    </div>
  )
}
