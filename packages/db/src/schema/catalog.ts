import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// =============================================================================
// CATEGORIES
// =============================================================================

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(), // CategoryIconName
  description: text("description"),
  imageUrl: text("image_url"),
  productCount: integer("product_count").default(0).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// =============================================================================
// SUBCATEGORIES
// =============================================================================

export const subcategories = pgTable(
  "subcategories",
  {
    id: text("id").primaryKey(),
    parentId: text("parent_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    imageUrl: text("image_url"),
    productCount: integer("product_count").default(0).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("subcategories_parent_id_idx").on(table.parentId)],
);

// =============================================================================
// EVENT TYPES
// =============================================================================

export const eventTypes = pgTable("event_types", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  iconUrl: text("icon_url"),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// =============================================================================
// VENDORS
// =============================================================================

export type VendorLocation =
  | "Dhaka"
  | "Chittagong"
  | "Sylhet"
  | "Rajshahi"
  | "Khulna";

export const vendors = pgTable(
  "vendors",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    logoUrl: text("logo_url"),
    bannerUrl: text("banner_url"),
    location: text("location").$type<VendorLocation>().notNull(),
    address: text("address"),
    phone: text("phone"),
    email: text("email"),
    website: text("website"),
    isVerified: boolean("is_verified").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ratingAverage: numeric("rating_average", { precision: 2, scale: 1, mode: "number" }).default(0),
    ratingCount: integer("rating_count").default(0).notNull(),
    productCount: integer("product_count").default(0).notNull(),
    totalSales: integer("total_sales").default(0).notNull(),
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("vendors_user_id_idx").on(table.userId),
    index("vendors_slug_idx").on(table.slug),
    index("vendors_location_idx").on(table.location),
    index("vendors_is_verified_idx").on(table.isVerified),
  ],
);

// =============================================================================
// VENDOR APPLICATIONS
// =============================================================================

export const vendorApplications = pgTable(
  "vendor_applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    // Business Information
    businessName: text("business_name").notNull(),
    businessType: text("business_type", {
      enum: ["individual", "company", "enterprise"],
    }).notNull(),
    taxId: text("tax_id").notNull(),
    businessPhone: text("business_phone").notNull(),
    businessAddress: text("business_address").notNull(), // JSON string
    yearsInBusiness: integer("years_in_business").notNull(),

    // Store Details
    storeName: text("store_name").notNull(),
    storeDescription: text("store_description"),
    productCategories: text("product_categories").notNull(), // JSON array

    // File URLs (after S3 upload)
    logoUrl: text("logo_url"),
    bannerUrl: text("banner_url"),
    tradeLicenseUrl: text("trade_license_url"),
    identificationUrl: text("identification_url"),
    bankDetailsUrl: text("bank_details_url"),

    // Application Status
    status: text("status", {
      enum: ["pending", "approved", "rejected"],
    })
      .default("pending")
      .notNull(),

    // Timestamps & Review
    submittedAt: timestamp("submitted_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
    reviewedBy: text("reviewed_by").references(() => user.id),
    rejectionReason: text("rejection_reason"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("vendor_applications_user_id_idx").on(table.userId),
    index("vendor_applications_status_idx").on(table.status),
  ],
);

// =============================================================================
// RELATIONS
// =============================================================================

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
}));

export const subcategoriesRelations = relations(subcategories, ({ one }) => ({
  parent: one(categories, {
    fields: [subcategories.parentId],
    references: [categories.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ one }) => ({
  user: one(user, {
    fields: [vendors.userId],
    references: [user.id],
  }),
}));

export const vendorApplicationsRelations = relations(
  vendorApplications,
  ({ one }) => ({
    user: one(user, {
      fields: [vendorApplications.userId],
      references: [user.id],
    }),
    reviewer: one(user, {
      fields: [vendorApplications.reviewedBy],
      references: [user.id],
    }),
  }),
);
