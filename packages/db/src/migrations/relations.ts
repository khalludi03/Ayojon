import { relations } from 'drizzle-orm/relations'
import {
  account,
  address,
  categories,
  eventTypes,
  orderItems,
  orders,
  productEventTypes,
  productImages,
  productPrices,
  productShippingOptions,
  productSpecifications,
  productVariants,
  products,
  reviewImages,
  reviewVotes,
  reviews,
  session,
  subcategories,
  user,
  vendorRatings,
  vendors,
} from './schema'

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  orderItems: many(orderItems),
}))

export const userRelations = relations(user, ({ many }) => ({
  orders: many(orders),
  accounts: many(account),
  sessions: many(session),
  addresses: many(address),
  vendors: many(vendors),
  reviews: many(reviews),
  reviewVotes: many(reviewVotes),
  vendorRatings: many(vendorRatings),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  orderItems: many(orderItems),
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
  productEventTypes: many(productEventTypes),
  productImages: many(productImages),
  productPrices: many(productPrices),
  productShippingOptions: many(productShippingOptions),
  productSpecifications: many(productSpecifications),
  productVariants: many(productVariants),
  reviews: many(reviews),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const addressRelations = relations(address, ({ one }) => ({
  user: one(user, {
    fields: [address.userId],
    references: [user.id],
  }),
}))

export const subcategoriesRelations = relations(
  subcategories,
  ({ one, many }) => ({
    category: one(categories, {
      fields: [subcategories.parentId],
      references: [categories.id],
    }),
    products: many(products),
  }),
)

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  products: many(products),
}))

export const vendorsRelations = relations(vendors, ({ one, many }) => ({
  user: one(user, {
    fields: [vendors.userId],
    references: [user.id],
  }),
  products: many(products),
  vendorRatings: many(vendorRatings),
}))

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
)

export const eventTypesRelations = relations(eventTypes, ({ many }) => ({
  productEventTypes: many(productEventTypes),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

export const productPricesRelations = relations(productPrices, ({ one }) => ({
  product: one(products, {
    fields: [productPrices.productId],
    references: [products.id],
  }),
}))

export const productShippingOptionsRelations = relations(
  productShippingOptions,
  ({ one }) => ({
    product: one(products, {
      fields: [productShippingOptions.productId],
      references: [products.id],
    }),
  }),
)

export const productSpecificationsRelations = relations(
  productSpecifications,
  ({ one }) => ({
    product: one(products, {
      fields: [productSpecifications.productId],
      references: [products.id],
    }),
  }),
)

export const productVariantsRelations = relations(
  productVariants,
  ({ one }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
  }),
)

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
  reviewImages: many(reviewImages),
  reviewVotes: many(reviewVotes),
}))

export const reviewImagesRelations = relations(reviewImages, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewImages.reviewId],
    references: [reviews.id],
  }),
}))

export const reviewVotesRelations = relations(reviewVotes, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewVotes.reviewId],
    references: [reviews.id],
  }),
  user: one(user, {
    fields: [reviewVotes.userId],
    references: [user.id],
  }),
}))

export const vendorRatingsRelations = relations(vendorRatings, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorRatings.vendorId],
    references: [vendors.id],
  }),
  user: one(user, {
    fields: [vendorRatings.userId],
    references: [user.id],
  }),
}))
