import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { orpc } from '@/utils/orpc';
import { cn } from '@/lib/utils';
import { CarouselSkeleton } from '@/components/ui/skeleton';
import { useSession } from '@/lib/session-context';

interface Banner {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  sortOrder: number;
}

interface PromoCard {
  id: string;
  slotNumber: number;
  imageUrl: string;
  label: string;
  title: string;
  link: string;
}

export function HeroCarousel() {
  // Fetch banners and promo cards from API
  const { data: bannersData, isLoading: bannersLoading } = useQuery(
    orpc.homepage.listBanners.queryOptions()
  );
  const { data: promoCardsData, isLoading: promoCardsLoading } = useQuery(
    orpc.homepage.listPromoCards.queryOptions()
  );

  const slides = bannersData?.banners || [];
  const sideBanners = promoCardsData?.promoCards || [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const isLoading = bannersLoading || promoCardsLoading;
  const sessionContext = useSession();
  const session = sessionContext?.session;

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  // Auto-rotation
  useEffect(() => {
    if (!isAutoPlaying || !session) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext, session]);

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (isLoading) {
    return <CarouselSkeleton />;
  }

  if (slides.length === 0) {
    return null; // Don't show carousel if no active slides
  }

  return (
    <section className="bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-[1920px] px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 xl:px-6">
        {/*
          CSS Grid Layout:
          - Mobile (< 640px): Single column, all stacked
          - Small/Medium/Large (640px - 1279px): Main banner full width, 2x2 grid below (STACKED)
          - XL+ (1280px+): Main banner + 2x2 side banner grid (SIDE-BY-SIDE)
        */}
        <div className="grid gap-2 sm:gap-3 md:gap-4
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-[2fr_1fr]
        ">
          {/* Main Banner Carousel */}
          <div
            className="group/carousel relative overflow-hidden rounded-lg
              col-span-1
              sm:col-span-2
              xl:col-span-1
              xl:row-span-2
              aspect-[16/9]
              sm:aspect-[21/9]
              xl:aspect-[16/9]
            "
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            role="region"
            aria-label="Promotional carousel"
          >
            {/* Slides Container */}
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="relative h-full w-full shrink-0"
                >
                  {/* Background Image */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/75 via-black/50 to-transparent">
                    <div className="px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
                      <div className="max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg">
                        {/* Category Badge */}
                        <span className="inline-block rounded-md bg-white/20 backdrop-blur-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white border border-white/30 sm:px-2.5 sm:py-1 sm:text-xs">
                          {slide.subtitle.split(' ').slice(0, 2).join(' ')}
                        </span>
                        <h2 className="mt-2 text-lg font-black text-white drop-shadow-lg sm:mt-3 sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl leading-tight">
                          {slide.title}
                        </h2>
                        <p className="mt-1.5 text-xs text-white/95 drop-shadow-md sm:mt-2 sm:text-sm md:text-base lg:text-lg leading-relaxed">
                          {slide.subtitle}
                        </p>
                        <a
                          href={slide.buttonLink}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-4 py-2 text-xs font-bold text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-95 sm:mt-4 sm:px-5 sm:py-2.5 sm:text-sm md:mt-5 md:px-6 md:py-3 md:text-base shadow-xl"
                        >
                          {slide.buttonText}
                          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows - Hidden by default, visible on hover */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 shadow-2xl backdrop-blur-md ring-1 ring-white/30 transition-all duration-500 ease-out hover:scale-105 hover:bg-white/25 active:scale-95 sm:left-3 sm:p-3 md:left-4 z-10 opacity-0 group-hover/carousel:opacity-100 -translate-x-2 group-hover/carousel:translate-x-0"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 shadow-2xl backdrop-blur-md ring-1 ring-white/30 transition-all duration-500 ease-out hover:scale-105 hover:bg-white/25 active:scale-95 sm:right-3 sm:p-3 md:right-4 z-10 opacity-0 group-hover/carousel:opacity-100 translate-x-2 group-hover/carousel:translate-x-0"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-lg" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-4 sm:gap-2.5 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300 shadow-sm',
                    index === currentIndex
                      ? 'w-6 sm:w-8 bg-white'
                      : 'w-2 bg-white/60 hover:bg-white/90 hover:w-3'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>

          {/* Side Banners - 2x2 Grid */}
          {/* On mobile/tablet/desktop: 2-column grid BELOW main banner (STACKED) - spans full width */}
          {/* On XL+ (1280px+): 2x2 grid on the RIGHT SIDE of main banner (SIDE-BY-SIDE) */}
          {sideBanners.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:gap-3 md:gap-4 xl:col-span-1 xl:row-span-2 xl:grid-rows-2">
              {sideBanners.slice(0, 4).map((banner) => (
                <a
                  key={banner.id}
                  href={banner.link}
                  className={cn(
                    'group relative overflow-hidden rounded-lg transition-all hover:shadow-xl hover:scale-[1.02]',
                    'aspect-[4/3] xl:aspect-auto xl:h-full'
                  )}
                >
                  {/* Background Image */}
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />

                  {/* Discount Badge */}
                  <div className="absolute left-2 top-2 sm:left-2.5 sm:top-2.5 md:left-3 md:top-3 z-10">
                    <div className="rounded-md bg-[hsl(var(--accent))] px-1.5 py-0.5 text-[9px] font-bold text-white shadow-lg sm:px-2 sm:py-1 sm:text-[10px] md:px-2.5 md:text-xs backdrop-blur-sm">
                      {banner.label}
                    </div>
                  </div>

                  {/* Title at Bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2 sm:p-2.5 md:p-3">
                    <h3 className="text-[10px] font-bold text-white drop-shadow-md sm:text-xs md:text-sm lg:text-base leading-tight">
                      {banner.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
