import { z } from "zod";
import { protectedProcedure } from "../index";
import { db } from "@my-better-t-app/db";
import { vendorApplications, user, vendors } from "@my-better-t-app/db/schema/index";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ORPCError } from "@orpc/server";

export const vendorRouter = {
  getVendorProfile: protectedProcedure
    .route({
      method: "GET",
      path: "/vendor/me",
      operationId: "getVendorProfile",
      summary: "Get My Vendor Profile",
      description: "Gets the vendor profile for the currently authenticated user.",
      tags: ["Vendor"],
    })
    .output(
      z.object({
        vendor: z.any().nullable(),
      })
    )
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
      method: "POST",
      path: "/vendor/application/submit",
      operationId: "submitVendorApplication",
      summary: "Submit Vendor Application",
      description: "Submits a new vendor application for the authenticated user.",
      tags: ["Vendor"],
    })
    .input(
      z.object({
        businessName: z.string().min(2),
        businessType: z.enum(["individual", "company", "enterprise"]),
        taxId: z.string().min(5),
        businessPhone: z.string().min(10),
        businessAddress: z.record(z.string(), z.any()), // Will be stored as JSON string
        yearsInBusiness: z.number().int().min(0),
        storeName: z.string().min(2),
        storeDescription: z.string().optional(),
        productCategories: z.array(z.string()).min(1),
        logoUrl: z.string().url().optional(),
        bannerUrl: z.string().url().optional(),
        tradeLicenseUrl: z.string().url().optional(),
        identificationUrl: z.string().url().optional(),
        bankDetailsUrl: z.string().url().optional(),
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
          businessName: input.businessName,
          businessType: input.businessType,
          taxId: input.taxId,
          businessPhone: input.businessPhone,
          businessAddress: JSON.stringify(input.businessAddress),
          yearsInBusiness: input.yearsInBusiness,
          storeName: input.storeName,
          storeDescription: input.storeDescription,
          productCategories: JSON.stringify(input.productCategories),
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
      method: "GET",
      path: "/vendor/application/status",
      operationId: "getVendorApplicationStatus",
      summary: "Get Vendor Application Status",
      description: "Gets the status of the current user's vendor application.",
      tags: ["Vendor"],
    })
    .output(
      z.object({
        application: z.any().nullable(),
      })
    )
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
      method: "PATCH",
      path: "/vendor/profile",
      operationId: "updateVendorProfile",
      summary: "Update Vendor Profile",
      description: "Allows a vendor to update their store profile information.",
      tags: ["Vendor"],
    })
    .input(
      z.object({
        name: z.string().min(2).optional(),
        description: z.string().optional(),
        logoUrl: z.string().url().optional(),
        bannerUrl: z.string().url().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
        vendor: z.any(),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      // Ensure user is a vendor
      if (context.session.user.role !== "vendor") {
        throw new ORPCError("FORBIDDEN", {
          message: "Only vendors can update vendor profiles.",
        });
      }

      const updated = await db
        .update(vendors)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(vendors.userId, userId))
        .returning();

      if (updated.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Vendor profile not found.",
        });
      }

      return {
        success: true,
        vendor: updated[0],
      };
    }),
};
