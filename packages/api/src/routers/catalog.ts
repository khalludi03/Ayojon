import { z } from "zod";
import { publicProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { 
  categories,
  subcategories,
  eventTypes
} from "@my-better-t-app/db/schema/index";
import { eq, asc } from "drizzle-orm";

export const catalogRouter = os.router({
  listCategories: publicProcedure
    .route({
      operationId: "listCategories",
      summary: "List Categories",
      description: "Returns all active categories with their subcategories.",
      tags: ["Catalog"],
    })
    .handler(async () => {
      const allCategories = await db.query.categories.findMany({
        where: eq(categories.isActive, true),
        orderBy: [asc(categories.sortOrder)],
        with: {
          subcategories: {
            where: eq(subcategories.isActive, true),
            orderBy: [asc(subcategories.sortOrder)],
          }
        }
      });

      return allCategories;
    }),

  listEventTypes: publicProcedure
    .route({
      operationId: "listEventTypes",
      summary: "List Event Types",
      description: "Returns all active event types for event-based shopping.",
      tags: ["Catalog"],
    })
    .handler(async () => {
      const allEventTypes = await db.query.eventTypes.findMany({
        where: eq(eventTypes.isActive, true),
        orderBy: [asc(eventTypes.sortOrder)],
      });

      return allEventTypes;
    }),

  getCategoryBySlug: publicProcedure
    .route({
      operationId: "getCategoryBySlug",
      summary: "Get Category by Slug",
      description: "Returns a single category and its subcategories by its slug.",
      tags: ["Catalog"],
    })
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
        with: {
          subcategories: {
            where: eq(subcategories.isActive, true),
            orderBy: [asc(subcategories.sortOrder)],
          }
        }
      });

      return category;
    }),
});
