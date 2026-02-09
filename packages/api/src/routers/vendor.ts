import { z } from "zod";
import { protectedProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { vendorApplications, user, vendors, orders, products } from "@my-better-t-app/db/schema/index";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ORPCError } from "@orpc/server";

export const vendorRouter = os.router({
  getVendorProfile: protectedProcedure
    .route({
      operationId: "getVendorProfile",
      summary: "Get My Vendor Profile",
      description: "Gets the vendor profile for the currently authenticated user.",
      tags: ["Vendor"],
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1);

      return {
        vendor: vendor[0] ?? null,
      };
    }),

  submitVendorApplication: protectedProcedure
    .route({
      operationId: "submitVendorApplication",
      summary: "Submit Vendor Application",
      description: "Submits a new vendor application for the authenticated user.",
      tags: ["Vendor"],
    })
    .input(
      z.object({
        businessName: z.string().optional(),
        businessType: z.string().optional(),
        taxId: z.string().optional(),
        businessPhone: z.string().optional(),
        businessAddress: z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          division: z.string().optional(),
          postalCode: z.string().optional(),
        }).optional(),
        yearsInBusiness: z.coerce.number().optional(),
        storeName: z.string().optional(),
        storeDescription: z.string().optional(),
        productCategories: z.array(z.string()).optional(),
        logoUrl: z.string().optional(),
        bannerUrl: z.string().optional(),
        tradeLicenseUrl: z.string().optional(),
        identificationUrl: z.string().optional(),
        bankDetailsUrl: z.string().optional(),
      })
    )
    .output(
      z.object({
        applicationId: z.string(),
        status: z.string(),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      // Check for existing pending application
      const existing = await db
        .select()
        .from(vendorApplications)
        .where(
          and(
            eq(vendorApplications.userId, userId),
            eq(vendorApplications.status, "pending")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new ORPCError("CONFLICT", {
          message: "You already have a pending application.",
        });
      }

      const applicationId = nanoid();

      await db.transaction(async (tx) => {
        // Create application
        await tx.insert(vendorApplications).values({
          id: applicationId,
          userId,
          businessName: input.businessName || "Unknown",
          businessType: (input.businessType as any) || "individual",
          taxId: input.taxId || "Unknown",
          businessPhone: input.businessPhone || "Unknown",
          businessAddress: JSON.stringify(input.businessAddress || {}),
          yearsInBusiness: input.yearsInBusiness || 0,
          storeName: input.storeName || "Unknown Store",
          storeDescription: input.storeDescription,
          productCategories: JSON.stringify(input.productCategories || []),
          logoUrl: input.logoUrl,
          bannerUrl: input.bannerUrl,
          tradeLicenseUrl: input.tradeLicenseUrl,
          identificationUrl: input.identificationUrl,
          bankDetailsUrl: input.bankDetailsUrl,
          status: "pending",
        });

        // Update user status
        await tx
          .update(user)
          .set({
            vendorStatus: "pending",
          })
          .where(eq(user.id, userId));
      });

      return {
        applicationId,
        status: "pending",
      };
    }),

  getVendorApplicationStatus: protectedProcedure
    .route({
      operationId: "getVendorApplicationStatus",
      summary: "Get Vendor Application Status",
      description: "Gets the status of the current user's vendor application.",
      tags: ["Vendor"],
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      const application = await db
        .select()
        .from(vendorApplications)
        .where(eq(vendorApplications.userId, userId))
        .orderBy(desc(vendorApplications.submittedAt))
        .limit(1);

      return {
        application: application[0] ?? null,
      };
    }),

  updateVendorProfile: protectedProcedure
    .route({
      operationId: "updateVendorProfile",
      summary: "Update Vendor Profile",
      description: "Allows a vendor to update their store profile information.",
      tags: ["Vendor"],
    })
    .input(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        logoUrl: z.string().optional().nullable(),
        bannerUrl: z.string().optional().nullable(),
        location: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      // Get current vendor profile
      const [currentVendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1);

      if (!currentVendor) {
        throw new ORPCError("NOT_FOUND", {
          message: "Vendor profile not found.",
        });
      }

      // Helper function to extract S3 key from URL
      const extractS3Key = (url: string | null): string | null => {
        if (!url) return null;

        // Match everything after '/images/' until a '?' or end of string
        // This correctly captures 'USER_ID/path/to/file'
        const match = url.match(/\/images\/(.+?)(?:\?|$)/);
        if (match) {
          return match[1];
        }
        
        // Fallback for raw keys or non-URL strings
        if (url.includes('/') && !url.startsWith('http')) return url;
        
        return null;
      };

      // Collect files to delete
      const filesToDelete: string[] = [];

      // Check if logo is being replaced or removed
      if (input.logoUrl !== undefined) {
        const oldLogoKey = extractS3Key(currentVendor.logoUrl);
        const newLogoKey = extractS3Key(input.logoUrl);

        // If we have an old key and either:
        // 1. A new key is provided that's different
        // 2. The input is explicitly null (deletion)
        if (oldLogoKey && (oldLogoKey !== newLogoKey || input.logoUrl === null)) {
          filesToDelete.push(oldLogoKey);
        }
      }

      // Check if banner is being replaced or removed
      if (input.bannerUrl !== undefined) {
        const oldBannerKey = extractS3Key(currentVendor.bannerUrl);
        const newBannerKey = extractS3Key(input.bannerUrl);

        if (oldBannerKey && (oldBannerKey !== newBannerKey || input.bannerUrl === null)) {
          filesToDelete.push(oldBannerKey);
        }
      }

      // Delete old files from S3
      const deletedFiles: string[] = [];
      for (const fileKey of filesToDelete) {
        try {
          await context.storage.deleteFile(fileKey);
          deletedFiles.push(fileKey);
          console.log(`[Vendor Update] Deleted old file: ${fileKey}`);
        } catch (error) {
          console.error(`[Vendor Update] Failed to delete file ${fileKey}:`, error);
          // Continue even if deletion fails
        }
      }

      // Build update object with only provided fields
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.logoUrl !== undefined) updateData.logoUrl = input.logoUrl;
      if (input.bannerUrl !== undefined) updateData.bannerUrl = input.bannerUrl;
      if (input.location !== undefined) updateData.location = input.location;
      if (input.address !== undefined) updateData.address = input.address;
      if (input.phone !== undefined) updateData.phone = input.phone;
      if (input.email !== undefined) updateData.email = input.email;
      if (input.website !== undefined) updateData.website = input.website;

      // Update vendor profile
      const updated = await db
        .update(vendors)
        .set(updateData)
        .where(eq(vendors.userId, userId))
        .returning();

      return {
        success: true,
        vendor: updated[0],
        deletedFiles: deletedFiles.length > 0 ? deletedFiles : undefined,
      };
    }),

  getDashboardStats: protectedProcedure
    .route({
      operationId: "getVendorDashboardStats",
      summary: "Get Vendor Dashboard Statistics",
      description: "Get KPI metrics for the vendor dashboard including revenue, orders, and ratings.",
      tags: ["Vendor"],
    })
    .output(
      z.object({
        totalRevenue: z.string(),
        ordersThisMonth: z.number(),
        activeRentals: z.number(),
        pendingOrders: z.number(),
        storeRating: z.number(),
        storeViews: z.number(),
        revenueGrowth: z.number().optional(),
        ordersGrowth: z.number().optional(),
      })
    )
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      // Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1);

      if (!vendor) {
        return {
          totalRevenue: "0",
          ordersThisMonth: 0,
          activeRentals: 0,
          pendingOrders: 0,
          storeRating: 0,
          storeViews: 0,
        };
      }

      const vendorId = vendor.id;

      // Get vendor products
      const vendorProducts = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.vendorId, vendorId));

      const productIds = vendorProducts.map((p) => p.id);

      if (productIds.length === 0) {
        return {
          totalRevenue: "0",
          ordersThisMonth: 0,
          activeRentals: 0,
          pendingOrders: 0,
          storeRating: 0,
          storeViews: 0, // TODO: Implement view tracking
        };
      }

      // Get all orders (simplified - in real app you'd join with order_items)
      // For now, return placeholder data since we need proper order-product relationship
      const allOrders = await db
        .select()
        .from(orders)
        .where(eq(orders.status, "delivered"));

      const totalRevenue = allOrders.reduce(
        (sum, order) => sum + parseFloat(order.total),
        0
      );

      // Get orders this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthOrders = await db
        .select()
        .from(orders)
        .where(gte(orders.createdAt, startOfMonth));

      // Get pending orders
      const pendingOrdersResult = await db
        .select()
        .from(orders)
        .where(eq(orders.status, "pending"));

      // Get active/shipped orders (active rentals)
      const activeOrders = await db
        .select()
        .from(orders)
        .where(
          and(
            sql`${orders.status} IN ('processing', 'shipped')`
          )
        );

      return {
        totalRevenue: totalRevenue.toFixed(2),
        ordersThisMonth: thisMonthOrders.length,
        activeRentals: activeOrders.length,
        pendingOrders: pendingOrdersResult.length,
        storeRating: 0, // TODO: Calculate from reviews table when implemented
        storeViews: 0, // TODO: Implement view tracking
      };
    }),

  getRevenueData: protectedProcedure
    .route({
      operationId: "getVendorRevenueData",
      summary: "Get Vendor Revenue Chart Data",
      description: "Get daily revenue data for the last 30 days for chart visualization.",
      tags: ["Vendor"],
    })
    .output(
      z.array(
        z.object({
          date: z.string(),
          revenue: z.number(),
        })
      )
    )
    .handler(async ({ context }) => {
      const userId = context.session.user.id;

      // Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1);

      if (!vendor) {
        // Return 30 days of zero data
        const data = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          data.push({
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            revenue: 0,
          });
        }
        return data;
      }

      // Get orders from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentOrders = await db
        .select({
          createdAt: orders.createdAt,
          total: orders.total,
          status: orders.status,
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, thirtyDaysAgo),
            eq(orders.status, "delivered")
          )
        );

      // Group by date
      const revenueByDate = new Map<string, number>();
      const today = new Date();

      // Initialize all 30 days with 0
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        revenueByDate.set(key, 0);
      }

      // Add actual revenue
      recentOrders.forEach((order) => {
        const date = new Date(order.createdAt);
        const key = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const current = revenueByDate.get(key) || 0;
        revenueByDate.set(key, current + parseFloat(order.total));
      });

      // Convert to array
      return Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
        date,
        revenue,
      }));
    }),

  getRecentOrders: protectedProcedure
    .route({
      operationId: "getVendorRecentOrders",
      summary: "Get Recent Vendor Orders",
      description: "Get the most recent orders for the vendor dashboard.",
      tags: ["Vendor"],
    })
    .input(
      z.object({
        limit: z.coerce.number().int().min(1).max(50).default(10),
      })
    )
    .output(
      z.array(
        z.object({
          id: z.string(),
          orderNumber: z.string(),
          customerName: z.string(),
          items: z.number(),
          total: z.string(),
          status: z.string(),
          date: z.string(),
        })
      )
    )
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id;

      // Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1);

      if (!vendor) {
        return [];
      }

      // Get recent orders
      const recentOrders = await db
        .select({
          id: orders.id,
          userId: orders.userId,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(input.limit);

      // Get user details for each order
      const ordersWithUserDetails = await Promise.all(
        recentOrders.map(async (order) => {
          const [orderUser] = await db
            .select({
              name: user.name,
            })
            .from(user)
            .where(eq(user.id, order.userId))
            .limit(1);

          return {
            id: order.id,
            orderNumber: `ORD-${order.id.slice(0, 8).toUpperCase()}`,
            customerName: orderUser?.name || "Unknown",
            items: 1, // TODO: Count from order_items when implemented
            total: order.total,
            status: order.status,
            date: order.createdAt.toISOString(),
          };
        })
      );

      return ordersWithUserDetails;
    }),

  getNotifications: protectedProcedure
    .route({
      operationId: "getVendorNotifications",
      summary: "Get Vendor Notifications",
      description: "Get recent notifications for the vendor.",
      tags: ["Vendor"],
    })
    .output(
      z.array(
        z.object({
          id: z.string(),
          type: z.enum(["order", "return", "stock"]),
          title: z.string(),
          description: z.string(),
          time: z.string(),
          unread: z.boolean(),
        })
      )
    )
    .handler(async () => {
      // TODO: Implement notifications table and logic
      // For now, return empty array
      return [];
    }),
});
