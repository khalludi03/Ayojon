import { z } from "zod";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@my-better-t-app/db";
import { reviews } from "@my-better-t-app/db/schema/reviews";
import { publicProcedure } from "../index";

const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    isAnonymous: z.boolean(),
  }),
  rating: z.number(),
  title: z.string().nullable(),
  comment: z.string(),
  isVerifiedPurchase: z.boolean(),
  images: z.array(z.object({ url: z.string(), alt: z.string().nullable() })),
  helpfulVotes: z.number(),
  notHelpfulVotes: z.number(),
  createdAt: z.string(),
});

const paginatedReviewsSchema = z.object({
  data: z.array(reviewSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});

const reviewSummarySchema = z.object({
  averageRating: z.number(),
  totalReviews: z.number(),
  ratingBreakdown: z.object({
    5: z.number(),
    4: z.number(),
    3: z.number(),
    2: z.number(),
    1: z.number(),
  }),
});

export const reviewsRouter = {
  list: publicProcedure
    .route({
      method: "GET",
      path: "/reviews",
      operationId: "getProductReviews",
      summary: "Get Product Reviews",
      description:
        "Fetch paginated reviews for a product with filtering and sorting",
      tags: ["Reviews"],
      successStatus: 200,
    })
    .input(
      z.object({
        productId: z.string(),
        filter: z
          .enum(["all", "with_photos", "verified_purchase"])
          .default("all"),
        sort: z
          .enum([
            "most_recent",
            "most_helpful",
            "highest_rating",
            "lowest_rating",
          ])
          .default("most_recent"),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(50).default(10),
      }),
    )
    .output(paginatedReviewsSchema)
    .handler(async ({ input }) => {
      const { productId, filter, sort, page, limit } = input;

      const conditions = [
        eq(reviews.productId, productId),
        eq(reviews.isApproved, true),
      ];

      if (filter === "verified_purchase") {
        conditions.push(eq(reviews.isVerifiedPurchase, true));
      }

      const orderByMap = {
        most_recent: [desc(reviews.createdAt)],
        most_helpful: [desc(reviews.helpfulVotes)],
        highest_rating: [desc(reviews.rating)],
        lowest_rating: [asc(reviews.rating)],
      };

      const rows = await db.query.reviews.findMany({
        where: and(...conditions),
        with: { user: true, images: true },
        orderBy: orderByMap[sort],
      });

      // with_photos filter requires checking the loaded images relation
      const filtered =
        filter === "with_photos"
          ? rows.filter((r) => r.images.length > 0)
          : rows;

      const total = filtered.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;
      const paginatedData = filtered.slice(start, start + limit);

      return {
        data: paginatedData.map((r) => ({
          id: r.id,
          productId: r.productId,
          user: {
            id: r.user.id,
            name: r.isAnonymous ? "Anonymous" : r.user.name,
            isAnonymous: r.isAnonymous,
          },
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          isVerifiedPurchase: r.isVerifiedPurchase,
          images: r.images.map((img) => ({ url: img.url, alt: img.alt })),
          helpfulVotes: r.helpfulVotes,
          notHelpfulVotes: r.notHelpfulVotes,
          createdAt: r.createdAt.toISOString(),
        })),
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      };
    }),

  summary: publicProcedure
    .route({
      method: "GET",
      path: "/reviews/summary",
      operationId: "getReviewSummary",
      summary: "Get Review Summary",
      description: "Get aggregated rating statistics for a product",
      tags: ["Reviews"],
      successStatus: 200,
    })
    .input(z.object({ productId: z.string() }))
    .output(reviewSummarySchema)
    .handler(async ({ input }) => {
      const rows = await db
        .select({ rating: reviews.rating })
        .from(reviews)
        .where(
          and(
            eq(reviews.productId, input.productId),
            eq(reviews.isApproved, true),
          ),
        );

      const totalReviews = rows.length;
      const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      for (const r of rows) {
        const rating = r.rating as 1 | 2 | 3 | 4 | 5;
        ratingBreakdown[rating]++;
      }

      const averageRating =
        totalReviews > 0
          ? rows.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      return {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingBreakdown,
      };
    }),
};
