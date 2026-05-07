import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// =============================================================================
// HOME BANNERS (Main Carousel Slides)
// =============================================================================

export const homeBanners = pgTable(
  'home_banners',
  {
    id: text('id').primaryKey(),
    imageUrl: text('image_url').notNull(),
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull(),
    buttonText: text('button_text').notNull(),
    buttonLink: text('button_link').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('home_banners_is_active_idx').on(table.isActive),
    index('home_banners_sort_order_idx').on(table.sortOrder),
    index('home_banners_active_sort_idx').on(table.isActive, table.sortOrder),
  ],
)

// =============================================================================
// HOME PROMO CARDS (4 Fixed Slots)
// =============================================================================

export const homePromoCards = pgTable(
  'home_promo_cards',
  {
    id: text('id').primaryKey(),
    slotNumber: integer('slot_number').notNull().unique(), // 1, 2, 3, or 4
    imageUrl: text('image_url').notNull(),
    label: text('label').notNull(), // e.g., "50% OFF RENTAL"
    title: text('title').notNull(),
    link: text('link').notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('home_promo_cards_slot_number_idx').on(table.slotNumber),
    index('home_promo_cards_is_active_idx').on(table.isActive),
  ],
)
