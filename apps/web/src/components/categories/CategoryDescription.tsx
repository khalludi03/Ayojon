import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CategoryDescriptionProps {
  description: string
  maxLength?: number
  className?: string
}

export function CategoryDescription({
  description,
  maxLength = 200,
  className,
}: CategoryDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!description) return null

  const shouldTruncate = description.length > maxLength
  const displayText =
    shouldTruncate && !isExpanded
      ? `${description.slice(0, maxLength)}...`
      : description

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
        {displayText}
      </p>

      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          type="button"
        >
          {isExpanded ? (
            <>
              Show less
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Read more
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  )
}
