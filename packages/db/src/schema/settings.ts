import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export type CouponType = 'percentage' | 'fixed' | 'free_shipping'
export type CouponStatus = 'active' | 'expired' | 'disabled'

export const coupons = pgTable(
  'coupons',
  {
    id: text('id').primaryKey(),
    code: text('code').notNull().unique(),
    type: text('type').$type<CouponType>().notNull(),
    value: numeric('value', { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: numeric('min_order_amount', { precision: 12, scale: 2 }),
    maxDiscountAmount: numeric('max_discount_amount', {
      precision: 10,
      scale: 2,
    }),
    usageLimit: integer('usage_limit'),
    usageCount: integer('usage_count').default(0).notNull(),
    status: text('status').$type<CouponStatus>().default('active').notNull(),
    startsAt: timestamp('starts_at'),
    endsAt: timestamp('ends_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('coupons_code_idx').on(table.code),
    index('coupons_status_idx').on(table.status),
    index('coupons_ends_at_idx').on(table.endsAt),
  ],
)

export const platformSettings = pgTable('platform_settings', {
  id: text('id').primaryKey(), // Usually just 'current'

  // General Settings
  platformName: text('platform_name').default('Ayojon').notNull(),
  contactEmail: text('contact_email').notNull(),
  supportPhone: text('support_phone').notNull(),
  platformCommission: integer('platform_commission').default(10).notNull(), // Percentage

  // Deal Settings
  flashDealEndsAt: timestamp('flash_deal_ends_at'),

  // Shipping Settings
  freeShippingThreshold: integer('free_shipping_threshold')
    .default(2000)
    .notNull(),
  insideDhakaRate: integer('inside_dhaka_rate').default(60).notNull(),
  outsideDhakaRate: integer('outside_dhaka_rate').default(120).notNull(),

  // Feature Toggles
  enableGuestCheckout: boolean('enable_guest_checkout').default(true).notNull(),
  enableVendorRegistration: boolean('enable_vendor_registration')
    .default(true)
    .notNull(),
  isMaintenanceMode: boolean('is_maintenance_mode').default(false).notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
