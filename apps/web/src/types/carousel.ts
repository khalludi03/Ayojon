// Carousel Types - Based on PRD Section 4.2.3

export type TargetRegion = 'BD' | 'IN' | 'PK';

export interface CarouselSlide {
  slideId: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  mobileImageUrl: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
  startDate: string;
  endDate: string;
  priority: number;
  targetAudience: Array<TargetRegion>;
}
