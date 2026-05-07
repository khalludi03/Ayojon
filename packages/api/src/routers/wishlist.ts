import { z } from 'zod'
import { db } from '@my-better-t-app/db'
import {
  productImages,
  products,
  vendors,
  wishlist,
} from '@my-better-t-app/db/schema/index'
import { and, eq } from 'drizzle-orm'
import { protectedProcedure, router } from '../index'
import { logger } from '../lib/logger'
import { transformProduct } from './product'

export const wishlistRouter = router({
  list: protectedProcedure
    .route({
      method: 'POST',
      path: '/list',
      summary: "Get current user's wishlist",
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id
      logger.info(`[Wishlist] Fetching wishlist for user: ${userId}`)

      try {
        const items = await db
          .select()
          .from(wishlist)
          .where(eq(wishlist.userId, userId))

        // Manually fetch products for each wishlist item to mimic the 'with' behavior
        // This is safer than db.query if there are schema initialization issues
        const itemsWithProducts = await Promise.all(
          items.map(async (item) => {
            const productResults = await db
              .select()
              .from(products)
              .where(eq(products.id, item.productId))
              .limit(1)

            const product = productResults[0]
            if (product) {
              // Fetch images and vendor manually
              const images = await db
                .select()
                .from(productImages)
                .where(eq(productImages.productId, product.id))

              const vendorResults = await db
                .select()
                .from(vendors)
                .where(eq(vendors.id, product.vendorId))
                .limit(1)

              return {
                ...item,
                product: transformProduct({
                  ...product,
                  images,
                  vendor: vendorResults[0] || null,
                }),
              }
            }

            return {
              ...item,
              product: null,
            }
          }),
        )

        logger.info(`[Wishlist] Found ${itemsWithProducts.length} items`)
        return itemsWithProducts
      } catch (err) {
        logger.error({ err }, '[Wishlist] Error in list')
        throw err
      }
    }),

  add: protectedProcedure
    .route({
      method: 'POST',
      path: '/',
      summary: 'Add product to wishlist',
    })
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // Check if already exists
      const existingResults = await db
        .select()
        .from(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId),
            eq(wishlist.productId, input.productId),
          ),
        )
        .limit(1)

      if (existingResults[0]) return existingResults[0]

      const result = await db
        .insert(wishlist)
        .values({
          userId,
          productId: input.productId,
        })
        .returning()

      return result[0]
    }),

  remove: protectedProcedure
    .route({
      method: 'DELETE',
      path: '/{productId}',
      summary: 'Remove product from wishlist',
    })
    .input(
      z.object({
        productId: z.string(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      await db
        .delete(wishlist)
        .where(
          and(
            eq(wishlist.userId, userId),
            eq(wishlist.productId, input.productId),
          ),
        )

      return { success: true }
    }),
})
