import { z } from "zod";
import { adminProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import * as paymentService from "../services/payment-service";
import * as payoutService from "../services/payout-service";
import { notifyVendorApproved, notifyVendorRejected, notifyOrderStatusUpdate } from "../services/notification-service";
import * as orderService from "../services/order-service";
import {
  user,
  vendors,
  products,
  orders,
  payments,
  platformSettings,
  productImages,
  categories,
  vendorApplications,
  homeBanners,
  homePromoCards,
  type VendorLocation,
  type OrderStatus
} from "@my-better-t-app/db/schema/index";
import { count, eq, gte, sql, or, ilike, and, desc, notInArray , asc} from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { nanoid } from "nanoid";

export const adminRouter = os.router({
  listUsers: adminProcedure
    .route({
      method: "POST",
      operationId: "listUsers",
      summary: "List Users",
      description: "Lists users with search, pagination, role and vendor status filtering.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        search: z.string().optional(),
        role: z.enum(["customer", "vendor", "admin"]).optional(),
        vendorStatus: z.enum(["pending", "approved", "rejected", "suspended"]).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      })
    )
    .handler(async ({ input }) => {
      const conditions = [];
      if (input.role) conditions.push(eq(user.role, input.role));
      if (input.vendorStatus) conditions.push(eq(user.vendorStatus, input.vendorStatus));
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
    .input(z.object({
      id: z.string(),
    }))
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
    .input(z.object({
      search: z.string().optional(),
      status: z.enum(['pending', 'approved', 'rejected', 'suspended']).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(50),
      offset: z.coerce.number().int().min(0).default(0),
    }))
    .handler(async ({ input }) => {
      const conditions = [];
      const parsedInput = input;
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
          productCount: sql<number>`(SELECT count(*) FROM ${products} WHERE ${products.vendorId} = ${vendors.id})`.mapWith(Number),
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
    .input(z.object({
      id: z.string(),
    }))
    .handler(async ({ input }) => {
      const vendorData = await db
        .select({
          id: vendors.id,
          userId: vendors.userId,
          name: vendors.name,
          slug: vendors.slug,
          description: vendors.description,
          logoUrl: vendors.logoUrl,
          bannerUrl: vendors.bannerUrl,
          location: vendors.location,
          address: vendors.address,
          phone: vendors.phone,
          email: vendors.email,
          website: vendors.website,
          isVerified: vendors.isVerified,
          isActive: vendors.isActive,
          joinedAt: vendors.joinedAt,
          productCount: sql<number>`(SELECT count(*) FROM ${products} WHERE ${products.vendorId} = ${vendors.id})`.mapWith(Number),
        })
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
    .input(z.object({
      id: z.string(),
      isActive: z.boolean().optional(),
      isVerified: z.boolean().optional(),
    }))
    .handler(async ({ input }) => {
      return await db.transaction(async (tx) => {
        // Update vendor record
        const result = await tx
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

        const vendor = result[0]!;

        // Sync user vendorStatus when isActive changes
        if (input.isActive !== undefined) {
          const newVendorStatus = input.isActive ? "approved" : "suspended";

          await tx
            .update(user)
            .set({
              vendorStatus: newVendorStatus,
              updatedAt: new Date(),
            })
            .where(eq(user.id, vendor.userId));

          console.log(`[Admin Update Vendor] Synced user vendorStatus to "${newVendorStatus}" for vendor ${vendor.name}`);
        }

        return vendor;
      });
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
      try {
        console.log(`[Admin Action] Processing vendor status update to ${input.vendorStatus} for user ${input.userId}`);
        const result = await db.transaction(async (tx) => {
          // Update user vendor status and role
          const updatedUsers = await tx
            .update(user)
            .set({
              vendorStatus: input.vendorStatus,
              role: input.vendorStatus === "approved" ? "vendor" : "customer",
              updatedAt: new Date(),
            })
            .where(eq(user.id, input.userId))
            .returning();

          if (updatedUsers.length === 0) {
            console.error(`[Admin Action] User ${input.userId} not found during status update`);
            throw new ORPCError("NOT_FOUND", { message: "User not found" });
          }

          // If approved, create/update vendor profile from application
          if (input.vendorStatus === "approved") {
            console.log(`[Admin Action] Application approved, looking up application details for user ${input.userId}`);
            // Get the latest application for this user
            const applications = await tx
              .select()
              .from(vendorApplications)
              .where(eq(vendorApplications.userId, input.userId))
              .orderBy(desc(vendorApplications.submittedAt))
              .limit(1);

            if (applications.length > 0) {
              const app = applications[0]!;
              console.log(`[Admin Action] Found application ${app.id}, promoting to vendor`);
              
              // Update application status
              await tx
                .update(vendorApplications)
                .set({
                  status: "approved",
                  reviewedAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(vendorApplications.id, app.id));

              // Generate vendor slug from store name
              const baseSlug = app.storeName
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
              const vendorSlug = `${baseSlug}-${nanoid(4)}`;

              // Parse address JSON to string for vendor table if needed
              let businessAddr = "";
              try {
                if (app.businessAddress.startsWith("{")) {
                  const addr = JSON.parse(app.businessAddress);
                  businessAddr = `${addr.street || ""}, ${addr.city || ""}, ${addr.division || ""} ${addr.postalCode || ""}`;
                } else {
                  businessAddr = app.businessAddress;
                }
              } catch (e) {
                businessAddr = app.businessAddress;
              }

              // Extract division from address for location field if possible
              let location: VendorLocation = "Dhaka";
              try {
                if (app.businessAddress.startsWith("{")) {
                  const addr = JSON.parse(app.businessAddress);
                  if (addr.division) {
                    location = addr.division;
                  }
                }
              } catch (e) {
                // Keep default Dhaka
              }

              // Insert into vendors table
              const vendorId = nanoid();
              console.log(`[Admin Action] Inserting/Updating vendor record with slug ${vendorSlug}`);
              await tx
                .insert(vendors)
                .values({
                  id: vendorId,
                  userId: input.userId,
                  name: app.storeName,
                  slug: vendorSlug,
                  description: app.storeDescription,
                  logoUrl: app.logoUrl,
                  bannerUrl: app.bannerUrl,
                  location: location,
                  address: businessAddr,
                  phone: app.businessPhone,
                  email: updatedUsers[0]!.email,
                  isVerified: true,
                  isActive: true,
                })
                .onConflictDoUpdate({
                  target: vendors.userId,
                  set: {
                    name: app.storeName,
                    description: app.storeDescription,
                    logoUrl: app.logoUrl,
                    bannerUrl: app.bannerUrl,
                    address: businessAddr,
                    phone: app.businessPhone,
                    updatedAt: new Date(),
                  }
                });

              // Notify vendor of approval
              return { 
                user: updatedUsers[0]!, 
                notificationType: 'approved' as const,
                userId: input.userId,
                appId: app.id,
                storeName: app.storeName
              };
            } else {
              console.warn(`[Admin Action] No application found for user ${input.userId}, but status was set to approved.`);
              return { user: updatedUsers[0]!, notificationType: null };
            }
          } else if (input.vendorStatus === "rejected") {
             // Update latest application to rejected
             const rejectedApps = await tx
              .update(vendorApplications)
              .set({
                status: "rejected",
                reviewedAt: new Date(),
                rejectionReason: input.reason,
                updatedAt: new Date(),
              })
              .where(and(
                eq(vendorApplications.userId, input.userId),
                eq(vendorApplications.status, "pending")
              ))
              .returning();

             // Return data for notification
             if (rejectedApps.length > 0) {
               const app = rejectedApps[0]!;
               return { 
                 user: updatedUsers[0]!, 
                 notificationType: 'rejected' as const,
                 userId: input.userId,
                 appId: app.id,
                 storeName: app.storeName,
                 reason: input.reason
               };
             }
             return { user: updatedUsers[0]!, notificationType: null };
          }

          return { user: updatedUsers[0]!, notificationType: null };
        });

        // Send notifications AFTER transaction is committed
        if (result.notificationType === 'approved') {
          try {
            await notifyVendorApproved(result.userId!, result.appId!, result.storeName!);
          } catch (error) {
            console.error("Failed to send vendor approval notification:", error);
          }
        } else if (result.notificationType === 'rejected') {
          try {
            await notifyVendorRejected(result.userId!, result.appId!, result.storeName!, result.reason);
          } catch (error) {
            console.error("Failed to send vendor rejection notification:", error);
          }
        }

        console.log(
          `[Admin Action] Successfully updated vendor status to ${input.vendorStatus} for user ${input.userId}`
        );

        return result.user;
      } catch (error) {
        console.error(`[Admin Action] Error updating vendor status:`, error);
        if (error instanceof ORPCError) throw error;
        throw new ORPCError("INTERNAL_SERVER_ERROR", { 
          message: error instanceof Error ? error.message : "Failed to update vendor application status" 
        });
      }
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

  getVendorApplicationDetails: adminProcedure
    .route({
      method: "POST",
      operationId: "getVendorApplicationDetails",
      summary: "Get Vendor Application Details",
      description: "Get full details of a vendor application including documents.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .handler(async ({ input }) => {
      // Get user information
      const userData = await db
        .select()
        .from(user)
        .where(eq(user.id, input.userId))
        .limit(1);

      if (!userData[0]) {
        throw new ORPCError("NOT_FOUND", { message: "User not found" });
      }

      // Get the latest vendor application for this user
      const applications = await db
        .select()
        .from(vendorApplications)
        .where(eq(vendorApplications.userId, input.userId))
        .orderBy(desc(vendorApplications.submittedAt))
        .limit(1);

      if (!applications[0]) {
        throw new ORPCError("NOT_FOUND", { message: "No vendor application found for this user" });
      }

      const application = applications[0];

      // Parse JSON fields
      let businessAddress = {};
      let productCategories: string[] = [];

      try {
        businessAddress = JSON.parse(application.businessAddress);
      } catch (e) {
        businessAddress = { raw: application.businessAddress };
      }

      try {
        productCategories = JSON.parse(application.productCategories);
      } catch (e) {
        productCategories = [];
      }

      return {
        user: {
          id: userData[0].id,
          name: userData[0].name,
          email: userData[0].email,
          vendorStatus: userData[0].vendorStatus,
        },
        application: {
          id: application.id,
          businessName: application.businessName,
          businessType: application.businessType,
          taxId: application.taxId,
          businessPhone: application.businessPhone,
          businessAddress,
          yearsInBusiness: application.yearsInBusiness,
          storeName: application.storeName,
          storeDescription: application.storeDescription,
          productCategories,
          logoUrl: application.logoUrl,
          bannerUrl: application.bannerUrl,
          tradeLicenseUrl: application.tradeLicenseUrl,
          identificationUrl: application.identificationUrl,
          bankDetailsUrl: application.bankDetailsUrl,
          status: application.status,
          submittedAt: application.submittedAt,
          reviewedAt: application.reviewedAt,
          rejectionReason: application.rejectionReason,
        },
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
    .input(z.object({
      id: z.string(),
    }))
    .handler(async ({ input, context }) => {
      // Helper function to extract S3 key from URL
      const extractS3Key = (url: string | null): string | null => {
        if (!url) return null;

        // Match everything after '/images/' until a '?' or end of string
        const match = url.match(/\/images\/(.+?)(?:\?|$)/);
        if (match) {
          return match[1];
        }
        return null;
      };

      const result = await db.transaction(async (tx) => {
        const vendorRecord = await tx
          .select()
          .from(vendors)
          .where(eq(vendors.id, input.id))
          .limit(1);

        if (vendorRecord.length === 0) {
          throw new ORPCError("NOT_FOUND", { message: "Vendor not found" });
        }

        const vendor = vendorRecord[0]!;

        // Collect S3 files to delete
        const filesToDelete: string[] = [];
        const logoKey = extractS3Key(vendor.logoUrl);
        const bannerKey = extractS3Key(vendor.bannerUrl);

        if (logoKey) filesToDelete.push(logoKey);
        if (bannerKey) filesToDelete.push(bannerKey);

        // Delete files from S3
        const deletedFiles: string[] = [];
        for (const fileKey of filesToDelete) {
          try {
            await context.storage.deleteFile(fileKey);
            deletedFiles.push(fileKey);
            console.log(`[Admin Delete Vendor] Deleted S3 file: ${fileKey}`);
          } catch (error) {
            console.error(`[Admin Delete Vendor] Failed to delete file ${fileKey}:`, error);
            // Continue even if deletion fails
          }
        }

        // Update user role
        await tx
          .update(user)
          .set({
            role: "customer",
            vendorStatus: "none" as const
          })
          .where(eq(user.id, vendor.userId));

        // Delete vendor record
        await tx
          .delete(vendors)
          .where(eq(vendors.id, input.id));

        console.log(`[Admin Delete Vendor] Deleted vendor ${vendor.name} (${input.id}), removed ${deletedFiles.length} files from S3`);

        return { success: true, deletedFiles };
      });

      return result;
    }),

  listAllProducts: adminProcedure
    .route({
      method: "POST",
      operationId: "listAllProducts",
      summary: "List All Products",
      description: "Lists all products across the platform with advanced filtering.",
      tags: ["Admin"],
    })
    .input(z.object({
      vendorId: z.string().optional(),
      categoryId: z.string().optional(),
      search: z.string().optional(),
      limit: z.coerce.number().int().min(1).max(100).default(50),
      offset: z.coerce.number().int().min(0).default(0),
    }))
    .handler(async ({ input }) => {
      const parsedInput = input;
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
          isFeatured: products.isFeatured,
          dealType: products.dealType,
          dealStartsAt: products.dealStartsAt,
          dealEndsAt: products.dealEndsAt,
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

  updateProductPromotions: adminProcedure
    .route({
      method: "PATCH",
      operationId: "updateProductPromotions",
      summary: "Update Product Promotions",
      description: "Sets featured, hot deal, or flash deal flags for a product.",
      tags: ["Admin", "Homepage"],
    })
    .input(
      z.object({
        id: z.string(),
        isFeatured: z.boolean().optional(),
        dealType: z.enum(["flash", "hot", "daily", "clearance", "bundle"]).nullable().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, isFeatured, dealType } = input;

      const [existing] = await db
        .select({
          id: products.id,
          dealStartsAt: products.dealStartsAt,
          dealEndsAt: products.dealEndsAt,
        })
        .from(products)
        .where(eq(products.id, id))
        .limit(1);

      if (!existing) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      const updates: Record<string, any> = {
        updatedAt: new Date(),
      };

      if (typeof isFeatured === "boolean") {
        updates.isFeatured = isFeatured;
      }

      if (dealType !== undefined) {
        if (dealType === null) {
          updates.dealType = null;
          updates.dealStartsAt = null;
          updates.dealEndsAt = null;
        } else {
          updates.dealType = dealType;
          if (!existing.dealStartsAt) {
            updates.dealStartsAt = new Date();
          }
          if (!existing.dealEndsAt) {
            updates.dealEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
          }
        }
      }

      const result = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, id))
        .returning();

      return result[0];
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
    .handler(async ({ input, context }) => {
      // Helper function to extract S3 key from URL
      const extractS3Key = (url: string | null): string | null => {
        if (!url) return null;

        // Match everything after '/images/' until a '?' or end of string
        const match = url.match(/\/images\/(.+?)(?:\?|$)/);
        if (match) {
          return match[1];
        }
        return null;
      };

      return await db.transaction(async (tx) => {
        // Get product images before deleting
        const images = await tx
          .select()
          .from(productImages)
          .where(eq(productImages.productId, input.id));

        // Collect S3 files to delete
        const filesToDelete: string[] = [];
        for (const img of images) {
          const key = extractS3Key(img.url);
          if (key) filesToDelete.push(key);
        }

        // Delete files from S3
        const deletedFiles: string[] = [];
        for (const fileKey of filesToDelete) {
          try {
            await context.storage.deleteFile(fileKey);
            deletedFiles.push(fileKey);
            console.log(`[Admin Delete Product] Deleted S3 file: ${fileKey}`);
          } catch (error) {
            console.error(`[Admin Delete Product] Failed to delete file ${fileKey}:`, error);
            // Continue even if deletion fails
          }
        }

        // Delete product (cascades to productImages due to foreign key)
        const result = await tx
          .delete(products)
          .where(eq(products.id, input.id))
          .returning();

        if (result.length === 0) {
          throw new ORPCError("NOT_FOUND", { message: "Product not found" });
        }

        const deletedProduct = result[0]!;

        // Decrement vendor's product count
        await tx
          .update(vendors)
          .set({
            productCount: sql`${vendors.productCount} - 1`,
            updatedAt: new Date(),
          })
          .where(eq(vendors.id, deletedProduct.vendorId));

        console.log(`[Admin Notice] Product ${input.id} removed. Reason: ${input.reason}. Deleted ${deletedFiles.length} images from S3.`);

        return { success: true, deletedFiles };
      });
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
      // Use upsert to handle both insert and update cases
      // This ensures settings are bootstrapped if they don't exist
      const result = await db
        .insert(platformSettings)
        .values({
          id: "current",
          ...input,
          // Provide defaults for required fields if not in input
          contactEmail: input.contactEmail ?? "admin@ayojon.com",
          supportPhone: input.supportPhone ?? "+880-1234-567890",
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: platformSettings.id,
          set: {
            ...input,
            updatedAt: new Date(),
          },
        })
        .returning();

      return result[0];
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
        status: z.enum([
          "awaiting_payment",
          "payment_submitted",
          "payment_received",
          "payment_rejected",
          "placed",
          "confirmed",
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cash_collected",
          "settlement_ready",
          "vendor_paid",
          "vendor_settled",
          "cancelled",
          "returned",
        ]).optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      })
    )
    .handler(async ({ input }) => {
      const conditions = [];
      if (input.status) conditions.push(eq(orders.status, input.status as OrderStatus));
      if (input.search) {
        conditions.push(or(
          ilike(user.name, `%${input.search}%`),
          ilike(user.email, `%${input.search}%`),
          ilike(orders.id, `%${input.search}%`),
          ilike(orders.orderNumber, `%${input.search}%`)
        ));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const ordersList = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
          updatedAt: orders.updatedAt,
          userName: user.name,
          userEmail: user.email,
          paymentMethod: orders.paymentMethod,
          paymentTransactionId: orders.paymentTransactionId,
          senderMobile: payments.senderMobile,
        })
        .from(orders)
        .innerJoin(user, eq(orders.userId, user.id))
        .leftJoin(payments, eq(orders.id, payments.orderId))
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
      method: "POST",
      operationId: "updateOrderStatus",
      summary: "Update Order Status",
      description: "Updates the status of an order.",
      tags: ["Admin"],
    })
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "awaiting_payment",
          "payment_submitted",
          "payment_received",
          "payment_rejected",
          "placed",
          "confirmed",
          "pending",
          "processing",
          "shipped",
          "delivered",
          "cash_collected",
          "settlement_ready",
          "vendor_paid",
          "vendor_settled",
          "cancelled",
          "returned",
        ]),
        reason: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const adminId = context.session.user.id;
      const result = await orderService.transitionOrderStatus(
        input.id, 
        input.status as any, 
        adminId,
        input.reason
      );

      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }

      const updatedOrder = result[0];

      // Send notification to customer about status change
      try {
        await notifyOrderStatusUpdate(
          updatedOrder.userId,
          updatedOrder.id,
          updatedOrder.orderNumber,
          updatedOrder.status
        );
      } catch (error) {
        // Log error but don't fail the status update
        console.error("Failed to send order status notification:", error);
      }

      return updatedOrder;
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
        .where(
          and(
            gte(orders.createdAt, firstDayOfMonth),
            notInArray(orders.status, ["cancelled", "returned"]),
            or(
              // bKash orders: count when payment received or later
              and(
                eq(orders.paymentMethod, "bkash"),
                sql`${orders.status} IN ('payment_received', 'shipped', 'delivered', 'vendor_paid')`
              ),
              // COD orders: count only after cash collected
              and(
                eq(orders.paymentMethod, "cod"),
                sql`${orders.status} IN ('cash_collected', 'settlement_ready', 'vendor_settled')`
              )
            )
          )
        );

      // Admin revenue = subtotal (product prices only) after payment approval
      const [monthlyRevenue] = await db
        .select({ 
          value: sql<string>`sum(${orders.subtotal})` 
        })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, firstDayOfMonth),
            notInArray(orders.status, ["cancelled", "returned"]),
            or(
              // bKash orders: count when payment received or later
              and(
                eq(orders.paymentMethod, "bkash"),
                sql`${orders.status} IN ('payment_received', 'shipped', 'delivered', 'vendor_paid')`
              ),
              // COD orders: count only after cash collected
              and(
                eq(orders.paymentMethod, "cod"),
                sql`${orders.status} IN ('cash_collected', 'settlement_ready', 'vendor_settled')`
              )
            )
          )
        );

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
          totalProducts: productCount?.value ?? 0,
          monthlyOrders: monthlyOrderCount?.value ?? 0,
          monthlyRevenue: parseFloat(monthlyRevenue?.value ?? "0"),
        },
        recentOrders,
        recentUsers,
      };
    }),

  // ====================================================================
  // Payment Verification Endpoints
  // ====================================================================

  listPendingPayments: adminProcedure
    .route({
      method: "POST",
      operationId: "listPendingPayments",
      summary: "List Pending Payments",
      description: "Lists all bKash payments awaiting admin verification.",
      tags: ["Admin", "Payments"],
    })
    .input(
      z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      })
    )
    .handler(async ({ input }) => {
      const payments = await paymentService.getPendingPayments(input.limit, input.offset);
      return {
        payments,
        total: payments.length,
      };
    }),

  verifyPayment: adminProcedure
    .route({
      method: "POST",
      operationId: "verifyPayment",
      summary: "Verify Payment",
      description: "Admin verifies a bKash payment and moves order to payment_received status.",
      tags: ["Admin", "Payments"],
    })
    .input(
      z.object({
        orderId: z.string(),
        notes: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const adminId = context.session.user.id;
      const result = await paymentService.verifyPayment(input.orderId, adminId, input.notes);

      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }

      return result.payment;
    }),

  rejectPayment: adminProcedure
    .route({
      method: "POST",
      operationId: "rejectPayment",
      summary: "Reject Payment",
      description: "Admin rejects a bKash payment with reason and moves order back to awaiting_payment.",
      tags: ["Admin", "Payments"],
    })
    .input(
      z.object({
        orderId: z.string(),
        reason: z.string().min(10, "Rejection reason must be at least 10 characters"),
      })
    )
    .handler(async ({ input, context }) => {
      const adminId = context.session.user.id;
      const result = await paymentService.rejectPayment(input.orderId, adminId, input.reason);

      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }

      return result.payment;
    }),

  recordCashCollection: adminProcedure
    .route({
      method: "POST",
      operationId: "recordCashCollection",
      summary: "Record Cash Collection",
      description: "Record that COD cash has been collected from customer.",
      tags: ["Admin", "Payments"],
    })
    .input(
      z.object({
        orderId: z.string(),
        collectionProof: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const adminId = context.session.user.id;
      const result = await paymentService.recordCashCollection(
        input.orderId,
        input.collectionProof,
        input.notes,
        adminId
      );

      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }

      return result.payment;
    }),

  // ====================================================================
  // Vendor Payout Endpoints
  // ====================================================================

  listPendingPayouts: adminProcedure
    .route({
      method: "POST",
      operationId: "listPendingPayouts",
      summary: "List Pending Payouts",
      description: "Lists all vendor payouts awaiting admin processing.",
      tags: ["Admin", "Payouts"],
    })
    .input(
      z.object({
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      })
    )
    .handler(async ({ input }) => {
      const payouts = await payoutService.getPendingPayouts(input.limit, input.offset);
      return {
        payouts,
        total: payouts.length,
      };
    }),

  getPayoutDetails: adminProcedure
    .route({
      method: "POST",
      operationId: "getPayoutDetails",
      summary: "Get Payout Details",
      description: "Get detailed information about a specific payout.",
      tags: ["Admin", "Payouts"],
    })
    .input(
      z.object({
        payoutId: z.string(),
      })
    )
    .handler(async ({ input }) => {
      const payout = await payoutService.getPayoutDetails(input.payoutId);

      if (!payout) {
        throw new ORPCError("NOT_FOUND", { message: "Payout not found" });
      }

      return payout;
    }),

  processPayout: adminProcedure
    .route({
      method: "POST",
      operationId: "processPayout",
      summary: "Process Payout",
      description: "Admin processes payment to vendor and records transaction details.",
      tags: ["Admin", "Payouts"],
    })
    .input(
      z.object({
        payoutId: z.string(),
        paymentMethod: z.string().min(1, "Payment method is required"),
        paymentReference: z.string().min(1, "Payment reference is required"),
        notes: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const adminId = context.session.user.id;
      const result = await payoutService.processPayout(
        input.payoutId,
        adminId,
        {
          paymentMethod: input.paymentMethod,
          paymentReference: input.paymentReference,
        },
        input.notes
      );

      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }

      return result.payout;
    }),

  markPayoutFailed: adminProcedure
    .route({
      method: "POST",
      operationId: "markPayoutFailed",
      summary: "Mark Payout Failed",
      description: "Mark a payout as failed with a reason.",
      tags: ["Admin", "Payouts"],
    })
    .input(
      z.object({
        payoutId: z.string(),
        reason: z.string().min(10, "Failure reason must be at least 10 characters"),
      })
    )
    .handler(async ({ input, context }) => {
      const adminId = context.session.user.id;
      const result = await payoutService.markPayoutFailed(input.payoutId, adminId, input.reason);

      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }

      return result.payout;
    }),

  createPayoutForOrder: adminProcedure
    .route({
      method: "POST",
      operationId: "createPayoutForOrder",
      summary: "Create Payout for Order",
      description: "Manually create payout records for an order that has been completed.",
      tags: ["Admin", "Payouts"],
    })
    .input(
      z.object({
        orderId: z.string(),
      })
    )
    .handler(async ({ input }) => {
      const result = await payoutService.createPayoutForOrder(input.orderId);

      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }

      return {
        success: true,
        payouts: result.payouts,
      };
    }),

  // ====================================================================
  // Homepage Banner Management
  // ====================================================================

  listAllBanners: adminProcedure
    .route({
      method: "POST",
      operationId: "listAllBanners",
      summary: "List All Homepage Banners",
      description: "Lists all homepage banners (active and inactive) for admin management.",
      tags: ["Admin", "Homepage"],
    })
    .handler(async () => {
      const banners = await db
        .select()
        .from(homeBanners)
        .orderBy(asc(homeBanners.sortOrder));

      return { banners };
    }),

  createBanner: adminProcedure
    .route({
      method: "POST",
      operationId: "createBanner",
      summary: "Create Homepage Banner",
      description: "Creates a new homepage banner slide.",
      tags: ["Admin", "Homepage"],
    })
    .input(
      z.object({
        imageUrl: z.string().url(),
        title: z.string().min(1).max(200),
        subtitle: z.string().min(1).max(500),
        buttonText: z.string().min(1).max(50),
        buttonLink: z.string().min(1),
        isActive: z.boolean().optional().default(true),
        sortOrder: z.number().int().min(0).optional().default(0),
      })
    )
    .handler(async ({ input }) => {
      const id = nanoid();
      const banner = await db
        .insert(homeBanners)
        .values({
          id,
          ...input,
        })
        .returning();

      return banner[0];
    }),

  updateBanner: adminProcedure
    .route({
      method: "PATCH",
      operationId: "updateBanner",
      summary: "Update Homepage Banner",
      description: "Updates an existing homepage banner.",
      tags: ["Admin", "Homepage"],
    })
    .input(
      z.object({
        id: z.string(),
        imageUrl: z.string().url().optional(),
        title: z.string().min(1).max(200).optional(),
        subtitle: z.string().min(1).max(500).optional(),
        buttonText: z.string().min(1).max(50).optional(),
        buttonLink: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().int().min(0).optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, ...updates } = input;
      const result = await db
        .update(homeBanners)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(homeBanners.id, id))
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", { message: "Banner not found" });
      }

      return result[0];
    }),

  deleteBanner: adminProcedure
    .route({
      method: "DELETE",
      operationId: "deleteBanner",
      summary: "Delete Homepage Banner",
      description: "Deletes a homepage banner permanently.",
      tags: ["Admin", "Homepage"],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      // Get banner to extract image URL
      const [banner] = await db
        .select()
        .from(homeBanners)
        .where(eq(homeBanners.id, input.id))
        .limit(1);

      if (!banner) {
        throw new ORPCError("NOT_FOUND", { message: "Banner not found" });
      }

      // Delete banner
      await db.delete(homeBanners).where(eq(homeBanners.id, input.id));

      // Try to delete image from storage
      try {
        const imageKey = banner.imageUrl.split('/').pop();
        if (imageKey) {
          await context.storage.deleteFile(imageKey);
        }
      } catch (error) {
        console.error("Failed to delete banner image from storage:", error);
        // Continue even if deletion fails
      }

      return { success: true };
    }),

  reorderBanners: adminProcedure
    .route({
      method: "POST",
      operationId: "reorderBanners",
      summary: "Reorder Homepage Banners",
      description: "Updates the sort order for multiple homepage banners.",
      tags: ["Admin", "Homepage"],
    })
    .input(
      z.object({
        banners: z.array(
          z.object({
            id: z.string(),
            sortOrder: z.number().int().min(0),
          })
        ),
      })
    )
    .handler(async ({ input }) => {
      // Update each banner's sort order in a transaction
      await db.transaction(async (tx) => {
        for (const banner of input.banners) {
          await tx
            .update(homeBanners)
            .set({ sortOrder: banner.sortOrder, updatedAt: new Date() })
            .where(eq(homeBanners.id, banner.id));
        }
      });

      return { success: true };
    }),

  // ====================================================================
  // Homepage Promo Card Management
  // ====================================================================

  listAllPromoCards: adminProcedure
    .route({
      method: "POST",
      operationId: "listAllPromoCards",
      summary: "List All Homepage Promo Cards",
      description: "Lists all 4 homepage promotional cards for admin management.",
      tags: ["Admin", "Homepage"],
    })
    .handler(async () => {
      const promoCards = await db
        .select()
        .from(homePromoCards)
        .orderBy(asc(homePromoCards.slotNumber));

      return { promoCards };
    }),

  updatePromoCard: adminProcedure
    .route({
      method: "PATCH",
      operationId: "updatePromoCard",
      summary: "Update Homepage Promo Card",
      description: "Updates a homepage promotional card by slot number.",
      tags: ["Admin", "Homepage"],
    })
    .input(
      z.object({
        id: z.string().optional(),
        slotNumber: z.number().int().min(1).max(4),
        imageUrl: z.string().url().optional(),
        label: z.string().min(1).max(100).optional(),
        title: z.string().min(1).max(200).optional(),
        link: z.string().min(1).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .handler(async ({ input }) => {
      const { id, slotNumber, ...updates } = input;

      // Check if promo card exists for this slot
      const [existing] = await db
        .select()
        .from(homePromoCards)
        .where(eq(homePromoCards.slotNumber, slotNumber))
        .limit(1);

      if (existing) {
        // Update existing card
        const result = await db
          .update(homePromoCards)
          .set({
            ...updates,
            updatedAt: new Date(),
          })
          .where(eq(homePromoCards.slotNumber, slotNumber))
          .returning();

        return result[0];
      } else {
        // Create new card for this slot
        const newId = nanoid();
        const result = await db
          .insert(homePromoCards)
          .values({
            id: newId,
            slotNumber,
            imageUrl: updates.imageUrl || "",
            label: updates.label || "",
            title: updates.title || "",
            link: updates.link || "",
            isActive: updates.isActive ?? true,
          })
          .returning();

        return result[0];
      }
    }),
});
