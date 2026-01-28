// Vendor Types - Based on PRD Section 7.4

export type VendorLocation = 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna';

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
  rating: number;
  productCount: number;
  location: VendorLocation;
  joinedAt: string;
  description?: string;
  logoUrl?: string;
}
