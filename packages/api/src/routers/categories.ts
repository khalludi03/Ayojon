import { z } from "zod";
import { and, asc, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { db } from "@my-better-t-app/db";
import { categories, subcategories } from "@my-better-t-app/db/schema/catalog";
import { publicProcedure } from "../index";

const subcategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  parentId: z.string(),
});

const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  icon: z.string(),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  productCount: z.number(),
  subcategories: z.array(subcategorySchema),
});

function formatCategory(cat: {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
  subcategories: Array<{ id: string; name: string; slug: string; parentId: string }>;
}) {
  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    description: cat.description,
    imageUrl: cat.imageUrl,
    productCount: cat.productCount,
    subcategories: cat.subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      slug: sub.slug,
      parentId: sub.parentId,
    })),
  };
}

export const categoriesRouter = {
  list: publicProcedure
    .route({
      method: "GET",
      path: "/categories",
      operationId: "getCategories",
      summary: "Get Categories",
      description: "Fetch all active categories with their subcategories",
      tags: ["Categories"],
      successStatus: 200,
    })
    .output(z.array(categorySchema))
    .handler(async () => {
      const rows = await db.query.categories.findMany({
        where: eq(categories.isActive, true),
        with: {
          subcategories: {
            where: eq(subcategories.isActive, true),
            orderBy: [asc(subcategories.sortOrder)],
          },
        },
        orderBy: [asc(categories.sortOrder)],
      });

      return rows.map(formatCategory);
    }),

  bySlug: publicProcedure
    .route({
      method: "GET",
      path: "/categories/by-slug",
      operationId: "getCategoryBySlug",
      summary: "Get Category by Slug",
      description: "Fetch a single active category by its URL slug",
      tags: ["Categories"],
      successStatus: 200,
    })
    .input(z.object({ slug: z.string() }))
    .output(categorySchema)
    .handler(async ({ input }) => {
      const cat = await db.query.categories.findFirst({
        where: and(
          eq(categories.slug, input.slug),
          eq(categories.isActive, true),
        ),
        with: {
          subcategories: {
            where: eq(subcategories.isActive, true),
            orderBy: [asc(subcategories.sortOrder)],
          },
        },
      });

      if (!cat) {
        throw new ORPCError("NOT_FOUND", { message: "Category not found" });
      }

      return formatCategory(cat);
    }),
};
