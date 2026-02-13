import type { DealProduct, Product, ProductBadge, ProductImage } from '@/types'

/**
 * Maps a database product object to the frontend Product interface
 */
export function mapDbProductToFrontend(dbProduct: any): Product {
  const pricing = {
    currentPrice: parseFloat(dbProduct.salePrice || dbProduct.price),
    originalPrice: parseFloat(dbProduct.price),
    currency: dbProduct.currency || 'BDT',
    currencySymbol: '৳',
    discountPercentage: dbProduct.discountPercentage || 0,
  }

  const images: Array<ProductImage> = (dbProduct.images || []).map(
    (img: any) => ({
      url: img.url,
      alt: img.alt || dbProduct.title,
      isPrimary: img.isPrimary,
    }),
  )

  // Ensure there's at least one image if none provided
  if (images.length === 0) {
    images.push({
      url: '/placeholder-product.png',
      alt: dbProduct.title,
      isPrimary: true,
    })
  }

  const rating = {
    average: dbProduct.ratingAverage || 0,
    count: dbProduct.ratingCount || 0,
  }

  const shipping = {
    freeShipping: dbProduct.freeShipping || false,
    estimatedDays: dbProduct.shippingEstimatedDays || 3,
    cost: parseFloat(dbProduct.shippingCost || '0'),
  }

  const content = dbProduct.content || {}

  return {
    id: dbProduct.id,
    title: dbProduct.title,
    brand: dbProduct.brand,
    slug: dbProduct.slug,
    description: dbProduct.description,
    descriptionShort: dbProduct.descriptionShort || '',
    images,
    vendor: {
      id: dbProduct.vendor?.id || dbProduct.vendorId,
      name: dbProduct.vendor?.name || 'Unknown Vendor',
      isVerified: dbProduct.vendor?.isVerified || false,
    },
    pricing,
    rating,
    shipping,
    shippingOptions: [], // TODO: Map if available
    stockStatus: dbProduct.stockStatus || 'in_stock',
    stock: dbProduct.stock || 0,
    badges: content.badges as Array<ProductBadge>,
    categoryId: dbProduct.categoryId,
    subcategoryId: dbProduct.subcategoryId,
    keyFeatures: content.keyFeatures || [],
    whatsIncluded: content.whatsIncluded || [],
    setupInstructions: content.setupInstructions,
    variants: [], // TODO: Map if available
    returnPolicy: content.returnPolicy || '7 days return policy',
    warranty: content.warranty || 'No warranty',
    createdAt: dbProduct.createdAt?.toString() || new Date().toISOString(),
  }
}

/**
 * Maps a database product object to the frontend DealProduct interface
 */
export function mapDbProductToDealFrontend(dbProduct: any): DealProduct {
  const product = mapDbProductToFrontend(dbProduct)

  return {
    ...product,
    dealType: dbProduct.dealType || 'daily',
    dealEndsAt:
      dbProduct.dealEndsAt?.toString() ||
      new Date(Date.now() + 86400000).toISOString(),
    dealStartedAt:
      dbProduct.dealStartsAt?.toString() ||
      dbProduct.createdAt?.toString() ||
      new Date().toISOString(),
  }
}
