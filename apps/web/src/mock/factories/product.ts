// Product Factory - Based on PRD Section 7.3

import { faker } from '@faker-js/faker'
import { CATEGORIES } from '../seeds/categories'
import type {
  DealProduct,
  DealType,
  Pricing,
  Product,
  ProductBadge,
  ProductImage,
  ProductVariant,
  Rating,
  Shipping,
  ShippingOption,
  StockStatus,
  VariantType,
} from '@/types'
import { slugify } from '@/lib/utils'

// Set seed for reproducible data
faker.seed(12345)

// Event-specific product names by category
const EVENT_PRODUCTS: Record<string, Array<string>> = {
  decorations: [
    'Gold Balloon Arch Kit',
    'LED Neon Sign - Love',
    'Rose Gold Photo Backdrop',
    'Fairy String Lights',
    'Metallic Curtain Backdrop',
    'Giant Number Balloons',
  ],
  'sound-lighting': [
    'Professional PA Speaker System',
    'Wireless Microphone Set',
    'DJ Controller & Mixer',
    'Moving Head Stage Light',
    'RGB Uplighting Package',
    'HD Projector & Screen',
  ],
  'furniture-tents': [
    'White Chiavari Chairs',
    'Round Banquet Table (6ft)',
    'Wedding Tent (20x30)',
    'Velvet Lounge Sofa Set',
    'Wooden Stage Platform',
    'Satin Table Linens',
  ],
  'catering-equipment': [
    'Chafing Dish Set (4-pack)',
    'Crystal Champagne Flutes',
    'Silver Serving Platters',
    'Portable Bar Counter',
    'Beverage Dispenser Station',
    'Gold-Rimmed Dinnerware Set',
  ],
  'photography-video': [
    '360 Photo Booth',
    'Professional DSLR Camera',
    'Softbox Lighting Kit',
    '4K Video Camera',
    'Aerial Drone with Camera',
    'Photo Props Set (50 pieces)',
  ],
  'party-supplies': [
    'Disposable Gold Tableware',
    'Party Favor Boxes (100ct)',
    'Custom Birthday Banner',
    'Confetti Cannons (12-pack)',
    'Crystal Cake Stand',
    'Floral Centerpiece Kit',
  ],
  'event-clothing': [
    'Bridal Gown - Lace Detail',
    'Traditional Saree Collection',
    'Black Tuxedo Rental',
    'Superhero Costume Set',
    'Bridal Veil & Accessories',
    'Kids Formal Suit',
  ],
  'stage-backdrops': [
    'Adjustable Stage Platform',
    'Pipe & Drape Backdrop',
    'Sequin Fabric Backdrop',
    'Floral Wall Panel (8x8ft)',
    'Black Velvet Stage Curtain',
    'Backdrop Stand & Frame',
  ],
  'floral-arrangements': [
    'Wedding Bouquet - Roses',
    'Floral Table Centerpiece',
    'Eucalyptus Garland (10ft)',
    'Corsage & Boutonniere Set',
    'Glass Cylinder Vases',
    'Artificial Flower Arrangement',
  ],
  entertainment: [
    'Bounce House Castle',
    'Ring Toss Carnival Game',
    'Professional Karaoke System',
    'Arcade Basketball Game',
    'Giant Jenga Lawn Game',
    'Magic Props Kit',
  ],
}

function getEventProductName(categoryId: string): string {
  const products = EVENT_PRODUCTS[categoryId] as Array<string> | undefined
  if (products) {
    return faker.helpers.arrayElement(products)
  }
  return faker.commerce.productName()
}

const DISCOUNT_OPTIONS = [0, 10, 15, 20, 25, 30, 40, 50, 60, 70]
const BADGE_OPTIONS: Array<ProductBadge> = [
  'choice',
  'top_seller',
  'new',
  'verified',
]
const COLOR_OPTIONS = [
  'Red',
  'Blue',
  'Black',
  'White',
  'Green',
  'Yellow',
  'Pink',
  'Gray',
  'Navy',
  'Brown',
]
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export function createPricing(overrides: Partial<Pricing> = {}): Pricing {
  const originalPrice = faker.number.int({ min: 200, max: 50000 })
  const discountPercentage =
    overrides.discountPercentage ?? faker.helpers.arrayElement(DISCOUNT_OPTIONS)
  const currentPrice = Math.round(
    originalPrice * (1 - discountPercentage / 100),
  )

  return {
    originalPrice,
    currentPrice,
    currency: 'BDT',
    currencySymbol: '৳',
    discountPercentage,
    ...overrides,
  }
}

export function createRating(overrides: Partial<Rating> = {}): Rating {
  return {
    average: faker.number.float({ min: 2.5, max: 5.0, fractionDigits: 1 }),
    count: faker.number.int({ min: 5, max: 2000 }),
    ...overrides,
  }
}

export function createShipping(overrides: Partial<Shipping> = {}): Shipping {
  const freeShipping = faker.datatype.boolean({ probability: 0.4 }) // 40% free shipping

  return {
    freeShipping,
    estimatedDays: faker.number.int({ min: 2, max: 7 }),
    cost: freeShipping ? 0 : faker.number.int({ min: 50, max: 150 }),
    ...overrides,
  }
}

export function createShippingOptions(): Array<ShippingOption> {
  return [
    {
      method: 'Standard Delivery',
      cost: faker.number.int({ min: 50, max: 100 }),
      estimatedDays: faker.number.int({ min: 5, max: 7 }),
    },
    {
      method: 'Express Delivery',
      cost: faker.number.int({ min: 100, max: 200 }),
      estimatedDays: faker.number.int({ min: 2, max: 3 }),
    },
    {
      method: 'Same Day Delivery',
      cost: faker.number.int({ min: 200, max: 300 }),
      estimatedDays: 1,
    },
  ]
}

export function createProductImages(count: number = 4): Array<ProductImage> {
  const seed = faker.string.alphanumeric(8)
  return Array.from({ length: count }, (_, index) => ({
    url: `https://picsum.photos/seed/${seed}-${index}/500/500`,
    alt: faker.commerce.productName(),
    isPrimary: index === 0,
  }))
}

export function createVariants(categoryId: string): Array<ProductVariant> {
  const variants: Array<ProductVariant> = []

  // Fashion categories get size and color variants
  if (['fashion', 'sports'].includes(categoryId)) {
    // Color variants
    const colors = faker.helpers.arrayElements(COLOR_OPTIONS, {
      min: 2,
      max: 4,
    })
    colors.forEach((color) => {
      variants.push({
        id: faker.string.uuid(),
        type: 'color',
        value: color,
        priceModifier: 0,
        stock: faker.number.int({ min: 0, max: 50 }),
        imageUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(6)}/500/500`,
      })
    })

    // Size variants
    const sizes = faker.helpers.arrayElements(SIZE_OPTIONS, { min: 3, max: 5 })
    sizes.forEach((size) => {
      variants.push({
        id: faker.string.uuid(),
        type: 'size',
        value: size,
        priceModifier: size === 'XXL' ? 100 : 0,
        stock: faker.number.int({ min: 0, max: 30 }),
      })
    })
  }

  // Electronics get storage/memory variants
  if (categoryId === 'electronics') {
    const storageOptions = ['64GB', '128GB', '256GB', '512GB']
    faker.helpers
      .arrayElements(storageOptions, { min: 2, max: 3 })
      .forEach((storage) => {
        variants.push({
          id: faker.string.uuid(),
          type: 'material', // Using material for storage
          value: storage,
          priceModifier: storageOptions.indexOf(storage) * 2000,
          stock: faker.number.int({ min: 0, max: 20 }),
        })
      })
  }

  return variants
}

export function createKeyFeatures(): Array<string> {
  return [
    faker.commerce.productAdjective() + ' ' + faker.commerce.productMaterial(),
    faker.lorem.sentence({ min: 3, max: 6 }),
    faker.lorem.sentence({ min: 3, max: 6 }),
    'Premium quality assured',
    faker.datatype.boolean()
      ? 'Fast shipping available'
      : 'Easy returns within 7 days',
  ].slice(0, faker.number.int({ min: 3, max: 5 }))
}

export function createWhatsIncluded(): Array<string> {
  return Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () =>
    faker.commerce.productName(),
  )
}

export function createSetupInstructions(): string {
  return faker.lorem.paragraphs(2)
}

function generateRelevantDescription(title: string): string {
  const adjectives = [
    faker.commerce.productAdjective(),
    faker.commerce.productAdjective(),
  ]
  const material = faker.commerce.productMaterial()

  return `${adjectives[0]} ${title.toLowerCase()} made with ${material.toLowerCase()}. ${faker.company.catchPhrase()}. ${adjectives[1]} quality for your event. ${faker.lorem.sentence({ min: 8, max: 12 })}`
}

export function createProduct(
  overrides: Partial<Product> = {},
  vendorData?: { id: string; name: string; isVerified: boolean },
): Product {
  const category = faker.helpers.arrayElement(CATEGORIES)
  const categoryId = overrides.categoryId || category.id
  const title = overrides.title || getEventProductName(categoryId)
  const brand = overrides.brand || faker.company.name()
  const stock = faker.number.int({ min: 0, max: 500 })

  // Assign a random subcategory from the category's subcategories
  const selectedCategory =
    CATEGORIES.find((cat) => cat.id === categoryId) || category
  const subcategoryId =
    selectedCategory.subcategories.length > 0
      ? faker.helpers.arrayElement(selectedCategory.subcategories).id
      : undefined

  let stockStatus: StockStatus = 'in_stock'
  if (stock === 0) stockStatus = 'out_of_stock'
  else if (stock < 10) stockStatus = 'low_stock'

  const badges: Array<ProductBadge> = faker.helpers.arrayElements(
    BADGE_OPTIONS,
    {
      min: 0,
      max: 2,
    },
  )

  const vendor = vendorData || {
    id: faker.string.uuid(),
    name: faker.company.name(),
    isVerified: faker.datatype.boolean({ probability: 0.7 }),
  }

  return {
    id: faker.string.uuid(),
    title,
    brand,
    slug: slugify(title) + '-' + faker.string.alphanumeric(6),
    description: generateRelevantDescription(title),
    descriptionShort: `${faker.commerce.productAdjective()} ${title.toLowerCase()} for your event. ${faker.company.catchPhrase()}.`,
    images: createProductImages(faker.number.int({ min: 3, max: 6 })),
    vendor,
    pricing: createPricing(overrides.pricing),
    rating: createRating(overrides.rating),
    shipping: createShipping(overrides.shipping),
    shippingOptions: createShippingOptions(),
    stockStatus,
    stock,
    badges,
    categoryId,
    subcategoryId,
    keyFeatures: createKeyFeatures(),
    whatsIncluded: createWhatsIncluded(),
    setupInstructions: faker.datatype.boolean()
      ? createSetupInstructions()
      : undefined,
    variants: createVariants(categoryId),
    returnPolicy:
      '7-day return policy. Product must be unused and in original packaging.',
    warranty: faker.datatype.boolean()
      ? '1 year manufacturer warranty'
      : 'No warranty',
    createdAt: faker.date.recent({ days: 30 }).toISOString(),
    ...overrides,
  }
}

export function createDealProduct(
  dealType: DealType = 'flash',
  overrides: Partial<DealProduct> = {},
): DealProduct {
  // Deals should have significant discounts
  const discountRange: Record<DealType, [number, number]> = {
    flash: [40, 90],
    daily: [20, 50],
    clearance: [50, 80],
    bundle: [15, 30],
  }

  const [minDiscount, maxDiscount] = discountRange[dealType]
  const discountPercentage = faker.number.int({
    min: minDiscount,
    max: maxDiscount,
  })

  // Set deal end time based on deal type
  const dealDurations: Record<DealType, number> = {
    flash: faker.number.int({ min: 1, max: 6 }) * 60 * 60 * 1000, // 1-6 hours
    daily: 24 * 60 * 60 * 1000, // 24 hours
    clearance: 7 * 24 * 60 * 60 * 1000, // 7 days
    bundle: 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  const now = new Date()
  const dealStartedAt = new Date(
    now.getTime() - faker.number.int({ min: 0, max: 2 }) * 60 * 60 * 1000,
  )
  const dealEndsAt = new Date(dealStartedAt.getTime() + dealDurations[dealType])

  // Create pricing with proper discount
  const pricing = createPricing({ discountPercentage })

  const baseProduct = createProduct({
    ...overrides,
    pricing,
  })

  return {
    ...baseProduct,
    dealType,
    dealStartedAt: dealStartedAt.toISOString(),
    dealEndsAt: dealEndsAt.toISOString(),
  }
}

export function createProducts(
  count: number,
  vendors?: Array<{ id: string; name: string; isVerified: boolean }>,
): Array<Product> {
  return Array.from({ length: count }, () => {
    const vendor = vendors ? faker.helpers.arrayElement(vendors) : undefined
    return createProduct({}, vendor)
  })
}

export function createDealProducts(
  count: number,
  dealType?: DealType,
): Array<DealProduct> {
  const dealTypes: Array<DealType> = [
    'flash',
    'hot',
    'daily',
    'clearance',
    'bundle',
  ]
  return Array.from({ length: count }, () =>
    createDealProduct(dealType || faker.helpers.arrayElement(dealTypes)),
  )
}
