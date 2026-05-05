import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import type { EventType } from '@/types'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: EventType
  className?: string
}

export function EventCard({ event, className }: EventCardProps) {
  const Icon = event.icon

  return (
    <Link
      to="/products"
      search={{ eventType: event.slug }}
      className={cn(
        'group relative flex flex-col items-center gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 transition-all duration-300 hover:shadow-lg hover:border-[hsl(var(--primary))] hover:-translate-y-1 sm:gap-4 sm:p-6',
        className,
      )}
    >
      {/* Icon Container */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[hsl(var(--primary))]/10 transition-all duration-300 group-hover:bg-[hsl(var(--primary))]/20 group-hover:scale-110 sm:h-20 sm:w-20">
        <Icon className="h-8 w-8 text-[hsl(var(--primary))] sm:h-10 sm:w-10" />
      </div>

      {/* Event Name */}
      <h3 className="text-center text-sm font-semibold text-[hsl(var(--foreground))] sm:text-base lg:text-lg">
        {event.name}
      </h3>

      {/* Shop Now Link */}
      <div className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--primary))] transition-all duration-300 group-hover:gap-3 sm:gap-2 sm:text-sm">
        <span>Shop Now</span>
        <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1 sm:h-4 sm:w-4" />
      </div>
    </Link>
  )
}
