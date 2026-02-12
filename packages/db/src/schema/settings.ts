import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const platformSettings = pgTable("platform_settings", {
  id: text("id").primaryKey(), // Usually just 'current'
  
  // General Settings
  platformName: text("platform_name").default("Ayojon").notNull(),
  contactEmail: text("contact_email").notNull(),
  supportPhone: text("support_phone").notNull(),
  platformCommission: integer("platform_commission").default(10).notNull(), // Percentage
  
  // Deal Settings
  flashDealEndsAt: timestamp("flash_deal_ends_at"),

  // Shipping Settings
  freeShippingThreshold: integer("free_shipping_threshold").default(2000).notNull(),
  insideDhakaRate: integer("inside_dhaka_rate").default(60).notNull(),
  outsideDhakaRate: integer("outside_dhaka_rate").default(120).notNull(),
  
  // Feature Toggles
  enableGuestCheckout: boolean("enable_guest_checkout").default(true).notNull(),
  enableVendorRegistration: boolean("enable_vendor_registration").default(true).notNull(),
  isMaintenanceMode: boolean("is_maintenance_mode").default(false).notNull(),
  
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
