import { z } from "zod";
import { protectedProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { 
  cart, 
  products, 
  productImages, 
  vendors, 
  productVariants 
} from "@my-better-t-app/db/schema/index";
import { eq, and } from "drizzle-orm";
import { transformProduct } from "./product";

async function fetchCartItemsWithDetails(userId: string, tx: any = db) {
  const items = await tx
    .select()
    .from(cart)
    .where(eq(cart.userId, userId));

  return await Promise.all(items.map(async (item: any) => {
    const productResults = await tx
      .select()
      .from(products)
      .where(eq(products.id, item.productId))
      .limit(1);
    
    const product = productResults[0];
    if (product) {
      const images = await tx
        .select()
        .from(productImages)
        .where(eq(productImages.productId, product.id));
      
      const vendorResults = await tx
        .select()
        .from(vendors)
        .where(eq(vendors.id, product.vendorId))
        .limit(1);

      const variants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id));

      return {
        ...item,
        product: transformProduct({
          ...product,
          images,
          vendor: vendorResults[0] || null,
          variants,
        }),
      };
    }
    
    return {
      ...item,
      product: null,
    };
  }));
}

export const cartRouter = os.router({
  list: protectedProcedure
    .route({
      method: "GET",
      path: "/",
      summary: "Get current user's cart",
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id;
      return await fetchCartItemsWithDetails(userId);
    }),

  sync: protectedProcedure
    .route({
      method: "POST",
      path: "/sync",
      summary: "Sync local cart to database",
    })
    .input(z.array(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number(),
      savedForLater: z.number().default(0),
    })))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      return await db.transaction(async (tx) => {
        for (const item of input) {
          const variantId = item.variantId || '';
          
          const existingResults = await tx
            .select()
            .from(cart)
            .where(and(
              eq(cart.userId, userId),
              eq(cart.productId, item.productId),
              eq(cart.variantId, variantId)
            ))
            .limit(1);

          if (existingResults[0]) {
            await tx.update(cart)
              .set({ 
                quantity: item.quantity, 
                savedForLater: item.savedForLater,
                updatedAt: new Date() 
              })
              .where(and(
                eq(cart.userId, userId),
                eq(cart.productId, item.productId),
                eq(cart.variantId, variantId)
              ));
          } else {
            await tx.insert(cart).values({
              userId,
              productId: item.productId,
              variantId: variantId,
              quantity: item.quantity,
              savedForLater: item.savedForLater,
            });
          }
        }

        return await fetchCartItemsWithDetails(userId, tx);
      });
    }),

  update: protectedProcedure
    .route({
      method: "PATCH",
      path: "/",
      summary: "Add or update item in cart",
    })
    .input(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number(),
      savedForLater: z.number().optional(),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const variantId = input.variantId || '';

      const existingResults = await db
        .select()
        .from(cart)
        .where(and(
          eq(cart.userId, userId),
          eq(cart.productId, input.productId),
          eq(cart.variantId, variantId)
        ))
        .limit(1);

      const existing = existingResults[0];

      if (existing) {
        const result = await db.update(cart)
          .set({ 
            quantity: input.quantity,
            savedForLater: input.savedForLater ?? existing.savedForLater,
            updatedAt: new Date() 
          })
          .where(and(
            eq(cart.userId, userId),
            eq(cart.productId, input.productId),
            eq(cart.variantId, variantId)
          ))
          .returning();
        return result[0];
      } else {
        const result = await db.insert(cart).values({
          userId,
          productId: input.productId,
          variantId,
          quantity: input.quantity,
          savedForLater: input.savedForLater ?? 0,
        }).returning();
        return result[0];
      }
    }),

  remove: protectedProcedure
    .route({
      method: "DELETE",
      path: "/{productId}",
      summary: "Remove item from cart",
    })
    .input(z.object({
      productId: z.string(),
      variantId: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const variantId = input.variantId || '';

      await db.delete(cart).where(
        and(
          eq(cart.userId, userId),
          eq(cart.productId, input.productId),
          eq(cart.variantId, variantId)
        )
      );

      return { success: true };
    }),

  clear: protectedProcedure
    .route({
      method: "DELETE",
      path: "/clear",
      summary: "Clear current user's cart",
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id;
      await db.delete(cart).where(eq(cart.userId, userId));
      return { success: true };
    }),
});
