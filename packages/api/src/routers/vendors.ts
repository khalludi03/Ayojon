import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { db } from "@my-better-t-app/db";
import { vendors } from "@my-better-t-app/db/schema/catalog";
import { publicProcedure } from "../index";

const vendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  isVerified: z.boolean(),
  rating: z.number(),
  productCount: z.number(),
  location: z.string(),
  joinedAt: z.string(),
  description: z.string().nullable(),
  logoUrl: z.string().nullable(),
});

function formatVendor(v: typeof vendors.$inferSelect) {
  return {
    id: v.id,
    name: v.name,
    slug: v.slug,
    isVerified: v.isVerified,
    rating: parseFloat(v.ratingAverage),
    productCount: v.productCount,
    location: v.location,
    joinedAt: v.joinedAt.toISOString(),
    description: v.description,
    logoUrl: v.logoUrl,
  };
}

export const vendorsRouter = {
  list: publicProcedure
    .route({
      method: "GET",
      path: "/vendors",
      operationId: "getVendors",
      summary: "Get Vendors",
      description: "Fetch all active vendors sorted by product count",
      tags: ["Vendors"],
      successStatus: 200,
    })
    .output(z.array(vendorSchema))
    .handler(async () => {
      const rows = await db.query.vendors.findMany({
        where: eq(vendors.isActive, true),
        orderBy: [desc(vendors.productCount)],
      });

      return rows.map(formatVendor);
    }),

  byId: publicProcedure
    .route({
      method: "GET",
      path: "/vendors/by-id",
      operationId: "getVendorById",
      summary: "Get Vendor by ID",
      description: "Fetch a single active vendor by their unique ID",
      tags: ["Vendors"],
      successStatus: 200,
    })
    .input(z.object({ id: z.string() }))
    .output(vendorSchema)
    .handler(async ({ input }) => {
      const vendor = await db.query.vendors.findFirst({
        where: and(eq(vendors.id, input.id), eq(vendors.isActive, true)),
      });

      if (!vendor) {
        throw new ORPCError("NOT_FOUND", { message: "Vendor not found" });
      }

      return formatVendor(vendor);
    }),
};
