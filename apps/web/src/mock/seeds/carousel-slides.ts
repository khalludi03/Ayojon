// Carousel Slide Seed Data - Based on PRD Section 4.2

import type { CarouselSlide } from '@/types';

export const CAROUSEL_SLIDES: Array<CarouselSlide> = [
  {
    slideId: 'slide-1',
    title: 'New Year Sale',
    subtitle: 'Up to 70% Off on Electronics & Fashion',
    imageUrl: 'https://picsum.photos/seed/zynex-banner1/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-banner1-m/800/400',
    ctaText: 'Shop Now',
    ctaLink: '/deals/new-year',
    backgroundColor: '#1B5E20',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-01-31T23:59:59Z',
    priority: 1,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'slide-2',
    title: 'Electronics Week',
    subtitle: 'Latest Smartphones, Laptops & Accessories',
    imageUrl: 'https://picsum.photos/seed/zynex-banner2/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-banner2-m/800/400',
    ctaText: 'Explore',
    ctaLink: '/category/electronics',
    backgroundColor: '#0D47A1',
    startDate: '2026-01-10T00:00:00Z',
    endDate: '2026-01-20T23:59:59Z',
    priority: 2,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'slide-3',
    title: 'Flash Deal',
    subtitle: '24-Hour Deal - Items Starting at 99',
    imageUrl: 'https://picsum.photos/seed/zynex-banner3/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-banner3-m/800/400',
    ctaText: 'Grab Now',
    ctaLink: '/deals/flash',
    backgroundColor: '#FF5722',
    startDate: '2026-01-12T00:00:00Z',
    endDate: '2026-01-13T00:00:00Z',
    priority: 3,
    targetAudience: ['BD'],
  },
  {
    slideId: 'slide-4',
    title: 'Fashion Fiesta',
    subtitle: 'Traditional & Western Wear Collection',
    imageUrl: 'https://picsum.photos/seed/zynex-banner4/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-banner4-m/800/400',
    ctaText: 'Shop Fashion',
    ctaLink: '/category/fashion',
    backgroundColor: '#7B1FA2',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-02-28T23:59:59Z',
    priority: 4,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'slide-5',
    title: 'Top Vendors',
    subtitle: 'Featured: Tech Galaxy Electronics',
    imageUrl: 'https://picsum.photos/seed/zynex-banner5/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-banner5-m/800/400',
    ctaText: 'Visit Store',
    ctaLink: '/vendor/tech-galaxy',
    backgroundColor: '#00695C',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 5,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'slide-6',
    title: 'Free Shipping',
    subtitle: 'On Orders Above 1000 - Limited Time',
    imageUrl: 'https://picsum.photos/seed/zynex-banner6/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-banner6-m/800/400',
    ctaText: 'Learn More',
    ctaLink: '/shipping',
    backgroundColor: '#FFC107',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-01-31T23:59:59Z',
    priority: 6,
    targetAudience: ['BD'],
  },
];

// Side banners for the hero section (4 banners in 2x2 grid)
export const SIDE_BANNERS: Array<CarouselSlide> = [
  {
    slideId: 'side-1',
    title: 'Smart Watch',
    subtitle: '50% OFF SALE',
    imageUrl: 'https://picsum.photos/seed/zynex-watch/300/180',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-watch/300/180',
    ctaText: 'Shop Now',
    ctaLink: '/category/electronics?subcategory=smartwatches',
    backgroundColor: '#FFF8E1',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 1,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'side-2',
    title: 'Headphones',
    subtitle: '30% OFF SALE',
    imageUrl: 'https://picsum.photos/seed/zynex-headphones/300/180',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-headphones/300/180',
    ctaText: 'Explore',
    ctaLink: '/category/electronics?subcategory=headphones',
    backgroundColor: '#FFF3E0',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 2,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'side-3',
    title: 'Camera',
    subtitle: '15% OFF SALE',
    imageUrl: 'https://picsum.photos/seed/zynex-camera/300/180',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-camera/300/180',
    ctaText: 'Shop Now',
    ctaLink: '/category/electronics?subcategory=cameras',
    backgroundColor: '#E8F5E9',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 3,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'side-4',
    title: 'Skincare',
    subtitle: '25% OFF SALE',
    imageUrl: 'https://picsum.photos/seed/zynex-skincare/300/180',
    mobileImageUrl: 'https://picsum.photos/seed/zynex-skincare/300/180',
    ctaText: 'Explore',
    ctaLink: '/category/beauty?subcategory=skincare',
    backgroundColor: '#FCE4EC',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 4,
    targetAudience: ['BD', 'IN', 'PK'],
  },
];

export function getActiveSlides(): Array<CarouselSlide> {
  const now = new Date();
  return CAROUSEL_SLIDES.filter((slide) => {
    const start = new Date(slide.startDate);
    const end = new Date(slide.endDate);
    return now >= start && now <= end;
  }).sort((a, b) => a.priority - b.priority);
}

export function getSideBanners(): Array<CarouselSlide> {
  const now = new Date();
  return SIDE_BANNERS.filter((slide) => {
    const start = new Date(slide.startDate);
    const end = new Date(slide.endDate);
    return now >= start && now <= end;
  }).sort((a, b) => a.priority - b.priority);
}
