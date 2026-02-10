import { pgTable, text, timestamp, numeric, index, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { vendors } from "./catalog";
import { products } from "./products";
import { relations } from "drizzle-orm";

/**
 * Order Status Flow
 *
 * bKash Prepaid Flow:
 * awaiting_payment → payment_submitted → payment_received → shipped → delivered → vendor_paid
 *
 * Cash on Delivery (COD) Flow:
 * placed → shipped → cash_collected → settlement_ready → vendor_settled
 *
 * Both flows can transition to 'cancelled' at any point before delivery
 */
export type OrderStatus =
  // bKash flow statuses
  | "awaiting_payment"    // Order created, awaiting bKash payment from customer
  | "payment_submitted"   // Customer submitted bKash transaction ID
  | "payment_received"    // Admin verified payment, ready for fulfillment
  | "payment_rejected"    // Admin rejected payment details
  // COD flow statuses
  | "placed"             // COD order placed, ready for fulfillment
  // Common statuses
  | "shipped"            // Vendor marked as shipped (both flows)
  | "delivered"          // Order delivered to customer (bKash flow)
  | "cash_collected"     // Cash collected from customer (COD flow)
  | "settlement_ready"   // Ready for vendor payout (COD flow)
  | "vendor_paid"        // Vendor paid (bKash flow)
  | "vendor_settled"     // Vendor paid (COD flow)
  | "cancelled";         // Order cancelled

export type PaymentMethod = "bkash" | "cod" | "nagad" | "card";

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    
    // Status
    status: text("status").$type<OrderStatus>().notNull(),
    
    // Totals
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    shippingCost: numeric("shipping_cost", { precision: 12, scale: 2 }).notNull().default("0"),
    tax: numeric("tax", { precision: 12, scale: 2 }).notNull().default("0"),
    discount: numeric("discount", { precision: 12, scale: 2 }).notNull().default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    
    // Shipping Address (Snapshot at time of order)
    shippingName: text("shipping_name").notNull(),
    shippingPhone: text("shipping_phone").notNull(),
    shippingAddressLine1: text("shipping_address_line1").notNull(),
    shippingAddressLine2: text("shipping_address_line2"),
    shippingCity: text("shipping_city").notNull(),
    shippingDivision: text("shipping_division").notNull(),
    shippingPostalCode: text("shipping_postal_code").notNull(),
    
    // Delivery
    deliveryMethod: text("delivery_method"),
    trackingNumber: text("tracking_number"),
    
    // Payment
    paymentMethod: text("payment_method").$type<PaymentMethod>().notNull(),
    paymentTransactionId: text("payment_transaction_id"), // bKash transaction ID
    
    // Notes
    customerNote: text("customer_note"),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("orders_user_id_idx").on(table.userId),
    index("orders_status_idx").on(table.status),
    index("orders_order_number_idx").on(table.orderNumber),
  ]
);

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    vendorId: text("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),
    
    // Snapshot at time of order
    title: text("title").notNull(),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    variantInfo: text("variant_info"), // JSON string of selected variants
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("order_items_order_id_idx").on(table.orderId),
    index("order_items_product_id_idx").on(table.productId),
    index("order_items_vendor_id_idx").on(table.vendorId),
  ]
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, {
    fields: [orders.userId],
    references: [user.id],
  }),
  items: many(orderItems),
  payments: many(payments),
  payouts: many(vendorPayouts),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  vendor: one(vendors, {
    fields: [orderItems.vendorId],
    references: [vendors.id],
  }),
}));

/**
 * Payment Tracking Table
 *
 * Tracks payment submissions and admin verification for both bKash and COD orders.
 * For bKash: Customer submits transaction ID, admin verifies
 * For COD: Payment recorded when cash is collected on delivery
 */
export type PaymentStatus = "pending" | "submitted" | "verified" | "rejected";

export const payments = pgTable(
  "payments",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),

    // Payment Details
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    method: text("method").$type<PaymentMethod>().notNull(),
    status: text("status").$type<PaymentStatus>().default("pending").notNull(),

    // bKash/Mobile specific
    transactionId: text("transaction_id"), // Customer-submitted bKash transaction ID
    senderMobile: text("sender_mobile"),   // Mobile number used to send payment

    // COD specific
    collectionProof: text("collection_proof"), // Optional proof of cash collection (image URL)

    // Admin Verification
    verifiedBy: text("verified_by").references(() => user.id, { onDelete: "set null" }),
    verifiedAt: timestamp("verified_at"),
    rejectionReason: text("rejection_reason"),

    // Notes
    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("payments_order_id_idx").on(table.orderId),
    index("payments_status_idx").on(table.status),
  ]
);

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
  verifier: one(user, {
    fields: [payments.verifiedBy],
    references: [user.id],
  }),
}));

/**
 * Vendor Payout Table
 *
 * Tracks payments to vendors after order completion.
 * Admin manually processes payouts after:
 * - bKash: Order is delivered
 * - COD: Cash is collected and settlement is ready
 *
 * Amount is calculated as: order amount - platform commission
 */
export type PayoutStatus = "pending" | "processing" | "completed" | "failed";

export const vendorPayouts = pgTable(
  "vendor_payouts",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    vendorId: text("vendor_id")
      .notNull()
      .references(() => vendors.id, { onDelete: "restrict" }),

    // Payout Details
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(), // Amount after commission
    platformCommission: numeric("platform_commission", { precision: 12, scale: 2 }).notNull(),
    status: text("status").$type<PayoutStatus>().default("pending").notNull(),

    // Payment Details
    paymentMethod: text("payment_method"), // e.g., "bank_transfer", "bkash", "nagad"
    paymentReference: text("payment_reference"), // Transaction ID or reference number

    // Admin Processing
    processedBy: text("processed_by").references(() => user.id, { onDelete: "set null" }),
    processedAt: timestamp("processed_at"),
    failureReason: text("failure_reason"),

    // Notes
    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("vendor_payouts_order_id_idx").on(table.orderId),
    index("vendor_payouts_vendor_id_idx").on(table.vendorId),
    index("vendor_payouts_status_idx").on(table.status),
  ]
);

export const vendorPayoutsRelations = relations(vendorPayouts, ({ one }) => ({
  order: one(orders, {
    fields: [vendorPayouts.orderId],
    references: [orders.id],
  }),
  vendor: one(vendors, {
    fields: [vendorPayouts.vendorId],
    references: [vendors.id],
  }),
  processor: one(user, {
    fields: [vendorPayouts.processedBy],
    references: [user.id],
  }),
}));
