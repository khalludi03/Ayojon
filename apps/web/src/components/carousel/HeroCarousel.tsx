import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveSlides, getSideBanners } from '@/mock/seeds/carousel-slides';
import { cn } from '@/lib/utils';
import { CarouselSkeleton } from '@/components/ui/skeleton';

export function HeroCarousel() {
  const [slides] = useState(() => getActiveSlides());
  const [sideBanners] = useState(() => getSideBanners());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
    if (!isAutoPlaying) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, goToNext]);

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  if (slides.length === 0) {
    return <CarouselSkeleton />;
  }

  return (
    <section className="bg-[hsl(var(--background))]">
      <div className="mx-auto max-w-[1920px] px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 xl:px-6">
        {/*
          CSS Grid Layout:
          - Mobile (< 640px): Single column, all stacked
          - Small tablet (640px - 767px): 2 columns below main banner
          - Tablet+ (768px+): Main banner + 2x2 side banner grid
          - Desktop (1280px+): Optimized spacing
        */}
        <div className="grid gap-2 sm:gap-3 md:gap-4
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-[1fr_280px]
          lg:grid-cols-[1fr_320px]
          xl:grid-cols-[1fr_340px]
          2xl:grid-cols-[1fr_400px]
        ">
          {/* Main Banner Carousel */}
          <div
            className="group/carousel relative overflow-hidden rounded-lg
              col-span-1
              sm:col-span-2
              md:col-span-1
              md:row-span-2
              min-h-[180px]
              sm:min-h-[240px]
              md:min-h-[320px]
              lg:min-h-[360px]
              xl:min-h-[400px]
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
                  key={slide.slideId}
                  className="relative h-full w-full shrink-0"
                  style={{ backgroundColor: slide.backgroundColor }}
                >
                  {/* Background Image */}
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />

                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/70 via-black/40 to-transparent">
                    <div className="px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
                      <div className="max-w-[280px] sm:max-w-xs md:max-w-sm lg:max-w-md">
                        {/* Category Badge */}
                        <span className="inline-block rounded bg-[hsl(var(--muted))]/80 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-[hsl(var(--foreground))] sm:px-2 sm:py-1 sm:text-[10px] md:text-xs">
                          {slide.subtitle.split(' ').slice(0, 2).join(' ')}
                        </span>
                        <h2 className="mt-1.5 text-base font-bold text-white sm:mt-2 sm:text-xl md:mt-3 md:text-2xl lg:text-3xl xl:text-4xl">
                          {slide.title}
                        </h2>
                        <p className="mt-1 text-xs text-white/90 sm:mt-1.5 sm:text-sm md:mt-2 md:text-base lg:text-lg">
                          {slide.subtitle}
                        </p>
                        <a
                          href={slide.ctaLink}
                          className="mt-2 inline-block rounded-lg bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:scale-105 sm:mt-3 sm:px-4 sm:py-2 sm:text-xs md:mt-4 md:px-6 md:py-2.5 md:text-sm shadow-[var(--shadow-festive)]"
                          style={{ boxShadow: 'var(--shadow-festive)' }}
                        >
                          {slide.ctaText}
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
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition-all duration-300 ease-out hover:bg-white hover:scale-110 sm:left-4 sm:p-2.5 opacity-0 group-hover/carousel:opacity-100 -translate-x-4 group-hover/carousel:translate-x-0 pointer-events-none group-hover/carousel:pointer-events-auto"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-lg transition-all duration-300 ease-out hover:bg-white hover:scale-110 sm:right-4 sm:p-2.5 opacity-0 group-hover/carousel:opacity-100 translate-x-4 group-hover/carousel:translate-x-0 pointer-events-none group-hover/carousel:pointer-events-auto"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-gray-800" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'h-1.5 rounded-full transition-all sm:h-2',
                    index === currentIndex
                      ? 'w-5 bg-white sm:w-6'
                      : 'w-1.5 bg-white/50 hover:bg-white/75 sm:w-2'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : undefined}
                />
              ))}
            </div>
          </div>

          {/* Side Banners - 2x2 Grid */}
          {/* On mobile: Full width, stacked */}
          {/* On small tablet (sm): 2-column grid below main banner */}
          {/* On tablet+ (md): 2x2 grid on the right side */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:row-span-2 md:gap-3 lg:gap-4">
            {sideBanners.slice(0, 4).map((banner, index) => (
              <a
                key={banner.slideId}
                href={banner.ctaLink}
                className={cn(
                  'group relative overflow-hidden rounded-lg transition-all hover:shadow-lg',
                  'min-h-[100px] sm:min-h-[115px] md:min-h-[155px] lg:min-h-[175px] xl:min-h-[195px]'
                )}
                style={{ backgroundColor: banner.backgroundColor }}
              >
                {/* Background Image */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Discount Badge */}
                <div className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 md:left-3 md:top-3">
                  <div className="rounded bg-[hsl(var(--accent))] px-1 py-0.5 text-[9px] font-bold text-white sm:px-1.5 sm:text-[10px] md:px-2 md:py-1 md:text-xs">
                    {banner.subtitle}
                  </div>
                </div>

                {/* Title at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 sm:p-2 md:p-3">
                  <h3 className="text-[10px] font-semibold text-white sm:text-xs md:text-sm lg:text-base">
                    {banner.title}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
