import { z } from "zod";
import { adminProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import {
  user,
  vendors,
  products,
  orders,
  platformSettings,
  productImages,
  categories
} from "@my-better-t-app/db/schema/index";
import { count, eq, gte, sql, or, ilike, and, desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

export const adminRouter = os.router({
  listUsers: adminProcedure
    .route({
      method: "POST",
      operationId: "listUsers",
      summary: "List Users",
      description: "Lists users with search, pagination and role filtering.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["customer", "vendor", "admin"]).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      })
    )
    .handler(async ({ input }) => {
      const conditions = [];
      if (input.role) conditions.push(eq(user.role, input.role));
      if (input.search) {
        conditions.push(or(
          ilike(user.name, `%${input.search}%`),
          ilike(user.email, `%${input.search}%`)
        ));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const users = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorStatus: user.vendorStatus,
          isDeactivated: user.isDeactivated,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(where)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(user.createdAt));

      const [totalCount] = await db
        .select({ value: count() })
        .from(user)
        .where(where);

      return {
        users,
        totalCount: totalCount?.value ?? 0,
      };
    }),

  getUserDetails: adminProcedure
    .route({
      method: "POST",
      operationId: "getUserDetails",
      summary: "Get User Details",
      description: "Returns detailed information about a specific user.",
      tags: ["Admin"],
    })
    .input(z.any())
    .handler(async ({ input }) => {
      const userData = await db
        .select()
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!userData[0]) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      const [orderCount] = await db
        .select({ value: count() })
        .from(orders)
        .where(eq(orders.userId, input.id));

      return {
        user: userData[0],
        stats: {
          totalOrders: orderCount?.value ?? 0,
        }
      };
    }),

  updateUser: adminProcedure
    .route({
      method: "PATCH",
      operationId: "updateUser",
      summary: "Update User",
      description: "Updates user role or suspension status.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["customer", "vendor", "admin"]).optional(),
        isDeactivated: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const result = await db
        .update(user)
        .set({
          role: input.role,
          isDeactivated: input.isDeactivated,
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      return result[0];
    }),

  deleteUser: adminProcedure
    .route({
      method: "DELETE",
      operationId: "deleteUser",
      summary: "Delete User",
      description: "Deletes a user account permanently.",
      tags: ["Admin"],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const result = await db
        .delete(user)
        .where(eq(user.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      return { success: true };
    }),

  listVendors: adminProcedure
    .route({
      method: "POST",
      operationId: "listVendors",
      summary: "List Vendors",
      description: "Lists vendors with search, pagination and status filtering.",
      tags: ["Admin"],
    })
    .input(z.any())
    .handler(async ({ input }) => {
      const conditions = [];
      const parsedInput = input || {};
      if (parsedInput.search) {
        conditions.push(or(
          ilike(vendors.name, `%${parsedInput.search}%`),
          ilike(user.email, `%${parsedInput.search}%`)
        ));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const vendorList = await db
        .select({
          id: vendors.id,
          name: vendors.name,
          slug: vendors.slug,
          ownerEmail: user.email,
          productCount: vendors.productCount,
          isActive: vendors.isActive,
          isVerified: vendors.isVerified,
          joinedAt: vendors.joinedAt,
        })
        .from(vendors)
        .innerJoin(user, eq(vendors.userId, user.id))
        .where(where)
        .limit(parsedInput.limit || 50)
        .offset(parsedInput.offset || 0)
        .orderBy(desc(vendors.joinedAt));

      const [totalCount] = await db
        .select({ value: count() })
        .from(vendors)
        .innerJoin(user, eq(vendors.userId, user.id))
        .where(where);

      return {
        vendors: vendorList,
        totalCount: totalCount?.value ?? 0,
      };
    }),

  getVendorDetails: adminProcedure
    .route({
      method: "POST",
      operationId: "getVendorDetails",
      summary: "Get Vendor Details",
      description: "Returns detailed information about a specific vendor.",
      tags: ["Admin"],
    })
    .input(z.any())
    .handler(async ({ input }) => {
      const vendorData = await db
        .select()
        .from(vendors)
        .where(eq(vendors.id, input.id))
        .limit(1);

      if (!vendorData[0]) {
        throw new ORPCError("NOT_FOUND", { message: "Vendor not found" });
      }

      const userData = await db
        .select({
          name: user.name,
          email: user.email,
        })
        .from(user)
        .where(eq(user.id, vendorData[0].userId))
        .limit(1);

      return {
        vendor: vendorData[0],
        owner: userData[0] ?? null,
      };
    }),

  updateVendor: adminProcedure
    .route({
      method: "PATCH",
      operationId: "updateVendor",
      summary: "Update Vendor",
      description: "Updates vendor status or verification.",
      tags: ["Admin"],
    })
    .input(z.any())
    .handler(async ({ input }) => {
      const result = await db
        .update(vendors)
        .set({
          isActive: input.isActive,
          isVerified: input.isVerified,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Vendor not found" });
      }

      return result[0];
    }),

  updateVendorApplicationStatus: adminProcedure
    .route({
      method: "PATCH",
      operationId: "updateVendorApplicationStatus",
      summary: "Approve/Reject Vendor Application",
      description: "Updates vendor application status (approve, reject, suspend).",
      tags: ["Admin"],
    })
    .input(
      z.object({
        userId: z.string(),
        vendorStatus: z.enum(["approved", "rejected", "suspended"]),
        reason: z.string().optional(),
      })
    )
    .handler(async ({ input }) => {
      // Update user vendor status
      const result = await db
        .update(user)
        .set({
          vendorStatus: input.vendorStatus,
          role: input.vendorStatus === "approved" ? "vendor" : "customer",
          updatedAt: new Date(),
        })
        .where(eq(user.id, input.userId))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      console.log(
        `[Admin Action] Vendor application ${input.vendorStatus} for user ${input.userId}${input.reason ? `. Reason: ${input.reason}` : ""}`
      );

      return result[0];
    }),

  listPendingVendors: adminProcedure
    .route({
      method: "POST",
      operationId: "listPendingVendors",
      summary: "List Pending Vendor Applications",
      description: "Lists all pending vendor applications awaiting approval.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      })
    )
    .handler(async ({ input }) => {
      const pendingUsers = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          vendorStatus: user.vendorStatus,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.vendorStatus, "pending"))
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(user.createdAt));

      const [totalCount] = await db
        .select({ value: count() })
        .from(user)
        .where(eq(user.vendorStatus, "pending"));

      return {
        applications: pendingUsers,
        totalCount: totalCount?.value ?? 0,
      };
    }),

  deleteVendor: adminProcedure
    .route({
      method: "DELETE",
      operationId: "deleteVendor",
      summary: "Delete Vendor",
      description: "Deletes a vendor profile permanently. User account remains but role is reverted.",
      tags: ["Admin"],
    })
    .input(z.any())
    .handler(async ({ input }) => {
      const result = await db.transaction(async (tx) => {
        const vendorRecord = await tx
          .select({ userId: vendors.userId })
          .from(vendors)
          .where(eq(vendors.id, input.id))
          .limit(1);

        if (vendorRecord.length === 0) {
          throw new ORPCError("NOT_FOUND", { message: "Vendor not found" });
        }

        await tx
          .update(user)
          .set({ 
            role: "customer",
            vendorStatus: "none"
          } as any)
          .where(eq(user.id, vendorRecord[0]!.userId));

        return await tx
          .delete(vendors)
          .where(eq(vendors.id, input.id))
          .returning();
      });

      return { success: true };
    }),

  listAllProducts: adminProcedure
    .route({
      method: "POST",
      operationId: "listAllProducts",
      summary: "List All Products",
      description: "Lists all products across the platform with advanced filtering.",
      tags: ["Admin"],
    })
    .input(z.any())
    .handler(async ({ input }) => {
      const parsedInput = input || {};
      const conditions = [];
      if (parsedInput.vendorId) conditions.push(eq(products.vendorId, parsedInput.vendorId));
      if (parsedInput.categoryId) conditions.push(eq(products.categoryId, parsedInput.categoryId));
      if (parsedInput.search) {
        conditions.push(or(
          ilike(products.title, `%${parsedInput.search}%`),
          ilike(vendors.name, `%${parsedInput.search}%`)
        ));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const productList = await db
        .select({
          id: products.id,
          title: products.title,
          slug: products.slug,
          price: products.price,
          status: products.status,
          createdAt: products.createdAt,
          vendorName: vendors.name,
          categoryName: categories.name,
          thumbnail: sql<string>`(SELECT url FROM ${productImages} WHERE product_id = ${products.id} AND is_primary = true LIMIT 1)`,
        })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(where)
        .limit(parsedInput.limit || 50)
        .offset(parsedInput.offset || 0)
        .orderBy(desc(products.createdAt));

      const [totalCount] = await db
        .select({ value: count() })
        .from(products)
        .leftJoin(vendors, eq(products.vendorId, vendors.id))
        .where(where);

      return {
        products: productList,
        totalCount: totalCount?.value ?? 0,
      };
    }),

  adminDeleteProduct: adminProcedure
    .route({
      method: "DELETE",
      operationId: "adminDeleteProduct",
      summary: "Remove Product (Admin)",
      description: "Admin action to remove a product listing for violations.",
      tags: ["Admin"],
    })
    .input(z.object({ 
      id: z.string(),
      reason: z.string()
    }))
    .handler(async ({ input }) => {
      const result = await db
        .delete(products)
        .where(eq(products.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      console.log(`[Admin Notice] Product ${input.id} removed. Reason: ${input.reason}`);

      return { success: true };
    }),

  getPlatformSettings: adminProcedure
    .route({
      method: "POST",
      operationId: "getPlatformSettings",
      summary: "Get Platform Settings",
      description: "Returns current platform configuration.",
      tags: ["Admin"],
    })
    .handler(async () => {
      const settings = await db
        .select()
        .from(platformSettings)
        .where(eq(platformSettings.id, "current"))
        .limit(1);

      return settings[0] ?? null;
    }),

  updatePlatformSettings: adminProcedure
    .route({
      method: "PATCH",
      operationId: "updatePlatformSettings",
      summary: "Update Platform Settings",
      description: "Updates global platform configuration.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        platformName: z.string().optional(),
        contactEmail: z.string().email().optional(),
        supportPhone: z.string().optional(),
        platformCommission: z.coerce.number().int().min(0).max(100).optional(),
        freeShippingThreshold: z.coerce.number().int().min(0).optional(),
        insideDhakaRate: z.coerce.number().int().min(0).optional(),
        outsideDhakaRate: z.coerce.number().int().min(0).optional(),
        enableGuestCheckout: z.boolean().optional(),
        enableVendorRegistration: z.boolean().optional(),
        isMaintenanceMode: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const result = await db
        .update(platformSettings)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(platformSettings.id, "current"))
        .returning();

      return result[0] ?? null;
    }),

  listOrders: adminProcedure
    .route({
      method: "POST",
      operationId: "listOrders",
      summary: "List All Orders",
      description: "Lists all orders across the platform with search and pagination.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      })
    )
    .handler(async ({ input }) => {
      const conditions = [];
      if (input.status) conditions.push(eq(orders.status, input.status));
      if (input.search) {
        conditions.push(or(
          ilike(user.name, `%${input.search}%`),
          ilike(user.email, `%${input.search}%`),
          ilike(orders.id, `%${input.search}%`)
        ));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const ordersList = await db
        .select({
          id: orders.id,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          userName: user.name,
          userEmail: user.email,
        })
        .from(orders)
        .innerJoin(user, eq(orders.userId, user.id))
        .where(where)
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(orders.createdAt));

      const [totalCount] = await db
        .select({ value: count() })
        .from(orders)
        .innerJoin(user, eq(orders.userId, user.id))
        .where(where);

      return {
        orders: ordersList,
        totalCount: totalCount?.value ?? 0,
      };
    }),

  updateOrderStatus: adminProcedure
    .route({
      method: "PATCH",
      operationId: "updateOrderStatus",
      summary: "Update Order Status",
      description: "Updates the status of an order.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
      })
    )
    .handler(async ({ input }) => {
      const result = await db
        .update(orders)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      }

      return result[0];
    }),

  getPlatformMetrics: adminProcedure
    .route({
      method: "POST",
      operationId: "getPlatformMetrics",
      summary: "Get Platform Metrics",
      description: "Returns basic platform metrics for the admin dashboard.",
      tags: ["Admin"],
    })
    .handler(async () => {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [userCount] = await db.select({ value: count() }).from(user);
      const [vendorCount] = await db.select({ value: count() }).from(vendors);
      const [productCount] = await db.select({ value: count() }).from(products);

      const [monthlyOrderCount] = await db
        .select({ value: count() })
        .from(orders)
        .where(gte(orders.createdAt, firstDayOfMonth));

      const [monthlyRevenue] = await db
        .select({ value: sql<string>`sum(${orders.total})` })
        .from(orders)
        .where(gte(orders.createdAt, firstDayOfMonth));

      const recentOrders = await db
        .select()
        .from(orders)
        .orderBy(sql`${orders.createdAt} DESC`)
        .limit(10);

      const recentUsers = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          role: user.role
        })
        .from(user)
        .orderBy(sql`${user.createdAt} DESC`)
        .limit(10);

      return {
        metrics: {
          totalUsers: userCount?.value ?? 0,
          totalVendors: vendorCount?.value ?? 0,
          totalProducts: productCount???.value ?? 0,
          monthlyOrders: monthlyOrderCount?.value ?? 0,
          monthlyRevenue: parseFloat(monthlyRevenue?.value ?? "0"),
        },
        recentOrders,
        recentUsers,
      };
    }),
});
