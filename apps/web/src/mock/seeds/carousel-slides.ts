// Carousel Slide Seed Data - Based on PRD Section 4.2

import type { CarouselSlide } from '@/types'

export const CAROUSEL_SLIDES: Array<CarouselSlide> = [
  {
    slideId: 'slide-1',
    title: 'Wedding Season Essentials',
    subtitle: 'Up to 50% Off on Decorations, Furniture & More',
    imageUrl: 'https://picsum.photos/seed/ayojon-wedding/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-wedding-m/800/400',
    ctaText: 'Shop Now',
    ctaLink: '/category/decorations-balloons',
    backgroundColor: '#F04E37',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-01-31T23:59:59Z',
    priority: 1,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'slide-2',
    title: 'Birthday Party Specials',
    subtitle: 'Balloons, Cakes Stands & Entertainment Equipment',
    imageUrl: 'https://picsum.photos/seed/ayojon-birthday/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-birthday-m/800/400',
    ctaText: 'Explore',
    ctaLink: '/category/party-supplies',
    backgroundColor: '#FBAB1B',
    startDate: '2026-01-10T00:00:00Z',
    endDate: '2026-01-20T23:59:59Z',
    priority: 2,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'slide-3',
    title: 'Flash Deal: DJ Equipment',
    subtitle: '40% Off - Professional Sound Systems',
    imageUrl: 'https://picsum.photos/seed/ayojon-dj/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-dj-m/800/400',
    ctaText: 'Grab Now',
    ctaLink: '/category/sound-lighting',
    backgroundColor: '#33A399',
    startDate: '2026-01-12T00:00:00Z',
    endDate: '2026-01-13T00:00:00Z',
    priority: 3,
    targetAudience: ['BD'],
  },
  {
    slideId: 'slide-4',
    title: 'Corporate Events Made Easy',
    subtitle: 'Stages, Projectors & Professional AV Equipment',
    imageUrl: 'https://picsum.photos/seed/ayojon-corporate/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-corporate-m/800/400',
    ctaText: 'Shop Corporate',
    ctaLink: '/category/stage-backdrops',
    backgroundColor: '#1E2532',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-02-28T23:59:59Z',
    priority: 4,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'slide-5',
    title: 'Featured Vendor: Elite Events BD',
    subtitle: 'Premium Event Supplies - 5★ Rated',
    imageUrl: 'https://picsum.photos/seed/ayojon-vendor/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-vendor-m/800/400',
    ctaText: 'Visit Store',
    ctaLink: '/vendor/elite-events-bd',
    backgroundColor: '#7B1FA2',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 5,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'slide-6',
    title: 'Free Setup Assistance',
    subtitle: 'On Rentals Above ৳5000 - Limited Time Offer',
    imageUrl: 'https://picsum.photos/seed/ayojon-setup/1400/400',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-setup-m/800/400',
    ctaText: 'Learn More',
    ctaLink: '/shipping',
    backgroundColor: '#2E7D32',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-01-31T23:59:59Z',
    priority: 6,
    targetAudience: ['BD'],
  },
]

// Side banners for the hero section (4 banners in 2x2 grid)
export const SIDE_BANNERS: Array<CarouselSlide> = [
  {
    slideId: 'side-1',
    title: 'Photo Booth',
    subtitle: '50% OFF RENTAL',
    imageUrl: 'https://picsum.photos/seed/ayojon-photobooth/300/180',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-photobooth/300/180',
    ctaText: 'Shop Now',
    ctaLink: '/category/photography-video?subcategory=photo-booths',
    backgroundColor: '#FFF8E1',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 1,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'side-2',
    title: 'LED Lights',
    subtitle: '30% OFF SALE',
    imageUrl: 'https://picsum.photos/seed/ayojon-lights/300/180',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-lights/300/180',
    ctaText: 'Explore',
    ctaLink: '/category/decorations-balloons?subcategory=led-decor',
    backgroundColor: '#FFF3E0',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 2,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'side-3',
    title: 'Event Tents',
    subtitle: '15% OFF RENTAL',
    imageUrl: 'https://picsum.photos/seed/ayojon-tents/300/180',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-tents/300/180',
    ctaText: 'Shop Now',
    ctaLink: '/category/furniture-tents?subcategory=tents-canopies',
    backgroundColor: '#E8F5E9',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 3,
    targetAudience: ['BD', 'IN', 'PK'],
  },
  {
    slideId: 'side-4',
    title: 'Catering Sets',
    subtitle: '25% OFF SALE',
    imageUrl: 'https://picsum.photos/seed/ayojon-catering/300/180',
    mobileImageUrl: 'https://picsum.photos/seed/ayojon-catering/300/180',
    ctaText: 'Explore',
    ctaLink: '/category/catering-equipment?subcategory=chafing-dishes',
    backgroundColor: '#FCE4EC',
    startDate: '2026-01-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    priority: 4,
    targetAudience: ['BD', 'IN', 'PK'],
  },
]

export function getActiveSlides(): Array<CarouselSlide> {
  const now = new Date()
  return CAROUSEL_SLIDES.filter((slide) => {
    const start = new Date(slide.startDate)
    const end = new Date(slide.endDate)
    return now >= start && now <= end
  }).sort((a, b) => a.priority - b.priority)
}

export function getSideBanners(): Array<CarouselSlide> {
  const now = new Date()
  return SIDE_BANNERS.filter((slide) => {
    const start = new Date(slide.startDate)
    const end = new Date(slide.endDate)
    return now >= start && now <= end
  }).sort((a, b) => a.priority - b.priority)
}
