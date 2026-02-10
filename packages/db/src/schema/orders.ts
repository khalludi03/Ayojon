import { pgTable, text, timestamp, numeric, index, integer } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { vendors } from "./catalog";
import { products } from "./products";
import { relations } from "drizzle-orm";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "returned";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export const orders = pgTable(
  "orders",
  {
    id: text("id").primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    
    // Status
    status: text("status").$type<OrderStatus>().default("pending").notNull(),
    paymentStatus: text("payment_status").$type<PaymentStatus>().default("pending").notNull(),
    
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
    paymentMethod: text("payment_method").notNull(),
    paymentTransactionId: text("payment_transaction_id"),
    
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
