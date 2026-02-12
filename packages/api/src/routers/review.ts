import { z } from "zod";
import { protectedProcedure, publicProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { 
  reviews, 
  reviewImages,
  reviewVotes,
  orders,
  orderItems,
  products,
  vendors,
  user,
  type VoteType
} from "@my-better-t-app/db/schema/index";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ORPCError } from "@orpc/server";
import { updateVendorScore } from "../services/vendor-service";
import * as notificationService from "../services/notification-service";

// =============================================================================
// HELPERS
// =============================================================================

// Helper function to extract S3 key from URL
const extractS3Key = (url: string | null): string | null => {
  if (!url) return null;

  // Match everything after '/images/' until a '?' or end of string
  const match = url.match(/\/images\/(.+?)(?:\?|$)/);
  if (match && match[1]) {
    return match[1];
  }
  return null;
};

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
        let vendorUserId: string | undefined;
        let productTitle: string | undefined;
        let reviewerName: string | undefined;

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
            .returning({ vendorId: products.vendorId, title: products.title });

          // 6. Update Vendor Score
          const vendorId = updatedProducts[0]?.vendorId;
          productTitle = updatedProducts[0]?.title;
          if (vendorId) {
            await updateVendorScore(vendorId, tx);
            
            // Get vendor's userId for notification
            const [vendor] = await tx
              .select({ userId: vendors.userId })
              .from(vendors)
              .where(eq(vendors.id, vendorId))
              .limit(1);
            vendorUserId = vendor?.userId;
          }

          // Get reviewer's name
          const [reviewer] = await tx
            .select({ name: user.name })
            .from(user)
            .where(eq(user.id, userId))
            .limit(1);
          reviewerName = reviewer?.name || "A customer";
        });

        // Send notification after transaction commits
        if (vendorUserId && productTitle) {
          try {
            await notificationService.notifyProductReview(
              vendorUserId,
              productId,
              productTitle,
              rating,
              reviewerName || "A customer"
            );
          } catch (error) {
            // Log error but don't fail the review creation
            console.error("Failed to send review notification:", error);
          }
        }

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
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;
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
            ...(userId ? {
              votes: {
                where: eq(reviewVotes.userId, userId),
                limit: 1,
              }
            } : {}),
          },
        });

        return results.map(r => ({
          ...r,
          myVote: (r as any).votes?.[0]?.voteType || null,
        }));
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
            votes: {
              where: eq(reviewVotes.userId, userId),
              limit: 1,
            }
          },
        });

        return userReviews.map(r => ({
          ...r,
          myVote: (r as any).votes?.[0]?.voteType || null,
        }));
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

        // Get existing images to delete from S3
        const oldImages = await db
          .select()
          .from(reviewImages)
          .where(eq(reviewImages.reviewId, reviewId));

        const filesToDelete = oldImages
          .map(img => extractS3Key(img.url))
          .filter((key): key is string => !!key);

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

          // 4. Delete existing images from DB
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

        // Delete old files from S3 after successful DB transaction
        for (const fileKey of filesToDelete) {
          try {
            await context.storage.deleteFile(fileKey);
          } catch (error) {
            console.error(`[updateReview] Failed to delete file ${fileKey}:`, error);
          }
        }

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

        // Get existing images to delete from S3
        const oldImages = await db
          .select()
          .from(reviewImages)
          .where(eq(reviewImages.reviewId, reviewId));

        const filesToDelete = oldImages
          .map(img => extractS3Key(img.url))
          .filter((key): key is string => !!key);

        await db.transaction(async (tx) => {
          // 2. Delete the review (images will cascade delete in DB)
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

        // Delete files from S3 after successful DB transaction
        for (const fileKey of filesToDelete) {
          try {
            await context.storage.deleteFile(fileKey);
          } catch (error) {
            console.error(`[deleteReview] Failed to delete file ${fileKey}:`, error);
          }
        }

        return { success: true };
      } catch (error) {
        console.error(`[deleteReview] Error for review ${reviewId}:`, error);
        if (error instanceof ORPCError) throw error;
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }),

  voteReview: protectedProcedure
    .route({
      operationId: "voteReview",
      summary: "Vote on a review (helpful/not helpful)",
      tags: ["Reviews"],
    })
    .input(z.object({
      reviewId: z.string(),
      voteType: z.enum(["helpful", "not_helpful"]),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const { reviewId, voteType } = input;

      try {
        // 1. Check if user already voted on this review
        const existingVote = await db.query.reviewVotes.findFirst({
          where: and(
            eq(reviewVotes.reviewId, reviewId),
            eq(reviewVotes.userId, userId)
          ),
        });

        await db.transaction(async (tx) => {
          if (existingVote) {
            if (existingVote.voteType === voteType) {
              // Same vote, so remove it (toggle off)
              await tx
                .delete(reviewVotes)
                .where(
                  and(
                    eq(reviewVotes.reviewId, reviewId),
                    eq(reviewVotes.userId, userId)
                  )
                );
            } else {
              // Different vote, so update it
              await tx
                .update(reviewVotes)
                .set({ voteType })
                .where(
                  and(
                    eq(reviewVotes.reviewId, reviewId),
                    eq(reviewVotes.userId, userId)
                  )
                );
            }
          } else {
            // New vote
            await tx.insert(reviewVotes).values({
              id: nanoid(),
              reviewId,
              userId,
              voteType,
            });
          }

          // 2. Update denormalized counts in reviews table
          const helpfulCountResult = await tx
            .select({ count: sql<number>`count(*)` })
            .from(reviewVotes)
            .where(
              and(
                eq(reviewVotes.reviewId, reviewId),
                eq(reviewVotes.voteType, "helpful")
              )
            );
          
          const notHelpfulCountResult = await tx
            .select({ count: sql<number>`count(*)` })
            .from(reviewVotes)
            .where(
              and(
                eq(reviewVotes.reviewId, reviewId),
                eq(reviewVotes.voteType, "not_helpful")
              )
            );

          await tx
            .update(reviews)
            .set({
              helpfulVotes: Number(helpfulCountResult[0]?.count || 0),
              notHelpfulVotes: Number(notHelpfulCountResult[0]?.count || 0),
            })
            .where(eq(reviews.id, reviewId));
        });

        return { success: true };
      } catch (error) {
        console.error(`[voteReview] Error for user ${userId} and review ${reviewId}:`, error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to process vote",
        });
      }
    }),
});
