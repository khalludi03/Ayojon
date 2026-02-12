export type ProductType = 'purchase' | 'rental' | 'both';
export type ProductStatus = 'draft' | 'active' | 'out_of_stock' | 'archived';

export interface ProductSpecification {
  key: string;
  value: string;
}

export interface ProductImage {
  id: string;
  url: string;
  file?: File;
  isPrimary: boolean;
  order: number;
}

export interface PurchaseDetails {
  regularPrice: number;
  salePrice?: number;
  quantity: number;
}

export interface RentalDetails {
  dailyRate: number;
  weeklyRate?: number;
  monthlyRate?: number;
  securityDeposit: number;
  minimumRentalDuration: number;
  quantityAvailable: number;
}

export interface ShippingDetails {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  isFragile: boolean;
  requiresSetup: boolean;
}

export interface VendorProduct {
  id: string;
  vendorId: string;

  // Basic Info
  name: string;
  brand: string;
  sku: string;

  // Description
  description: string;
  shortDescription: string;

  // Category
  category: string;
  subcategory: string;
  eventTypes: string[];

  // Pricing
  productType: ProductType;
  purchaseDetails?: PurchaseDetails;
  rentalDetails?: RentalDetails;

  // Images
  images: ProductImage[];

  // Specifications
  specifications: ProductSpecification[];

  // Shipping
  shipping?: ShippingDetails;

  // Metadata
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProductFormData {
  // Basic Info
  name: string;
  brand: string;
  sku: string;
  skuMode: 'auto' | 'custom';

  // Description
  description: string;
  shortDescription: string;

  // Category
  category: string;
  subcategory: string;
  eventTypes: string[];

  // Pricing
  productType: ProductType;

  // Purchase Details
  regularPrice: string;
  salePrice: string;
  quantity: string;

  // Rental Details
  dailyRate: string;
  weeklyRate: string;
  monthlyRate: string;
  securityDeposit: string;
  minimumRentalDuration: string;
  quantityAvailable: string;

  // Images
  images: ProductImage[];

  // Specifications
  specifications: ProductSpecification[];

  // Key Features (Highlights)
  keyFeatures: string[];
}
