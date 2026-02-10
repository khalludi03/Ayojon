import { z } from "zod";
import { protectedProcedure, publicProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { 
  reviews, 
  reviewImages,
  orders,
  orderItems,
  products
} from "@my-better-t-app/db/schema/index";
import { eq, and, desc, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ORPCError } from "@orpc/server";
import { updateVendorScore } from "../services/vendor-service";

export const reviewRouter = os.router({
  createReview: protectedProcedure
    .route({
      operationId: "createReview",
      summary: "Submit a product review",
      tags: ["Reviews"],
    })
    .input(z.object({
      productId: z.string(),
      rating: z.number().min(1).max(5),
      title: z.string().max(100).optional(),
      comment: z.string().min(20).max(2000),
      recommend: z.boolean().default(true),
      images: z.array(z.string()).max(5).optional(),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { productId, rating, title, comment, recommend, images } = input;

      try {
        // 1. Verify user has purchased the product and it was delivered
        const deliveredStatuses: any[] = [
          "delivered", "vendor_paid", 
          "cash_collected", "settlement_ready", "vendor_settled"
        ];

        const purchase = await db
          .select({ id: orders.id })
          .from(orders)
          .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
          .where(
            and(
              eq(orders.userId, userId),
              eq(orderItems.productId, productId),
              inArray(orders.status, deliveredStatuses)
            )
          )
          .limit(1);

        if (purchase.length === 0) {
          throw new ORPCError("FORBIDDEN", {
            message: "You can only review products you have purchased and received.",
          });
        }

        // 2. Check if user already reviewed this product
        const existingReview = await db.query.reviews.findFirst({
          where: and(
            eq(reviews.productId, productId),
            eq(reviews.userId, userId)
          ),
        });

        if (existingReview) {
          throw new ORPCError("CONFLICT", {
            message: "You have already reviewed this product.",
          });
        }

        const reviewId = nanoid();

        await db.transaction(async (tx) => {
          // 3. Create the review
          await tx.insert(reviews).values({
            id: reviewId,
            productId,
            userId,
            rating,
            title,
            comment,
            recommend,
            isVerifiedPurchase: true,
            isApproved: true,
          });

          // 4. Add images if any
          if (images && images.length > 0) {
            await tx.insert(reviewImages).values(
              images.map((url, index) => ({
                id: nanoid(),
                reviewId,
                url,
                sortOrder: index,
              }))
            );
          }

          // 5. Update product rating metrics
          const productReviews = await tx
            .select({ rating: reviews.rating })
            .from(reviews)
            .where(eq(reviews.productId, productId));
          
          const allRatings = productReviews.map(r => r.rating);
          const newCount = allRatings.length;
          const newAverage = allRatings.reduce((a, b) => a + b, 0) / newCount;

          const updatedProducts = await tx
            .update(products)
            .set({
              ratingAverage: newAverage,
              ratingCount: newCount,
              updatedAt: new Date(),
            })
            .where(eq(products.id, productId))
            .returning({ vendorId: products.vendorId });

          // 6. Update Vendor Score
          const vendorId = updatedProducts[0]?.vendorId;
          if (vendorId) {
            await updateVendorScore(vendorId, tx);
          }
        });

        return { id: reviewId };
      } catch (error) {
        console.error(`[createReview] Error for user ${userId} and product ${productId}:`, error);
        if (error instanceof ORPCError) throw error;
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  getProductReviews: publicProcedure
    .route({
      operationId: "getProductReviews",
      summary: "Get reviews for a product",
      tags: ["Reviews"],
    })
    .input(z.object({
      productId: z.string(),
      limit: z.number().int().min(1).max(50).default(10),
      offset: z.number().int().min(0).default(0),
    }))
    .handler(async ({ input }) => {
      try {
        const results = await db.query.reviews.findMany({
          where: and(
            eq(reviews.productId, input.productId),
            eq(reviews.isApproved, true)
          ),
          limit: input.limit,
          offset: input.offset,
          orderBy: [desc(reviews.createdAt)],
          with: {
            user: true,
            images: true,
          },
        });

        return results;
      } catch (error) {
        console.error(`[getProductReviews] Error for product ${input.productId}:`, error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to fetch reviews",
        });
      }
    }),

  canReview: protectedProcedure
    .route({
      operationId: "canReview",
      summary: "Check if current user can review a product",
      tags: ["Reviews"],
    })
    .input(z.object({ productId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { productId } = input;

      try {
        const deliveredStatuses: any[] = [
          "delivered", "vendor_paid", 
          "cash_collected", "settlement_ready", "vendor_settled"
        ];

        const purchase = await db
          .select({ id: orders.id })
          .from(orders)
          .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
          .where(
            and(
              eq(orders.userId, userId),
              eq(orderItems.productId, productId),
              inArray(orders.status, deliveredStatuses)
            )
          )
          .limit(1);

        if (purchase.length === 0) {
          return { canReview: false, reason: "NOT_PURCHASED" };
        }

        const existingReview = await db.query.reviews.findFirst({
          where: and(
            eq(reviews.productId, productId),
            eq(reviews.userId, userId)
          ),
        });

        if (existingReview) {
          return { canReview: false, reason: "ALREADY_REVIEWED" };
        }

        return { canReview: true };
      } catch (error) {
        console.error(`[canReview] Error for user ${userId} and product ${productId}:`, error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to check review eligibility",
        });
      }
    }),

  listMyReviews: protectedProcedure
    .route({
      operationId: "listMyReviews",
      summary: "Get all reviews submitted by the current user",
      tags: ["Reviews"],
    })
    .input(z.object({
      limit: z.number().int().min(1).max(50).optional().default(20),
      offset: z.number().int().min(0).optional().default(0),
    }).optional().default({}))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const limit = input?.limit ?? 20;
      const offset = input?.offset ?? 0;

      try {
        const userReviews = await db.query.reviews.findMany({
          where: eq(reviews.userId, userId),
          limit,
          offset,
          orderBy: [desc(reviews.createdAt)],
          with: {
            product: {
              with: {
                images: {
                  where: (images: any, { eq }: any) => eq(images.isPrimary, true),
                  limit: 1,
                },
              },
            },
            images: true,
          },
        });

        return userReviews;
      } catch (error) {
        console.error(`[listMyReviews] Error for user ${userId}:`, error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to fetch your reviews",
        });
      }
    }),

  updateReview: protectedProcedure
    .route({
      operationId: "updateReview",
      summary: "Update an existing review",
      tags: ["Reviews"],
    })
    .input(z.object({
      reviewId: z.string(),
      rating: z.number().min(1).max(5),
      title: z.string().max(100).optional(),
      comment: z.string().min(20).max(2000),
      recommend: z.boolean().default(true),
      images: z.array(z.string()).max(5).optional(),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { reviewId, rating, title, comment, recommend, images } = input;

      try {
        // 1. Get the existing review and verify ownership
        const existingReview = await db.query.reviews.findFirst({
          where: eq(reviews.id, reviewId),
        });

        if (!existingReview) {
          throw new ORPCError("NOT_FOUND", {
            message: "Review not found",
          });
        }

        if (existingReview.userId !== userId) {
          throw new ORPCError("FORBIDDEN", {
            message: "You can only edit your own reviews",
          });
        }

        // 2. Check if review is older than 30 days
        const reviewDate = new Date(existingReview.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (reviewDate < thirtyDaysAgo) {
          throw new ORPCError("FORBIDDEN", {
            message: "Reviews can only be edited within 30 days of submission",
          });
        }

        await db.transaction(async (tx) => {
          // 3. Update the review
          await tx
            .update(reviews)
            .set({
              rating,
              title,
              comment,
              recommend,
              updatedAt: new Date(),
            })
            .where(eq(reviews.id, reviewId));

          // 4. Delete existing images
          await tx.delete(reviewImages).where(eq(reviewImages.reviewId, reviewId));

          // 5. Add new images if any
          if (images && images.length > 0) {
            await tx.insert(reviewImages).values(
              images.map((url, index) => ({
                id: nanoid(),
                reviewId,
                url,
                sortOrder: index,
              }))
            );
          }

          // 6. Update product rating metrics
          const productReviews = await tx
            .select({ rating: reviews.rating })
            .from(reviews)
            .where(eq(reviews.productId, existingReview.productId));
          
          const allRatings = productReviews.map(r => r.rating);
          const newCount = allRatings.length;
          const newAverage = allRatings.reduce((a, b) => a + b, 0) / newCount;

          await tx
            .update(products)
            .set({
              ratingAverage: newAverage,
              ratingCount: newCount,
              updatedAt: new Date(),
            })
            .where(eq(products.id, existingReview.productId));
        });

        return { success: true };
      } catch (error) {
        console.error(`[updateReview] Error for review ${reviewId}:`, error);
        if (error instanceof ORPCError) throw error;
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  deleteReview: protectedProcedure
    .route({
      operationId: "deleteReview",
      summary: "Delete a review",
      tags: ["Reviews"],
    })
    .input(z.object({
      reviewId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { reviewId } = input;

      try {
        // 1. Get the existing review and verify ownership
        const existingReview = await db.query.reviews.findFirst({
          where: eq(reviews.id, reviewId),
        });

        if (!existingReview) {
          throw new ORPCError("NOT_FOUND", {
            message: "Review not found",
          });
        }

        if (existingReview.userId !== userId) {
          throw new ORPCError("FORBIDDEN", {
            message: "You can only delete your own reviews",
          });
        }

        await db.transaction(async (tx) => {
          // 2. Delete the review (images will cascade delete)
          await tx.delete(reviews).where(eq(reviews.id, reviewId));

          // 3. Update product rating metrics
          const productReviews = await tx
            .select({ rating: reviews.rating })
            .from(reviews)
            .where(eq(reviews.productId, existingReview.productId));
          
          if (productReviews.length > 0) {
            const allRatings = productReviews.map(r => r.rating);
            const newCount = allRatings.length;
            const newAverage = allRatings.reduce((a, b) => a + b, 0) / newCount;

            await tx
              .update(products)
              .set({
                ratingAverage: newAverage,
                ratingCount: newCount,
                updatedAt: new Date(),
              })
              .where(eq(products.id, existingReview.productId));
          } else {
            // No more reviews, reset rating
            await tx
              .update(products)
              .set({
                ratingAverage: 0,
                ratingCount: 0,
                updatedAt: new Date(),
              })
              .where(eq(products.id, existingReview.productId));
          }
        });

        return { success: true };
      } catch (error) {
        console.error(`[deleteReview] Error for review ${reviewId}:`, error);
        if (error instanceof ORPCError) throw error;
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),
});
