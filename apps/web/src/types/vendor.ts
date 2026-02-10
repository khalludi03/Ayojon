// Vendor Types - Based on PRD Section 7.4

export type VendorLocation = 'Dhaka' | 'Chittagong' | 'Sylhet' | 'Rajshahi' | 'Khulna';

export type BusinessType = 'individual' | 'company' | 'enterprise';

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
  score: number;
  productCount: number;
  location: VendorLocation;
  joinedAt: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  responseTime?: string;
  phone?: string;
}

export interface VendorApplication {
  id: string;
  userId: string; // Link to authenticated user
  // Step 1 - Account
  email: string;
  password?: string; // Not stored after submission

  // Step 2 - Business Info
  businessName: string;
  businessType: BusinessType;
  taxId: string;
  businessPhone: string;
  businessAddress: {
    street: string;
    city: string;
    division: string;
    postalCode: string;
  };
  yearsInBusiness: number;

  // Step 3 - Store Details
  storeName: string;
  storeDescription: string;
  productCategories: string[];
  storeLogo?: File | string; // File for upload or URL after upload
  storeBanner?: File | string; // File for upload or URL after upload

  // Step 4 - Verification Documents
  documents: {
    tradeLicense?: File | string;
    identification?: File | string; // NID/Passport
    bankDetails?: File | string;
  };

  // Status
  status: VendorStatus;
  submittedAt: string;
  reviewedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface VendorFormData {
  // Step 1 - Account
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2 - Business Info
  businessName: string;
  businessType: BusinessType | '';
  taxId: string;
  businessPhone: string;
  businessStreet: string;
  businessCity: string;
  businessDivision: string;
  businessPostalCode: string;
  yearsInBusiness: string;

  // Step 3 - Store Details
  storeName: string;
  storeDescription: string;
  productCategories: string[];
  storeLogo?: File;
  storeBanner?: File;

  // Step 4 - Verification Documents
  tradeLicense?: File;
  identification?: File;
  bankDetails?: File;
}
