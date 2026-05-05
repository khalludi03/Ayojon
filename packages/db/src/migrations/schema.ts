import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const orders = pgTable(
  'orders',
  {
    id: text().primaryKey().notNull(),
    userId: text('user_id').notNull(),
    status: text().default('pending').notNull(),
    total: numeric({ precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('orders_status_idx').using(
      'btree',
      table.status.asc().nullsLast().op('text_ops'),
    ),
    index('orders_user_id_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'orders_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const orderItems = pgTable(
  'order_items',
  {
    id: text().primaryKey().notNull(),
    orderId: text('order_id').notNull(),
    productId: text('product_id').notNull(),
    quantity: text().notNull(),
    price: numeric({ precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('order_items_order_id_idx').using(
      'btree',
      table.orderId.asc().nullsLast().op('text_ops'),
    ),
    index('order_items_product_id_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.orderId],
      foreignColumns: [orders.id],
      name: 'order_items_order_id_orders_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'order_items_product_id_products_id_fk',
    }).onDelete('cascade'),
  ],
)

export const user = pgTable(
  'user',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    email: text().notNull(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    isDeactivated: boolean('is_deactivated').default(false).notNull(),
    deactivatedAt: timestamp('deactivated_at', { mode: 'string' }),
    deactivationReason: text('deactivation_reason'),
    deactivationFeedback: text('deactivation_feedback'),
    scheduledDeletionAt: timestamp('scheduled_deletion_at', { mode: 'string' }),
    preferredContactMethod: text('preferred_contact_method')
      .default('in_app')
      .notNull(),
    preferredLanguage: text('preferred_language').default('english').notNull(),
  },
  (table) => [unique('user_email_unique').on(table.email)],
)

export const account = pgTable(
  'account',
  {
    id: text().primaryKey().notNull(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at', {
      mode: 'string',
    }),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at', {
      mode: 'string',
    }),
    scope: text(),
    password: text(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
  },
  (table) => [
    index('account_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'account_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const session = pgTable(
  'session',
  {
    id: text().primaryKey().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    token: text().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id').notNull(),
  },
  (table) => [
    index('session_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'session_user_id_user_id_fk',
    }).onDelete('cascade'),
    unique('session_token_unique').on(table.token),
  ],
)

export const verification = pgTable(
  'verification',
  {
    id: text().primaryKey().notNull(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp('expires_at', { mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('verification_identifier_idx').using(
      'btree',
      table.identifier.asc().nullsLast().op('text_ops'),
    ),
  ],
)

export const address = pgTable(
  'address',
  {
    id: text().primaryKey().notNull(),
    userId: text('user_id').notNull(),
    name: text().notNull(),
    phone: text().notNull(),
    addressLine1: text('address_line1').notNull(),
    addressLine2: text('address_line2'),
    city: text().notNull(),
    state: text().notNull(),
    postalCode: text('postal_code').notNull(),
    country: text().notNull(),
    type: text().default('home').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('address_isDefault_idx').using(
      'btree',
      table.isDefault.asc().nullsLast().op('bool_ops'),
    ),
    index('address_userId_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'address_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const categories = pgTable(
  'categories',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    icon: text().notNull(),
    description: text(),
    imageUrl: text('image_url'),
    productCount: integer('product_count').default(0).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique('categories_slug_unique').on(table.slug)],
)

export const subcategories = pgTable(
  'subcategories',
  {
    id: text().primaryKey().notNull(),
    parentId: text('parent_id').notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    imageUrl: text('image_url'),
    productCount: integer('product_count').default(0).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('subcategories_parent_id_idx').using(
      'btree',
      table.parentId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.parentId],
      foreignColumns: [categories.id],
      name: 'subcategories_parent_id_categories_id_fk',
    }).onDelete('cascade'),
    unique('subcategories_slug_unique').on(table.slug),
  ],
)

export const vendors = pgTable(
  'vendors',
  {
    id: text().primaryKey().notNull(),
    userId: text('user_id').notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    logoUrl: text('logo_url'),
    bannerUrl: text('banner_url'),
    location: text().notNull(),
    address: text(),
    phone: text(),
    email: text(),
    website: text(),
    isVerified: boolean('is_verified').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    ratingAverage: numeric('rating_average', {
      precision: 2,
      scale: 1,
    }).default('0'),
    ratingCount: integer('rating_count').default(0).notNull(),
    productCount: integer('product_count').default(0).notNull(),
    totalSales: integer('total_sales').default(0).notNull(),
    joinedAt: timestamp('joined_at', { mode: 'string' }).defaultNow().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('vendors_is_verified_idx').using(
      'btree',
      table.isVerified.asc().nullsLast().op('bool_ops'),
    ),
    index('vendors_location_idx').using(
      'btree',
      table.location.asc().nullsLast().op('text_ops'),
    ),
    index('vendors_slug_idx').using(
      'btree',
      table.slug.asc().nullsLast().op('text_ops'),
    ),
    index('vendors_user_id_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'vendors_user_id_user_id_fk',
    }).onDelete('cascade'),
    unique('vendors_user_id_unique').on(table.userId),
    unique('vendors_slug_unique').on(table.slug),
  ],
)

export const products = pgTable(
  'products',
  {
    id: text().primaryKey().notNull(),
    vendorId: text('vendor_id').notNull(),
    categoryId: text('category_id').notNull(),
    subcategoryId: text('subcategory_id'),
    title: text().notNull(),
    slug: text().notNull(),
    description: text().notNull(),
    descriptionShort: text('description_short'),
    brand: text(),
    sku: text(),
    status: text().default('draft').notNull(),
    stockStatus: text('stock_status').default('in_stock').notNull(),
    stock: integer().default(0).notNull(),
    lowStockThreshold: integer('low_stock_threshold').default(5).notNull(),
    price: numeric({ precision: 12, scale: 2 }).notNull(),
    salePrice: numeric('sale_price', { precision: 12, scale: 2 }),
    discountPercentage: integer('discount_percentage'),
    currency: text().default('BDT').notNull(),
    ratingAverage: numeric('rating_average', {
      precision: 2,
      scale: 1,
    }).default('0'),
    ratingCount: integer('rating_count').default(0).notNull(),
    weightKg: numeric('weight_kg', { precision: 6, scale: 2 }),
    dimensionLengthCm: numeric('dimension_length_cm', {
      precision: 6,
      scale: 2,
    }),
    dimensionWidthCm: numeric('dimension_width_cm', { precision: 6, scale: 2 }),
    dimensionHeightCm: numeric('dimension_height_cm', {
      precision: 6,
      scale: 2,
    }),
    isFragile: boolean('is_fragile').default(false).notNull(),
    setupRequired: boolean('setup_required').default(false).notNull(),
    freeShipping: boolean('free_shipping').default(false).notNull(),
    shippingCost: numeric('shipping_cost', { precision: 10, scale: 2 }),
    shippingEstimatedDays: integer('shipping_estimated_days'),
    content: jsonb(),
    dealType: text('deal_type'),
    dealStartsAt: timestamp('deal_starts_at', { mode: 'string' }),
    dealEndsAt: timestamp('deal_ends_at', { mode: 'string' }),
    isFeatured: boolean('is_featured').default(false).notNull(),
    condition: text().default('new').notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    salesCount: integer('sales_count').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('products_category_id_idx').using(
      'btree',
      table.categoryId.asc().nullsLast().op('text_ops'),
    ),
    index('products_category_status_idx').using(
      'btree',
      table.categoryId.asc().nullsLast().op('text_ops'),
      table.status.asc().nullsLast().op('text_ops'),
    ),
    index('products_deal_ends_at_idx').using(
      'btree',
      table.dealEndsAt.asc().nullsLast().op('timestamp_ops'),
    ),
    index('products_deal_type_idx').using(
      'btree',
      table.dealType.asc().nullsLast().op('text_ops'),
    ),
    index('products_is_featured_idx').using(
      'btree',
      table.isFeatured.asc().nullsLast().op('bool_ops'),
    ),
    index('products_price_idx').using(
      'btree',
      table.price.asc().nullsLast().op('numeric_ops'),
    ),
    index('products_rating_average_idx').using(
      'btree',
      table.ratingAverage.asc().nullsLast().op('numeric_ops'),
    ),
    index('products_slug_idx').using(
      'btree',
      table.slug.asc().nullsLast().op('text_ops'),
    ),
    index('products_status_category_price_idx').using(
      'btree',
      table.status.asc().nullsLast().op('numeric_ops'),
      table.categoryId.asc().nullsLast().op('text_ops'),
      table.price.asc().nullsLast().op('text_ops'),
    ),
    index('products_status_idx').using(
      'btree',
      table.status.asc().nullsLast().op('text_ops'),
    ),
    index('products_stock_status_idx').using(
      'btree',
      table.stockStatus.asc().nullsLast().op('text_ops'),
    ),
    index('products_subcategory_id_idx').using(
      'btree',
      table.subcategoryId.asc().nullsLast().op('text_ops'),
    ),
    index('products_vendor_id_idx').using(
      'btree',
      table.vendorId.asc().nullsLast().op('text_ops'),
    ),
    index('products_vendor_status_idx').using(
      'btree',
      table.vendorId.asc().nullsLast().op('text_ops'),
      table.status.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendors.id],
      name: 'products_vendor_id_vendors_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: 'products_category_id_categories_id_fk',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.subcategoryId],
      foreignColumns: [subcategories.id],
      name: 'products_subcategory_id_subcategories_id_fk',
    }).onDelete('set null'),
    unique('products_slug_unique').on(table.slug),
  ],
)

export const productEventTypes = pgTable(
  'product_event_types',
  {
    id: text().primaryKey().notNull(),
    productId: text('product_id').notNull(),
    eventTypeId: text('event_type_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('product_event_types_event_type_id_idx').using(
      'btree',
      table.eventTypeId.asc().nullsLast().op('text_ops'),
    ),
    index('product_event_types_product_id_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'product_event_types_product_id_products_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.eventTypeId],
      foreignColumns: [eventTypes.id],
      name: 'product_event_types_event_type_id_event_types_id_fk',
    }).onDelete('cascade'),
  ],
)

export const eventTypes = pgTable(
  'event_types',
  {
    id: text().primaryKey().notNull(),
    name: text().notNull(),
    slug: text().notNull(),
    description: text(),
    iconUrl: text('icon_url'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [unique('event_types_slug_unique').on(table.slug)],
)

export const productImages = pgTable(
  'product_images',
  {
    id: text().primaryKey().notNull(),
    productId: text('product_id').notNull(),
    url: text().notNull(),
    alt: text(),
    isPrimary: boolean('is_primary').default(false).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('product_images_is_primary_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
      table.isPrimary.asc().nullsLast().op('text_ops'),
    ),
    index('product_images_product_id_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'product_images_product_id_products_id_fk',
    }).onDelete('cascade'),
  ],
)

export const productPrices = pgTable(
  'product_prices',
  {
    id: text().primaryKey().notNull(),
    productId: text('product_id').notNull(),
    priceType: text('price_type').default('regular').notNull(),
    price: numeric({ precision: 12, scale: 2 }).notNull(),
    minQuantity: integer('min_quantity').default(1).notNull(),
    maxQuantity: integer('max_quantity'),
    startsAt: timestamp('starts_at', { mode: 'string' }),
    endsAt: timestamp('ends_at', { mode: 'string' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('product_prices_price_type_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
      table.priceType.asc().nullsLast().op('text_ops'),
    ),
    index('product_prices_product_id_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'product_prices_product_id_products_id_fk',
    }).onDelete('cascade'),
  ],
)

export const productShippingOptions = pgTable(
  'product_shipping_options',
  {
    id: text().primaryKey().notNull(),
    productId: text('product_id').notNull(),
    method: text().notNull(),
    cost: numeric({ precision: 10, scale: 2 }).notNull(),
    estimatedDays: integer('estimated_days').notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('product_shipping_options_product_id_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'product_shipping_options_product_id_products_id_fk',
    }).onDelete('cascade'),
  ],
)

export const productSpecifications = pgTable(
  'product_specifications',
  {
    id: text().primaryKey().notNull(),
    productId: text('product_id').notNull(),
    key: text().notNull(),
    value: text().notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('product_specifications_product_id_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'product_specifications_product_id_products_id_fk',
    }).onDelete('cascade'),
  ],
)

export const productVariants = pgTable(
  'product_variants',
  {
    id: text().primaryKey().notNull(),
    productId: text('product_id').notNull(),
    type: text().notNull(),
    value: text().notNull(),
    priceModifier: numeric('price_modifier', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    stock: integer().default(0).notNull(),
    sku: text(),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('product_variants_product_id_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
    ),
    index('product_variants_type_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
      table.type.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'product_variants_product_id_products_id_fk',
    }).onDelete('cascade'),
  ],
)

export const reviews = pgTable(
  'reviews',
  {
    id: text().primaryKey().notNull(),
    productId: text('product_id').notNull(),
    userId: text('user_id').notNull(),
    rating: integer().notNull(),
    title: text(),
    comment: text().notNull(),
    isVerifiedPurchase: boolean('is_verified_purchase')
      .default(false)
      .notNull(),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
    isApproved: boolean('is_approved').default(true).notNull(),
    isFlagged: boolean('is_flagged').default(false).notNull(),
    helpfulVotes: integer('helpful_votes').default(0).notNull(),
    notHelpfulVotes: integer('not_helpful_votes').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('reviews_created_at_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
      table.createdAt.asc().nullsLast().op('timestamp_ops'),
    ),
    index('reviews_is_verified_purchase_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
      table.isVerifiedPurchase.asc().nullsLast().op('text_ops'),
    ),
    index('reviews_product_id_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('text_ops'),
    ),
    index('reviews_rating_idx').using(
      'btree',
      table.productId.asc().nullsLast().op('int4_ops'),
      table.rating.asc().nullsLast().op('int4_ops'),
    ),
    index('reviews_user_id_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: 'reviews_product_id_products_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'reviews_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const reviewImages = pgTable(
  'review_images',
  {
    id: text().primaryKey().notNull(),
    reviewId: text('review_id').notNull(),
    url: text().notNull(),
    alt: text(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('review_images_review_id_idx').using(
      'btree',
      table.reviewId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [reviews.id],
      name: 'review_images_review_id_reviews_id_fk',
    }).onDelete('cascade'),
  ],
)

export const reviewVotes = pgTable(
  'review_votes',
  {
    id: text().primaryKey().notNull(),
    reviewId: text('review_id').notNull(),
    userId: text('user_id').notNull(),
    voteType: text('vote_type').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('review_votes_review_id_idx').using(
      'btree',
      table.reviewId.asc().nullsLast().op('text_ops'),
    ),
    index('review_votes_unique_idx').using(
      'btree',
      table.reviewId.asc().nullsLast().op('text_ops'),
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    index('review_votes_user_id_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.reviewId],
      foreignColumns: [reviews.id],
      name: 'review_votes_review_id_reviews_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'review_votes_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)

export const vendorRatings = pgTable(
  'vendor_ratings',
  {
    id: text().primaryKey().notNull(),
    vendorId: text('vendor_id').notNull(),
    userId: text('user_id').notNull(),
    overallRating: integer('overall_rating').notNull(),
    communicationRating: integer('communication_rating'),
    deliveryRating: integer('delivery_rating'),
    qualityRating: integer('quality_rating'),
    comment: text(),
    isVerifiedPurchase: boolean('is_verified_purchase')
      .default(false)
      .notNull(),
    isApproved: boolean('is_approved').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('vendor_ratings_overall_rating_idx').using(
      'btree',
      table.vendorId.asc().nullsLast().op('int4_ops'),
      table.overallRating.asc().nullsLast().op('text_ops'),
    ),
    index('vendor_ratings_user_id_idx').using(
      'btree',
      table.userId.asc().nullsLast().op('text_ops'),
    ),
    index('vendor_ratings_vendor_id_idx').using(
      'btree',
      table.vendorId.asc().nullsLast().op('text_ops'),
    ),
    foreignKey({
      columns: [table.vendorId],
      foreignColumns: [vendors.id],
      name: 'vendor_ratings_vendor_id_vendors_id_fk',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [user.id],
      name: 'vendor_ratings_user_id_user_id_fk',
    }).onDelete('cascade'),
  ],
)
