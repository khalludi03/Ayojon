import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, BadgeCheck, Check, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Review } from '@/types/product';
import { cn } from '@/lib/utils';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [helpfulVoted, setHelpfulVoted] = useState<'yes' | 'no' | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleHelpfulVote = (vote: 'yes' | 'no') => {
    if (helpfulVoted === vote) {
      setHelpfulVoted(null);
    } else {
      setHelpfulVoted(vote);
    }
  };

  const displayImages = showAllImages ? review.images : review.images.slice(0, 3);

  return (
    <div className="border-b border-[hsl(var(--border))] pb-6 last:border-b-0">
      {/* User Info */}
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          {(review.user as any).avatar || (review.user as any).image ? (
            <img
              src={(review.user as any).avatar || (review.user as any).image}
              alt={review.user.name}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-sm font-semibold text-[hsl(var(--muted-foreground))]">
              {review.user.isAnonymous ? 'A' : review.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* User Name & Verified Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[hsl(var(--foreground))]">
              {review.user.name}
            </span>
            {review.isVerifiedPurchase && (
              <Badge variant="verified" className="gap-1 bg-blue-50 text-blue-700 border-blue-200">
                <BadgeCheck className="h-3 w-3" />
                Verified Purchase
              </Badge>
            )}
            {review.recommend !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border",
                review.recommend 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-red-50 text-red-700 border-red-200"
              )}>
                {review.recommend ? <Check className="h-2.5 w-2.5" /> : <XIcon className="h-2.5 w-2.5" />}
                {review.recommend ? "Recommended" : "Not Recommended"}
              </div>
            )}
          </div>

          {/* Rating & Date */}
          <div className="mt-1 flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                    i < review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-gray-200 text-gray-200'
                  )}
                />
              ))}
            </div>
            <span>·</span>
            <span>{formatDate(review.createdAt)}</span>
          </div>

          {/* Review Title */}
          {review.title && (
            <h4 className="mt-3 font-semibold text-[hsl(var(--foreground))]">
              {review.title}
            </h4>
          )}

          {/* Review Comment */}
          <p className="mt-2 text-sm leading-relaxed text-[hsl(var(--foreground))]">
            {review.comment}
          </p>

          {/* Review Images */}
          {review.images.length > 0 && (
            <div className="mt-4">
              <div className="flex flex-wrap gap-2">
                {displayImages.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.alt}
                    className="h-20 w-20 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                ))}
              </div>
              {review.images.length > 3 && !showAllImages && (
                <button
                  onClick={() => setShowAllImages(true)}
                  className="mt-2 text-sm font-medium text-[hsl(var(--primary))] hover:underline"
                >
                  + {review.images.length - 3} more {review.images.length - 3 === 1 ? 'photo' : 'photos'}
                </button>
              )}
            </div>
          )}

          {/* Helpful Votes */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-[hsl(var(--muted-foreground))]">
              Was this helpful?
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant={helpfulVoted === 'yes' ? 'primary' : 'outline'}
                size="sm"
                className="gap-1.5 h-8"
                onClick={() => handleHelpfulVote('yes')}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Yes</span>
                <span className="ml-0.5">
                  ({review.helpfulVotes + (helpfulVoted === 'yes' ? 1 : 0)})
                </span>
              </Button>
              <Button
                variant={helpfulVoted === 'no' ? 'primary' : 'outline'}
                size="sm"
                className="gap-1.5 h-8"
                onClick={() => handleHelpfulVote('no')}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span>No</span>
                <span className="ml-0.5">
                  ({review.notHelpfulVotes + (helpfulVoted === 'no' ? 1 : 0)})
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
