import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  index,
  jsonb,
  primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { vendors, categories, subcategories, eventTypes } from "./catalog";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ProductStatus = "draft" | "active" | "out_of_stock" | "archived";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type CurrencyCode = "BDT" | "INR" | "PKR" | "USD";
export type DealType = "flash" | "daily" | "clearance" | "bundle";
export type ProductCondition = "new" | "like-new" | "good";
export type ProductBadge = "choice" | "top_seller" | "new" | "verified";
export type VariantType = "color" | "size" | "material";
export type ShippingMethod = "standard" | "express" | "same_day";

// JSONB content types
export interface ProductContent {
  keyFeatures?: string[];
  whatsIncluded?: string[];
  badges?: ProductBadge[];
  setupInstructions?: string;
  returnPolicy?: string;
  warranty?: string;
}

// =============================================================================
// PRODUCTS
// =============================================================================

export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    vendorId: text("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    subcategoryId: text("subcategory_id").references(() => subcategories.id, {
      onDelete: "set null",
    }),

    // Basic Info
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    descriptionShort: text("description_short"),
    brand: text("brand"),
    sku: text("sku"),

    // Status
    status: text("status").$type<ProductStatus>().default("draft").notNull(),
    stockStatus: text("stock_status")
      .$type<StockStatus>()
      .default("in_stock")
      .notNull(),
    stock: integer("stock").default(0).notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),

    // Pricing
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    salePrice: numeric("sale_price", { precision: 12, scale: 2 }),
    discountPercentage: integer("discount_percentage"),
    currency: text("currency").$type<CurrencyCode>().default("BDT").notNull(),

    // Ratings (denormalized for performance)
    ratingAverage: numeric("rating_average", { precision: 2, scale: 1, mode: "number" }).default(0),
    ratingCount: integer("rating_count").default(0).notNull(),

    // Shipping
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }),
    dimensionLengthCm: numeric("dimension_length_cm", { precision: 6, scale: 2 }),
    dimensionWidthCm: numeric("dimension_width_cm", { precision: 6, scale: 2 }),
    dimensionHeightCm: numeric("dimension_height_cm", { precision: 6, scale: 2 }),
    isFragile: boolean("is_fragile").default(false).notNull(),
    setupRequired: boolean("setup_required").default(false).notNull(),
    freeShipping: boolean("free_shipping").default(false).notNull(),
    shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 }),
    shippingEstimatedDays: integer("shipping_estimated_days"),

    // Content (JSONB)
    content: jsonb("content").$type<ProductContent>(),

    // Deals
    dealType: text("deal_type").$type<DealType>(),
    dealStartsAt: timestamp("deal_starts_at"),
    dealEndsAt: timestamp("deal_ends_at"),

    // Flags
    isFeatured: boolean("is_featured").default(false).notNull(),
    condition: text("condition").$type<ProductCondition>().default("new").notNull(),

    // Metrics
    viewCount: integer("view_count").default(0).notNull(),
    salesCount: integer("sales_count").default(0).notNull(),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    // Single column indexes
    index("products_vendor_id_idx").on(table.vendorId),
    index("products_category_id_idx").on(table.categoryId),
    index("products_subcategory_id_idx").on(table.subcategoryId),
    index("products_status_idx").on(table.status),
    index("products_stock_status_idx").on(table.stockStatus),
    index("products_price_idx").on(table.price),
    index("products_rating_average_idx").on(table.ratingAverage),
    index("products_is_featured_idx").on(table.isFeatured),
    index("products_deal_type_idx").on(table.dealType),
    index("products_deal_ends_at_idx").on(table.dealEndsAt),
    index("products_slug_idx").on(table.slug),

    // Composite indexes for filtered listings
    index("products_category_status_idx").on(table.categoryId, table.status),
    index("products_vendor_status_idx").on(table.vendorId, table.status),
    index("products_status_category_price_idx").on(
      table.status,
      table.categoryId,
      table.price,
    ),
  ],
);

// =============================================================================
// PRODUCT IMAGES
// =============================================================================

export const productImages = pgTable(
  "product_images",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: text("alt"),
    isPrimary: boolean("is_primary").default(false).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_images_product_id_idx").on(table.productId),
    index("product_images_is_primary_idx").on(table.productId, table.isPrimary),
  ],
);

// =============================================================================
// PRODUCT VARIANTS
// =============================================================================

export const productVariants = pgTable(
  "product_variants",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    type: text("type").$type<VariantType>().notNull(),
    value: text("value").notNull(),
    priceModifier: numeric("price_modifier", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    stock: integer("stock").default(0).notNull(),
    sku: text("sku"),
    imageUrl: text("image_url"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("product_variants_product_id_idx").on(table.productId),
    index("product_variants_type_idx").on(table.productId, table.type),
  ],
);

// =============================================================================
// PRODUCT SPECIFICATIONS
// =============================================================================

export const productSpecifications = pgTable(
  "product_specifications",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    key: text("key").notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_specifications_product_id_idx").on(table.productId),
  ],
);

// =============================================================================
// PRODUCT EVENT TYPES (Junction Table)
// =============================================================================

export const productEventTypes = pgTable(
  "product_event_types",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    eventTypeId: text("event_type_id")
      .notNull()
      .references(() => eventTypes.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_event_types_product_id_idx").on(table.productId),
    index("product_event_types_event_type_id_idx").on(table.eventTypeId),
  ],
);

// =============================================================================
// PRODUCT PRICES (Price History & Bulk Pricing)
// =============================================================================

export type PriceType = "regular" | "bulk" | "promotional";

export const productPrices = pgTable(
  "product_prices",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    priceType: text("price_type").$type<PriceType>().default("regular").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    minQuantity: integer("min_quantity").default(1).notNull(),
    maxQuantity: integer("max_quantity"),
    startsAt: timestamp("starts_at"),
    endsAt: timestamp("ends_at"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_prices_product_id_idx").on(table.productId),
    index("product_prices_price_type_idx").on(table.productId, table.priceType),
  ],
);

// =============================================================================
// PRODUCT SHIPPING OPTIONS
// =============================================================================

export const productShippingOptions = pgTable(
  "product_shipping_options",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    method: text("method").$type<ShippingMethod>().notNull(),
    cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
    estimatedDays: integer("estimated_days").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("product_shipping_options_product_id_idx").on(table.productId),
  ],
);

// =============================================================================
// RELATIONS
// =============================================================================

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [products.vendorId],
    references: [vendors.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  specifications: many(productSpecifications),
  eventTypes: many(productEventTypes),
  prices: many(productPrices),
  shippingOptions: many(productShippingOptions),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  }),
);

export const productSpecificationsRelations = relations(
  productSpecifications,
  ({ one }) => ({
    product: one(products, {
      fields: [productSpecifications.productId],
      references: [products.id],
    }),
  }),
);

export const productEventTypesRelations = relations(
  productEventTypes,
  ({ one }) => ({
    product: one(products, {
      fields: [productEventTypes.productId],
      references: [products.id],
    }),
    eventType: one(eventTypes, {
      fields: [productEventTypes.eventTypeId],
      references: [eventTypes.id],
    }),
  }),
);

export const productPricesRelations = relations(productPrices, ({ one }) => ({
  product: one(products, {
    fields: [productPrices.productId],
    references: [products.id],
  }),
}));

export const productShippingOptionsRelations = relations(
  productShippingOptions,
  ({ one }) => ({
    product: one(products, {
      fields: [productShippingOptions.productId],
      references: [products.id],
    }),
  }),
);

// =============================================================================
// WISHLIST
// =============================================================================

export const wishlist = pgTable(
  "wishlist",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.productId] }),
    };
  }
);

export const wishlistRelations = relations(wishlist, ({ one }) => ({
  user: one(user, {
    fields: [wishlist.userId],
    references: [user.id],
  }),
  product: one(products, {
    fields: [wishlist.productId],
    references: [products.id],
  }),
}));

// =============================================================================
// CART
// =============================================================================

export const cart = pgTable(
  "cart",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: text("variant_id").notNull().default(''),
    quantity: integer("quantity").notNull().default(1),
    savedForLater: integer("saved_for_later").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.userId, table.productId, table.variantId] }),
    };
  }
);

export const cartRelations = relations(cart, ({ one }) => ({
  user: one(user, {
    fields: [cart.userId],
    references: [user.id],
  }),
  product: one(products, {
    fields: [cart.productId],
    references: [products.id],
  }),
}));
