import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Gift,
  Sparkles,
  Ticket,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeroBannerProps {
  className?: string
}

// Multiple banner slides for variety
const bannerSlides = [
  {
    id: 2,
    badge: 'Flash Sale',
    badgeIcon: Zap,
    title: 'Mega Flash Sale',
    subtitle:
      "Limited time offers on top brands. Hurry up! These deals won't last long.",
    ctaText: 'View Deals',
    ctaLink: '/flash-deals',
    gradient:
      'from-[hsl(var(--accent))] via-[hsl(14,100%,50%)] to-[hsl(var(--secondary))]',
    accentColor: 'bg-white text-[hsl(var(--accent))]',
  },
  {
    id: 3,
    badge: 'Trending',
    badgeIcon: TrendingUp,
    title: 'Trending This Week',
    subtitle: 'Shop the most popular products that everyone is talking about.',
    ctaText: 'Explore',
    ctaLink: '/trending',
    gradient: 'from-violet-600 via-purple-600 to-indigo-600',
    accentColor: 'bg-white text-violet-600',
  },
]

export function HeroBanner({ className }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slide = bannerSlides[currentSlide]
  const BadgeIcon = slide.badgeIcon

  return (
    <div className={cn('relative', className)}>
      {/* Main Banner */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl bg-gradient-to-br',
          slide.gradient,
        )}
      >
        {/* Background Image (if available) */}
        {slide.image && (
          <div className="absolute inset-0">
            <img
              src={slide.image}
              alt=""
              className="h-full w-full object-cover opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 h-60 w-60 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-1/4 top-1/2 h-40 w-40 rounded-full bg-white/5 blur-xl" />
          {/* Animated dots */}
          <div className="absolute right-10 top-10 h-2 w-2 animate-pulse rounded-full bg-white/40" />
          <div
            className="absolute right-20 top-20 h-3 w-3 animate-pulse rounded-full bg-white/30"
            style={{ animationDelay: '0.5s' }}
          />
          <div
            className="absolute right-32 top-8 h-2 w-2 animate-pulse rounded-full bg-white/20"
            style={{ animationDelay: '1s' }}
          />
        </div>

        {/* Content */}
        <div className="relative px-6 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <div className="max-w-lg">
            {/* Badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
              <BadgeIcon className="h-4 w-4" />
              {slide.badge}
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
              {slide.title}
            </h2>

            {/* Subtitle */}
            <p className="mt-4 text-base text-white/90 sm:text-lg max-w-md">
              {slide.subtitle}
            </p>

            {/* CTA Button */}
            <div className="mt-8">
              <Link
                to={slide.ctaLink}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold shadow-lg transition-all duration-300',
                  'hover:scale-105 hover:shadow-xl active:scale-100',
                  slide.accentColor,
                )}
              >
                {slide.ctaText}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                index === currentSlide
                  ? 'w-8 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70',
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HeroBanner
