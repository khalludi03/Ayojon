// Product Types - Based on PRD Section 4.5.3 & 4.6.3

export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Pricing {
  currentPrice: number;
  originalPrice: number;
  currency: CurrencyCode;
  currencySymbol: string;
  discountPercentage: number;
}

export interface Rating {
  average: number;
  count: number;
}

export interface Shipping {
  freeShipping: boolean;
  estimatedDays: number;
  cost: number;
}

export interface ShippingOption {
  method: string;
  cost: number;
  estimatedDays: number;
}

export type VariantType = 'color' | 'size' | 'material';

export interface ProductVariant {
  id: string;
  type: VariantType;
  value: string;
  priceModifier: number;
  stock: number;
  imageUrl?: string;
}

export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export type ProductBadge = 'choice' | 'top_seller' | 'new' | 'verified';

export type CurrencyCode = 'BDT' | 'INR' | 'PKR' | 'USD';

export interface Product {
  id: string;
  title: string;
  brand?: string;
  slug: string;
  description: string;
  descriptionShort: string;
  images: Array<ProductImage>;
  vendor: {
    id: string;
    name: string;
    isVerified: boolean;
  };
  pricing: Pricing;
  rating: Rating;
  shipping: Shipping;
  shippingOptions: Array<ShippingOption>;
  stockStatus: StockStatus;
  stock: number;
  badges: Array<ProductBadge>;
  categoryId: string;
  subcategoryId?: string;
  keyFeatures: Array<string>;
  variants: Array<ProductVariant>;
  returnPolicy: string;
  warranty: string;
  createdAt: string;
}

// Deal-specific product extension
export type DealType = 'flash' | 'daily' | 'clearance' | 'bundle';

export interface DealProduct extends Product {
  dealType: DealType;
  dealEndsAt: string;
  dealStartedAt: string;
}
