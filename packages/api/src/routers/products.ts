import { z } from "zod";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  lte,
  ne,
  or,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { db } from "@my-better-t-app/db";
import {
  products,
  productImages,
  productVariants,
  productShippingOptions,
} from "@my-better-t-app/db/schema/products";
import { publicProcedure } from "../index";

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const CURRENCY_SYMBOLS: Record<string, string> = {
  BDT: "৳",
  INR: "₹",
  PKR: "Rs",
  USD: "$",
};

// ---------------------------------------------------------------------------
// Zod output schemas
// ---------------------------------------------------------------------------

const productImageSchema = z.object({
  url: z.string(),
  alt: z.string().nullable(),
  isPrimary: z.boolean(),
});

const vendorInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  isVerified: z.boolean(),
});

const pricingSchema = z.object({
  currentPrice: z.number(),
  originalPrice: z.number(),
  currency: z.string(),
  currencySymbol: z.string(),
  discountPercentage: z.number(),
});

const ratingSchema = z.object({
  average: z.number(),
  count: z.number(),
});

const shippingInfoSchema = z.object({
  freeShipping: z.boolean(),
  estimatedDays: z.number().nullable(),
  cost: z.number().nullable(),
});

const productListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  brand: z.string().nullable(),
  images: z.array(productImageSchema),
  vendor: vendorInfoSchema,
  pricing: pricingSchema,
  rating: ratingSchema,
  shipping: shippingInfoSchema,
  stockStatus: z.string(),
  stock: z.number(),
  badges: z.array(z.string()),
  categoryId: z.string(),
  subcategoryId: z.string().nullable(),
});

const dealProductSchema = productListItemSchema.extend({
  dealType: z.string().nullable(),
  dealStartedAt: z.string().nullable(),
  dealEndsAt: z.string().nullable(),
});

const productDetailSchema = productListItemSchema.extend({
  description: z.string(),
  descriptionShort: z.string().nullable(),
  keyFeatures: z.array(z.string()),
  whatsIncluded: z.array(z.string()),
  setupInstructions: z.string().nullable(),
  returnPolicy: z.string(),
  warranty: z.string(),
  variants: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      value: z.string(),
      priceModifier: z.number(),
      stock: z.number(),
      imageUrl: z.string().nullable(),
    }),
  ),
  shippingOptions: z.array(
    z.object({
      method: z.string(),
      cost: z.number(),
      estimatedDays: z.number(),
    }),
  ),
  createdAt: z.string(),
});

const paginatedProductsSchema = z.object({
  data: z.array(productListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasMore: z.boolean(),
});

// ---------------------------------------------------------------------------
// Transform: DB row → API list-item shape
// ---------------------------------------------------------------------------

interface ProductListRow {
  id: string;
  title: string;
  slug: string;
  brand: string | null;
  price: string;
  salePrice: string | null;
  discountPercentage: number | null;
  currency: string;
  ratingAverage: number | null;
  ratingCount: number;
  freeShipping: boolean;
  shippingCost: string | null;
  shippingEstimatedDays: number | null;
  stockStatus: string;
  stock: number;
  categoryId: string;
  subcategoryId: string | null;
  dealType: string | null;
  dealStartsAt: Date | null;
  dealEndsAt: Date | null;
  content: { badges?: string[] } | null;
  vendor: { id: string; name: string; isVerified: boolean };
  images: Array<{
    url: string;
    alt: string | null;
    isPrimary: boolean;
    sortOrder: number;
  }>;
}

function formatListItem(p: ProductListRow) {
  const originalPrice = parseFloat(p.price);
  const currentPrice = p.salePrice ? parseFloat(p.salePrice) : originalPrice;

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    brand: p.brand,
    images: p.images
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => ({ url: img.url, alt: img.alt, isPrimary: img.isPrimary })),
    vendor: {
      id: p.vendor.id,
      name: p.vendor.name,
      isVerified: p.vendor.isVerified,
    },
    pricing: {
      currentPrice,
      originalPrice,
      currency: p.currency,
      currencySymbol: CURRENCY_SYMBOLS[p.currency] ?? p.currency,
      discountPercentage: p.discountPercentage ?? 0,
    },
    rating: {
      average: p.ratingAverage ?? 0,
      count: p.ratingCount,
    },
    shipping: {
      freeShipping: p.freeShipping,
      estimatedDays: p.shippingEstimatedDays,
      cost: p.shippingCost ? parseFloat(p.shippingCost) : null,
    },
    stockStatus: p.stockStatus,
    stock: p.stock,
    badges: p.content?.badges ?? [],
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
  };
}

function formatDealItem(p: ProductListRow) {
  return {
    ...formatListItem(p),
    dealType: p.dealType,
    dealStartedAt: p.dealStartsAt?.toISOString() ?? null,
    dealEndsAt: p.dealEndsAt?.toISOString() ?? null,
  };
}

// ---------------------------------------------------------------------------
// Shared query options
// ---------------------------------------------------------------------------

const listWith = {
  vendor: true,
  images: true,
} as const;

// ---------------------------------------------------------------------------
// Sort helpers
// ---------------------------------------------------------------------------

const sortMap: Record<string, typeof asc> = {};

function getOrderBy(sort: string) {
  switch (sort) {
    case "price_asc":
      return [asc(products.price)];
    case "price_desc":
      return [desc(products.price)];
    case "created_desc":
      return [desc(products.createdAt)];
    case "rating_desc":
      return [desc(products.ratingAverage)];
    case "sales_desc":
      return [desc(products.salesCount)];
    case "discount_desc":
      return [desc(products.discountPercentage)];
    case "relevance":
    default:
      return [desc(products.ratingAverage), desc(products.salesCount)];
  }
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

export const productsRouter = {
  // -----------------------------------------------------------------------
  // GET /products  — paginated listing with filters
  // -----------------------------------------------------------------------
  list: publicProcedure
    .route({
      method: "GET",
      path: "/products",
      operationId: "getProducts",
      summary: "List Products",
      description:
        "Fetch a paginated list of products with filtering and sorting",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(
      z.object({
        category: z.string().optional(),
        subcategory: z.string().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minRating: z.number().optional(),
        freeShipping: z.boolean().optional(),
        onSale: z.boolean().optional(),
        inStock: z.boolean().optional(),
        vendorIds: z.array(z.string()).optional(),
        search: z.string().optional(),
        sort: z
          .enum([
            "relevance",
            "price_asc",
            "price_desc",
            "created_desc",
            "rating_desc",
            "sales_desc",
            "discount_desc",
          ])
          .default("relevance"),
        page: z.number().int().positive().default(1),
        limit: z.number().int().positive().max(100).default(20),
      }),
    )
    .output(paginatedProductsSchema)
    .handler(async ({ input }) => {
      const conditions: SQL[] = [eq(products.status, "active")];

      if (input.category) conditions.push(eq(products.categoryId, input.category));
      if (input.subcategory) conditions.push(eq(products.subcategoryId, input.subcategory));
      if (input.minPrice !== undefined) conditions.push(gte(products.price, String(input.minPrice)));
      if (input.maxPrice !== undefined) conditions.push(lte(products.price, String(input.maxPrice)));
      if (input.minRating !== undefined) conditions.push(gte(products.ratingAverage, input.minRating));
      if (input.freeShipping) conditions.push(eq(products.freeShipping, true));
      if (input.onSale) conditions.push(isNotNull(products.salePrice));
      if (input.inStock) conditions.push(ne(products.stockStatus, "out_of_stock"));
      if (input.vendorIds && input.vendorIds.length > 0) conditions.push(inArray(products.vendorId, input.vendorIds));

      if (input.search) {
        const searchCondition = or(
          products.title.ilike(`%${input.search}%`),
          products.description.ilike(`%${input.search}%`),
        );
        if (searchCondition) conditions.push(searchCondition);
      }

      const whereClause = and(...conditions);

      const [{ total }] = await db
        .select({ total: count() })
        .from(products)
        .where(whereClause);

      const rows = await db.query.products.findMany({
        where: whereClause,
        with: listWith,
        orderBy: getOrderBy(input.sort),
        limit: input.limit,
        offset: (input.page - 1) * input.limit,
      });

      const totalPages = Math.ceil(Number(total) / input.limit);

      return {
        data: rows.map(formatListItem),
        total: Number(total),
        page: input.page,
        limit: input.limit,
        totalPages,
        hasMore: input.page < totalPages,
      };
    }),

  // -----------------------------------------------------------------------
  // GET /products/detail  — single product full detail
  // -----------------------------------------------------------------------
  detail: publicProcedure
    .route({
      method: "GET",
      path: "/products/detail",
      operationId: "getProductBySlug",
      summary: "Get Product Detail",
      description: "Fetch full product details by slug",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(z.object({ slug: z.string() }))
    .output(productDetailSchema)
    .handler(async ({ input }) => {
      const product = await db.query.products.findFirst({
        where: and(
          eq(products.slug, input.slug),
          eq(products.status, "active"),
        ),
        with: {
          vendor: true,
          images: { orderBy: [asc(productImages.sortOrder)] },
          variants: { where: eq(productVariants.isActive, true) },
          shippingOptions: {
            where: eq(productShippingOptions.isActive, true),
          },
        },
      });

      if (!product) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      const base = formatListItem(product);
      const content = product.content ?? {};

      return {
        ...base,
        description: product.description,
        descriptionShort: product.descriptionShort,
        keyFeatures: content.keyFeatures ?? [],
        whatsIncluded: content.whatsIncluded ?? [],
        setupInstructions: content.setupInstructions ?? null,
        returnPolicy: content.returnPolicy ?? "",
        warranty: content.warranty ?? "",
        variants: product.variants.map((v) => ({
          id: v.id,
          type: v.type,
          value: v.value,
          priceModifier: parseFloat(v.priceModifier),
          stock: v.stock,
          imageUrl: v.imageUrl,
        })),
        shippingOptions: product.shippingOptions.map((s) => ({
          method: s.method,
          cost: parseFloat(s.cost),
          estimatedDays: s.estimatedDays,
        })),
        createdAt: product.createdAt.toISOString(),
      };
    }),

  // -----------------------------------------------------------------------
  // GET /products/search
  // -----------------------------------------------------------------------
  search: publicProcedure
    .route({
      method: "GET",
      path: "/products/search",
      operationId: "searchProducts",
      summary: "Search Products",
      description: "Search active products by title or description",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(
      z.object({
        q: z.string().min(1),
        limit: z.number().int().positive().max(50).default(10),
      }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: and(
          eq(products.status, "active"),
          or(
            products.title.ilike(`%${input.q}%`),
            products.description.ilike(`%${input.q}%`),
          ),
        ),
        with: listWith,
        orderBy: [desc(products.ratingAverage)],
        limit: input.limit,
      });

      return rows.map(formatListItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/deals/today
  // -----------------------------------------------------------------------
  todayDeals: publicProcedure
    .route({
      method: "GET",
      path: "/products/deals/today",
      operationId: "getTodayDeals",
      summary: "Get Today's Deals",
      description:
        "Fetch products with active daily deals or significant discounts",
      tags: ["Products", "Deals"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(12) }),
    )
    .output(z.array(dealProductSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: and(
          eq(products.status, "active"),
          or(
            and(
              eq(products.dealType, "daily"),
              gte(products.dealEndsAt, new Date()),
            ),
            gte(products.discountPercentage, 30),
          ),
        ),
        with: listWith,
        orderBy: [desc(products.discountPercentage)],
        limit: input.limit,
      });

      return rows.map(formatDealItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/deals/flash
  // -----------------------------------------------------------------------
  flashDeals: publicProcedure
    .route({
      method: "GET",
      path: "/products/deals/flash",
      operationId: "getFlashDeals",
      summary: "Get Flash Deals",
      description: "Fetch products with active flash deals",
      tags: ["Products", "Deals"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(8) }),
    )
    .output(z.array(dealProductSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: and(
          eq(products.status, "active"),
          eq(products.dealType, "flash"),
          gte(products.dealEndsAt, new Date()),
        ),
        with: listWith,
        orderBy: [desc(products.discountPercentage)],
        limit: input.limit,
      });

      return rows.map(formatDealItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/new-arrivals
  // -----------------------------------------------------------------------
  newArrivals: publicProcedure
    .route({
      method: "GET",
      path: "/products/new-arrivals",
      operationId: "getNewArrivals",
      summary: "Get New Arrivals",
      description: "Fetch the most recently added active products",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(12) }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: eq(products.status, "active"),
        with: listWith,
        orderBy: [desc(products.createdAt)],
        limit: input.limit,
      });

      return rows.map(formatListItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/top-rated
  // -----------------------------------------------------------------------
  topRated: publicProcedure
    .route({
      method: "GET",
      path: "/products/top-rated",
      operationId: "getTopRated",
      summary: "Get Top Rated Products",
      description: "Fetch products sorted by highest average rating",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(12) }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: eq(products.status, "active"),
        with: listWith,
        orderBy: [desc(products.ratingAverage)],
        limit: input.limit,
      });

      return rows.map(formatListItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/best-sellers
  // -----------------------------------------------------------------------
  bestSellers: publicProcedure
    .route({
      method: "GET",
      path: "/products/best-sellers",
      operationId: "getBestSellers",
      summary: "Get Best Sellers",
      description: "Fetch products sorted by total sales count",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(12) }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: eq(products.status, "active"),
        with: listWith,
        orderBy: [desc(products.salesCount)],
        limit: input.limit,
      });

      return rows.map(formatListItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/featured
  // -----------------------------------------------------------------------
  featured: publicProcedure
    .route({
      method: "GET",
      path: "/products/featured",
      operationId: "getFeaturedProducts",
      summary: "Get Featured Products",
      description:
        "Fetch high-quality products with strong ratings and popularity",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(20) }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: and(
          eq(products.status, "active"),
          gte(products.ratingAverage, 4.0),
          gte(products.ratingCount, 10),
        ),
        with: listWith,
        orderBy: [desc(products.ratingAverage), desc(products.ratingCount)],
        limit: input.limit,
      });

      return rows.map(formatListItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/flash-sale
  // -----------------------------------------------------------------------
  flashSale: publicProcedure
    .route({
      method: "GET",
      path: "/products/flash-sale",
      operationId: "getFlashSaleProducts",
      summary: "Get Flash Sale Products",
      description: "Fetch products with 40%+ discounts sorted by discount",
      tags: ["Products", "Deals"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(12) }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: and(
          eq(products.status, "active"),
          gte(products.discountPercentage, 40),
        ),
        with: listWith,
        orderBy: [desc(products.discountPercentage)],
        limit: input.limit,
      });

      return rows.map(formatListItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/hot-deals
  // -----------------------------------------------------------------------
  hotDeals: publicProcedure
    .route({
      method: "GET",
      path: "/products/hot-deals",
      operationId: "getHotDeals",
      summary: "Get Hot Deals",
      description: "Fetch popular discounted products with good ratings",
      tags: ["Products", "Deals"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(12) }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      const rows = await db.query.products.findMany({
        where: and(
          eq(products.status, "active"),
          gte(products.discountPercentage, 25),
          gte(products.ratingAverage, 3.5),
        ),
        with: listWith,
        orderBy: [desc(products.salesCount)],
        limit: input.limit,
      });

      return rows.map(formatListItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/for-you  — category-diverse top-rated picks
  // -----------------------------------------------------------------------
  forYou: publicProcedure
    .route({
      method: "GET",
      path: "/products/for-you",
      operationId: "getForYouProducts",
      summary: "Get Personalized Products",
      description: "Fetch top-rated products across diverse categories",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(
      z.object({ limit: z.number().int().positive().max(50).default(12) }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      // Over-fetch so we can deduplicate by category
      const rows = await db.query.products.findMany({
        where: eq(products.status, "active"),
        with: listWith,
        orderBy: [desc(products.ratingAverage)],
        limit: input.limit * 3,
      });

      // Keep at most 2 products per category
      const seen = new Map<string, number>();
      const diversified = rows
        .filter((p) => {
          const n = seen.get(p.categoryId) ?? 0;
          if (n >= 2) return false;
          seen.set(p.categoryId, n + 1);
          return true;
        })
        .slice(0, input.limit);

      return diversified.map(formatListItem);
    }),

  // -----------------------------------------------------------------------
  // GET /products/related  — same-category neighbours
  // -----------------------------------------------------------------------
  related: publicProcedure
    .route({
      method: "GET",
      path: "/products/related",
      operationId: "getRelatedProducts",
      summary: "Get Related Products",
      description:
        "Fetch active products in the same category as the given product",
      tags: ["Products"],
      successStatus: 200,
    })
    .input(
      z.object({
        productId: z.string(),
        limit: z.number().int().positive().max(20).default(6),
      }),
    )
    .output(z.array(productListItemSchema))
    .handler(async ({ input }) => {
      const product = await db.query.products.findFirst({
        where: eq(products.id, input.productId),
      });

      if (!product) {
        throw new ORPCError("NOT_FOUND", { message: "Product not found" });
      }

      const rows = await db.query.products.findMany({
        where: and(
          eq(products.categoryId, product.categoryId),
          ne(products.id, input.productId),
          eq(products.status, "active"),
        ),
        with: listWith,
        orderBy: [desc(products.ratingAverage)],
        limit: input.limit,
      });

      return rows.map(formatListItem);
    }),
};
