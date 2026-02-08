import { z } from "zod";
import { protectedProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { 
  products, 
  productImages, 
  productVariants, 
  productSpecifications,
  productEventTypes,
  vendors
} from "@my-better-t-app/db/schema/index";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ORPCError } from "@orpc/server";

// Helper to get vendor ID from user ID
async function getVendorId(userId: string) {
  const vendor = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.userId, userId))
    .limit(1);
  
  if (!vendor[0]) {
    throw new ORPCError("FORBIDDEN", {
      message: "User is not a registered vendor",
    });
  }
  
  return vendor[0].id;
}

export const vendorProductRouter = os.router({
  listMyProducts: protectedProcedure
    .route({
      method: "GET",
      path: "/vendor/products",
      operationId: "listMyProducts",
      summary: "List My Products",
      description: "Lists all products belonging to the authenticated vendor.",
      tags: ["Vendor Product"],
    })
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).default(20),
        offset: z.number().int().min(0).default(0),
      }).optional()
    )
    .handler(async ({ input, context }) => {
      const vendorId = await getVendorId(context.session.user.id);
      
      const myProducts = await db
        .select()
        .from(products)
        .where(eq(products.vendorId, vendorId))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0)
        .orderBy(desc(products.createdAt));

      return myProducts;
    }),

  createProduct: protectedProcedure
    .route({
      method: "POST",
      path: "/vendor/products",
      operationId: "createProduct",
      summary: "Create Product",
      description: "Creates a new product for the authenticated vendor.",
      tags: ["Vendor Product"],
    })
    .input(
      z.object({
        title: z.string().min(2),
        slug: z.string().min(2),
        description: z.string().min(10),
        descriptionShort: z.string().optional(),
        categoryId: z.string(),
        subcategoryId: z.string().optional(),
        price: z.string(), // numeric as string for precision
        salePrice: z.string().optional(),
        stock: z.number().int().min(0),
        status: z.enum(["draft", "active", "out_of_stock", "archived"]).default("draft"),
        images: z.array(z.object({
          url: z.string().url(),
          alt: z.string().optional(),
          isPrimary: z.boolean().default(false),
        })).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const vendorId = await getVendorId(context.session.user.id);
      const productId = nanoid();

      await db.transaction(async (tx) => {
        await tx.insert(products).values({
          id: productId,
          vendorId,
          title: input.title,
          slug: input.slug,
          description: input.description,
          descriptionShort: input.descriptionShort,
          categoryId: input.categoryId,
          subcategoryId: input.subcategoryId,
          price: input.price,
          salePrice: input.salePrice,
          stock: input.stock,
          status: input.status,
        });

        if (input.images && input.images.length > 0) {
          await tx.insert(productImages).values(
            input.images.map((img, index) => ({
              id: nanoid(),
              productId,
              url: img.url,
              alt: img.alt,
              isPrimary: img.isPrimary,
              sortOrder: index,
            }))
          );
        }
      });

      return { id: productId };
    }),

  updateProduct: protectedProcedure
    .route({
      method: "PATCH",
      path: "/vendor/products/:id",
      operationId: "updateProduct",
      summary: "Update Product",
      description: "Updates an existing product. Ensures the product belongs to the vendor.",
      tags: ["Vendor Product"],
    })
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        stock: z.number().int().optional(),
        status: z.enum(["draft", "active", "out_of_stock", "archived"]).optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const vendorId = await getVendorId(context.session.user.id);

      const result = await db
        .update(products)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(products.id, input.id),
            eq(products.vendorId, vendorId)
          )
        )
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Product not found or unauthorized",
        });
      }

      return result[0];
    }),

  deleteProduct: protectedProcedure
    .route({
      method: "DELETE",
      path: "/vendor/products/:id",
      operationId: "deleteProduct",
      summary: "Delete Product",
      description: "Deletes a product. Ensures the product belongs to the vendor.",
      tags: ["Vendor Product"],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const vendorId = await getVendorId(context.session.user.id);

      const result = await db
        .delete(products)
        .where(
          and(
            eq(products.id, input.id),
            eq(products.vendorId, vendorId)
          )
        )
        .returning();

      if (result.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Product not found or unauthorized",
        });
      }

      return { success: true };
    }),
});
