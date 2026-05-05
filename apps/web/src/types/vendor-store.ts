export interface VendorStoreSettings {
  id: string
  vendorId: string

  // Basic Info
  storeName: string
  storeDescription: string

  // Branding
  logo?: string
  banner?: string

  // Policies
  returnPolicy: string
  shippingPolicy: string
  cancellationPolicy: string

  // Contact Info
  businessPhone: string
  businessEmail: string
  businessHours: string

  // Social Media
  facebookUrl?: string
  instagramUrl?: string
  websiteUrl?: string

  // Metadata
  createdAt: string
  updatedAt: string
}

export interface VendorStoreFormData {
  storeName: string
  storeDescription: string
  logo?: File | string
  banner?: File | string
  returnPolicy: string
  shippingPolicy: string
  cancellationPolicy: string
  businessPhone: string
  businessEmail: string
  businessHours: string
  facebookUrl: string
  instagramUrl: string
  websiteUrl: string
}
