import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { products } from './products'
import { vendors } from './catalog'

// =============================================================================
// REVIEWS
// =============================================================================

export const reviews = pgTable(
  'reviews',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Review Content
    rating: integer('rating').notNull(), // 1-5
    title: text('title'),
    comment: text('comment').notNull(),
    recommend: boolean('recommend').default(true).notNull(),

    // Flags
    isVerifiedPurchase: boolean('is_verified_purchase')
      .default(false)
      .notNull(),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
    isApproved: boolean('is_approved').default(true).notNull(),
    isFlagged: boolean('is_flagged').default(false).notNull(),

    // Votes (denormalized for performance)
    helpfulVotes: integer('helpful_votes').default(0).notNull(),
    notHelpfulVotes: integer('not_helpful_votes').default(0).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('reviews_product_id_idx').on(table.productId),
    index('reviews_user_id_idx').on(table.userId),
    uniqueIndex('reviews_product_user_unique_idx').on(
      table.productId,
      table.userId,
    ),
    index('reviews_rating_idx').on(table.productId, table.rating),
    index('reviews_is_verified_purchase_idx').on(
      table.productId,
      table.isVerifiedPurchase,
    ),
    index('reviews_created_at_idx').on(table.productId, table.createdAt),
  ],
)

// =============================================================================
// REVIEW IMAGES
// =============================================================================

export const reviewImages = pgTable(
  'review_images',
  {
    id: text('id').primaryKey(),
    reviewId: text('review_id')
      .notNull()
      .references(() => reviews.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: text('alt'),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('review_images_review_id_idx').on(table.reviewId)],
)

// =============================================================================
// REVIEW VOTES
// =============================================================================

export type VoteType = 'helpful' | 'not_helpful'

export const reviewVotes = pgTable(
  'review_votes',
  {
    id: text('id').primaryKey(),
    reviewId: text('review_id')
      .notNull()
      .references(() => reviews.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    voteType: text('vote_type').$type<VoteType>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('review_votes_review_id_idx').on(table.reviewId),
    index('review_votes_user_id_idx').on(table.userId),
    index('review_votes_unique_idx').on(table.reviewId, table.userId),
  ],
)

// =============================================================================
// VENDOR RATINGS (Separate from product reviews)
// =============================================================================

export const vendorRatings = pgTable(
  'vendor_ratings',
  {
    id: text('id').primaryKey(),
    vendorId: text('vendor_id')
      .notNull()
      .references(() => vendors.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),

    // Rating Categories
    overallRating: integer('overall_rating').notNull(), // 1-5
    communicationRating: integer('communication_rating'), // 1-5
    deliveryRating: integer('delivery_rating'), // 1-5
    qualityRating: integer('quality_rating'), // 1-5

    // Review Content
    comment: text('comment'),

    // Flags
    isVerifiedPurchase: boolean('is_verified_purchase')
      .default(false)
      .notNull(),
    isApproved: boolean('is_approved').default(true).notNull(),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('vendor_ratings_vendor_id_idx').on(table.vendorId),
    index('vendor_ratings_user_id_idx').on(table.userId),
    index('vendor_ratings_overall_rating_idx').on(
      table.vendorId,
      table.overallRating,
    ),
  ],
)

// =============================================================================
// RELATIONS
// =============================================================================

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(user, {
    fields: [reviews.userId],
    references: [user.id],
  }),
  images: many(reviewImages),
  votes: many(reviewVotes),
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
