import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Gift, Sparkles, Ticket, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroBannerProps {
  className?: string;
}

// Multiple banner slides for variety
const bannerSlides = [
  {
    id: 1,
    badge: 'New Arrivals',
    badgeIcon: Sparkles,
    title: 'New Product Collection',
    subtitle: 'Discover the latest trends and exclusive deals on our newest arrivals. Shop now and save up to 50% off!',
    ctaText: 'Shop Now',
    ctaLink: '/new-arrivals',
    gradient: 'from-[hsl(var(--primary))] via-[hsl(123,38%,28%)] to-[hsl(var(--primary))]',
    accentColor: 'bg-white text-[hsl(var(--primary))]',
    image: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=600&q=80',
  },
  {
    id: 2,
    badge: 'Flash Sale',
    badgeIcon: Zap,
    title: 'Mega Flash Sale',
    subtitle: 'Limited time offers on top brands. Hurry up! These deals won\'t last long.',
    ctaText: 'View Deals',
    ctaLink: '/deals/flash',
    gradient: 'from-[hsl(var(--accent))] via-[hsl(14,100%,50%)] to-[hsl(var(--secondary))]',
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
];

export function HeroBanner({ className }: HeroBannerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = bannerSlides[currentSlide];
  const BadgeIcon = slide.badgeIcon;

  return (
    <div className={cn('relative', className)}>
      {/* Main Banner */}
      <div
        className={cn(
          'relative overflow-hidden rounded-xl bg-gradient-to-br',
          slide.gradient
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
          <div className="absolute right-20 top-20 h-3 w-3 animate-pulse rounded-full bg-white/30" style={{ animationDelay: '0.5s' }} />
          <div className="absolute right-32 top-8 h-2 w-2 animate-pulse rounded-full bg-white/20" style={{ animationDelay: '1s' }} />
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
                  slide.accentColor
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
                index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Mini Promo Cards */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <a 
          href="/offers/free-gift"
          className="group relative flex items-center gap-3 rounded-lg bg-gradient-to-r from-[hsl(var(--secondary))] to-[hsl(var(--secondary))]/80 p-4 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          {/* Decorative dashed border effect */}
          <div className="absolute inset-y-0 left-0 w-1 border-l-2 border-dashed border-white/40" />
          <div className="absolute inset-y-0 right-0 w-1 border-r-2 border-dashed border-white/40" />
          
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 text-[hsl(var(--secondary-foreground))] group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            <Gift className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-[hsl(var(--secondary-foreground))]/90 uppercase tracking-wide">Free Gift</p>
            <p className="text-sm font-bold text-[hsl(var(--secondary-foreground))]">On orders over ৳5000</p>
          </div>
          <div className="flex items-center justify-center h-8 px-3 rounded-full bg-white text-[hsl(var(--secondary))] text-xs font-bold group-hover:scale-105 transition-transform">
            Get
          </div>
        </a>
        <a 
          href="/vouchers"
          className="group relative flex items-center gap-3 rounded-lg bg-gradient-to-r from-[hsl(var(--accent))] to-[hsl(var(--accent))]/80 p-4 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
        >
          {/* Decorative dashed border effect */}
          <div className="absolute inset-y-0 left-0 w-1 border-l-2 border-dashed border-white/40" />
          <div className="absolute inset-y-0 right-0 w-1 border-r-2 border-dashed border-white/40" />
          
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/20 text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
            <Ticket className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-white/90 uppercase tracking-wide">Collect Voucher</p>
            <p className="text-sm font-bold text-white">Save up to ৳500</p>
          </div>
          <div className="flex items-center justify-center h-8 px-3 rounded-full bg-white text-[hsl(var(--accent))] text-xs font-bold group-hover:scale-105 transition-transform">
            Claim
          </div>
        </a>
      </div>
    </div>
  );
}

export default HeroBanner;
