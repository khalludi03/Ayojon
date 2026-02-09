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
import { eq, and, desc, sql } from "drizzle-orm";
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
      
      const myProducts = await db.query.products.findMany({
        where: eq(products.vendorId, vendorId),
        limit: input?.limit ?? 20,
        offset: input?.offset ?? 0,
        orderBy: [desc(products.createdAt)],
        with: {
          images: true,
        },
      });

      return myProducts;
    }),

  createProduct: protectedProcedure
    .route({
      operationId: "createProduct",
      summary: "Create Product",
      description: "Creates a new product for the authenticated vendor.",
      tags: ["Vendor Product"],
    })
    .input(z.any())
    .handler(async ({ input, context }) => {
      try {
        const vendorId = await getVendorId(context.session.user.id);
        const productId = nanoid();

        // Define schema for manual parsing
        const schema = z.object({
          title: z.string().min(2),
          slug: z.string().min(2),
          description: z.string().min(5),
          descriptionShort: z.string().min(5).optional(),
          categoryId: z.string(),
          subcategoryId: z.string().optional(),
          price: z.string(),
          salePrice: z.string().optional().nullable(),
          stock: z.coerce.number().int().min(0),
          status: z.enum(["draft", "active", "out_of_stock", "archived"]).default("draft"),
          images: z.array(z.object({
            url: z.string(),
            alt: z.string().optional().nullable(),
            isPrimary: z.boolean().default(false),
          })).optional(),
        });

        const result = schema.safeParse(input);
        if (!result.success) {
          const errorMsg = `Validation failed: ${JSON.stringify(result.error.format())}`;
          console.error("[Create Product]", errorMsg);
          throw new ORPCError("BAD_REQUEST", {
            message: errorMsg,
          });
        }

        const parsedInput = result.data;

        await db.transaction(async (tx) => {
          await tx.insert(products).values({
            id: productId,
            vendorId,
            title: parsedInput.title,
            slug: parsedInput.slug,
            description: parsedInput.description,
            descriptionShort: parsedInput.descriptionShort,
            categoryId: parsedInput.categoryId,
            subcategoryId: parsedInput.subcategoryId,
            price: parsedInput.price,
            salePrice: parsedInput.salePrice,
            stock: parsedInput.stock,
            status: parsedInput.status,
          });

          if (parsedInput.images && parsedInput.images.length > 0) {
            await tx.insert(productImages).values(
              parsedInput.images.map((img, index) => ({
                id: nanoid(),
                productId,
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
                sortOrder: index,
              }))
            );
          }

          // Increment vendor's product count
          await tx
            .update(vendors)
            .set({
              productCount: sql`${vendors.productCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(vendors.id, vendorId));
        });

        return { id: productId };
      } catch (error) {
        console.error("[Create Product] ERROR:", error);
        if (error instanceof ORPCError) throw error;
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  updateProduct: protectedProcedure
    .route({
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
        stock: z.coerce.number().int().optional(),
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
      operationId: "deleteProduct",
      summary: "Delete Product",
      description: "Deletes a product. Ensures the product belongs to the vendor.",
      tags: ["Vendor Product"],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const vendorId = await getVendorId(context.session.user.id);

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

      await db.transaction(async (tx) => {
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

        // Delete product (cascades to productImages due to foreign key)
        const result = await tx
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

        // Delete files from S3
        const deletedFiles: string[] = [];
        for (const fileKey of filesToDelete) {
          try {
            await context.storage.deleteFile(fileKey);
            deletedFiles.push(fileKey);
            console.log(`[Vendor Delete Product] Deleted S3 file: ${fileKey}`);
          } catch (error) {
            console.error(`[Vendor Delete Product] Failed to delete file ${fileKey}:`, error);
            // Continue even if deletion fails
          }
        }

        // Decrement vendor's product count
        await tx
          .update(vendors)
          .set({
            productCount: sql`${vendors.productCount} - 1`,
            updatedAt: new Date(),
          })
          .where(eq(vendors.id, vendorId));

        console.log(`[Vendor Delete Product] Deleted product ${input.id}, removed ${deletedFiles.length} images from S3`);
      });

      return { success: true };
    }),
});
