import {
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'
import { user } from './auth'
import { orders } from './orders'
import { vendorApplications } from './catalog'

export const notificationTypes = [
  // Customer notifications
  'order_placed',
  'order_confirmed',
  'order_shipped',
  'order_delivered',
  'payment_received',
  'payment_rejected',
  // Vendor notifications
  'vendor_approved',
  'vendor_rejected',
  'new_order',
  'order_status_updated',
  'low_stock_alert',
  'out_of_stock_alert',
  'return_request',
  'payout_processed',
  'product_review',
] as const

export type NotificationType = (typeof notificationTypes)[number]

export const notifications = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type', { enum: notificationTypes }).notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    orderId: text('order_id').references(() => orders.id, {
      onDelete: 'cascade',
    }),
    vendorApplicationId: text('vendor_application_id').references(
      () => vendorApplications.id,
      { onDelete: 'cascade' },
    ),
    metadata: jsonb('metadata').$type<Record<string, any>>(),
    isRead: boolean('is_read').notNull().default(false),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),
    index('notifications_user_id_is_read_idx').on(table.userId, table.isRead),
    index('notifications_created_at_idx').on(table.createdAt),
  ],
)

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
