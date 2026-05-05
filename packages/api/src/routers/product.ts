import { z } from 'zod'
import { and, asc, desc, eq, gte, inArray, lte, sql } from 'drizzle-orm'
import { ORPCError } from '@orpc/server'
import { nanoid } from 'nanoid'
import { db } from '@my-better-t-app/db'
import {
  categories,
  eventTypes,
  productEventTypes,
  productImages,
  productSpecifications,
  productVariants,
  products,
  subcategories,
  vendors,
} from '@my-better-t-app/db/schema/index'
import { os, protectedProcedure, publicProcedure } from '../index'
import { logger } from '../lib/logger'
import * as notificationService from '../services/notification-service'

// =============================================================================
// HELPERS
// =============================================================================

// Helper to get vendor ID from user ID
async function getVendorId(userId: string) {
  const vendor = await db
    .select({ id: vendors.id })
    .from(vendors)
    .where(eq(vendors.userId, userId))
    .limit(1)

  if (!vendor[0]) {
    throw new ORPCError('FORBIDDEN', {
      message: 'User is not a registered vendor',
    })
  }

  return vendor[0].id
}

/**
 * Helper to transform DB product to Frontend Product type
 */
export function transformProduct(p: any) {
  if (!p) return null

  const vendor = p.vendor || {
    id: p.vendorId || 'unknown',
    name: 'Unknown Vendor',
    isVerified: false,
  }

  const images = (p.images || []).map((img: any) => ({
    url: img.url || '',
    alt: img.alt || '',
    isPrimary: !!img.isPrimary,
  }))

  // Ensure at least one image exists for UI consistency
  if (images.length === 0) {
    images.push({
      url: '/placeholder-product.png',
      alt: 'No image available',
      isPrimary: true,
    })
  }

  const dealStartsAt = p.dealStartsAt
    ? p.dealStartsAt instanceof Date
      ? p.dealStartsAt.toISOString()
      : p.dealStartsAt
    : p.dealType
      ? new Date().toISOString()
      : undefined
  const dealEndsAt = p.dealEndsAt
    ? p.dealEndsAt instanceof Date
      ? p.dealEndsAt.toISOString()
      : p.dealEndsAt
    : p.dealType
      ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      : undefined

  return {
    id: p.id,
    title: p.title || 'Untitled Product',
    brand: p.brand || undefined,
    slug: p.slug,
    description: p.description || '',
    descriptionShort: p.descriptionShort || '',
    dealType: p.dealType || undefined,
    dealStartsAt,
    dealEndsAt,
    images,
    vendor: {
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      isVerified: !!vendor.isVerified,
    },
    pricing: {
      currentPrice: parseFloat(p.salePrice || p.price || '0'),
      originalPrice: parseFloat(p.price || '0'),
      currency: p.currency || 'BDT',
      currencySymbol: p.currency === 'USD' ? '$' : '৳',
      discountPercentage: p.discountPercentage || 0,
    },
    rating: {
      average: Number(p.ratingAverage || 0),
      count: Number(p.ratingCount || 0),
    },
    shipping: {
      freeShipping: !!p.freeShipping,
      estimatedDays: p.shippingEstimatedDays || 3,
      cost: parseFloat(p.shippingCost || '0'),
    },
    shippingOptions: (p.shippingOptions || []).map((so: any) => ({
      method: so.method,
      cost: parseFloat(so.cost || '0'),
      estimatedDays: so.estimatedDays || 3,
    })),
    stockStatus: p.stockStatus || 'out_of_stock',
    stock: p.stock || 0,
    badges: p.content?.badges || [],
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId || undefined,
    keyFeatures: p.content?.keyFeatures || [],
    whatsIncluded: p.content?.whatsIncluded || [],
    specifications: (p.specifications || []).map((s: any) => ({
      key: s.key,
      value: s.value,
    })),
    setupInstructions: p.content?.setupInstructions || undefined,
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      type: v.type,
      value: v.value,
      priceModifier: parseFloat(v.priceModifier || '0'),
      stock: v.stock || 0,
      imageUrl: v.imageUrl || undefined,
    })),
    returnPolicy: p.content?.returnPolicy || '7 days return policy',
    warranty: p.content?.warranty || 'No warranty',
    createdAt:
      p.createdAt instanceof Date
        ? p.createdAt.toISOString()
        : new Date().toISOString(),
  }
}

// =============================================================================
// ROUTER
// =============================================================================

export const productRouter = os.router({
  // --- Public Catalog Procedures ---

  listCategories: publicProcedure
    .route({
      operationId: 'listCategories',
      summary: 'List Categories',
      description: 'Returns all active categories with their subcategories.',
      tags: ['Catalog'],
    })
    .handler(async () => {
      const allCategories = await db.query.categories.findMany({
        where: eq(categories.isActive, true),
        orderBy: [asc(categories.sortOrder)],
        with: {
          subcategories: {
            where: eq(subcategories.isActive, true),
            orderBy: [asc(subcategories.sortOrder)],
          },
        },
      })

      // Get product counts for each category
      const categoriesWithCounts = await Promise.all(
        allCategories.map(async (category) => {
          const countResult = await db
            .select({ count: sql<number>`cast(count(*) as integer)` })
            .from(products)
            .where(
              and(
                eq(products.categoryId, category.id),
                eq(products.status, 'active'),
              ),
            )

          return {
            ...category,
            productCount: countResult[0]?.count || 0,
          }
        }),
      )

      return categoriesWithCounts
    }),

  getCategoryBySlug: publicProcedure
    .route({
      operationId: 'getCategoryBySlug',
      summary: 'Get Category by Slug',
      description:
        'Returns a single category and its subcategories by its slug.',
      tags: ['Catalog'],
    })
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
        with: {
          subcategories: {
            where: eq(subcategories.isActive, true),
            orderBy: [asc(subcategories.sortOrder)],
          },
        },
      })

      return category
    }),

  listEventTypes: publicProcedure
    .route({
      operationId: 'listEventTypes',
      summary: 'List Event Types',
      description: 'Returns all active event types for filtering products.',
      tags: ['Catalog'],
    })
    .handler(async () => {
      const allEventTypes = await db.query.eventTypes.findMany({
        where: eq(eventTypes.isActive, true),
        orderBy: [asc(eventTypes.sortOrder)],
      })

      return allEventTypes
    }),

  getProducts: publicProcedure
    .route({
      operationId: 'getProducts',
      summary: 'Get Products',
      description: 'Returns a paginated list of products with filters.',
      tags: ['Catalog'],
    })
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(1000).default(20),
        category: z.union([z.string(), z.array(z.string())]).optional(),
        subcategory: z.union([z.string(), z.array(z.string())]).optional(),
        vendor: z.union([z.string(), z.array(z.string())]).optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        sort: z.string().optional(),
        q: z.string().optional(),
        featured: z.boolean().optional(),
        dealType: z.string().optional(),
        eventType: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const {
        page,
        limit,
        category,
        subcategory,
        vendor,
        minPrice,
        maxPrice,
        sort,
        q,
        featured,
        dealType,
        eventType,
      } = input
      const offset = (page - 1) * limit

      const whereClauses = [eq(products.status, 'active')]

      if (category) {
        const categoryIds = Array.isArray(category) ? category : [category]
        const actualIds: Array<string> = []

        for (const catId of categoryIds) {
          const cat = await db.query.categories.findFirst({
            where: eq(categories.slug, catId),
          })
          actualIds.push(cat?.id ?? catId)
        }

        if (actualIds.length === 1) {
          whereClauses.push(eq(products.categoryId, actualIds[0]))
        } else if (actualIds.length > 1) {
          whereClauses.push(inArray(products.categoryId, actualIds))
        }
      }

      if (subcategory) {
        const subcategoryIds = Array.isArray(subcategory)
          ? subcategory
          : [subcategory]
        const actualIds: Array<string> = []

        for (const subId of subcategoryIds) {
          const sub = await db.query.subcategories.findFirst({
            where: eq(subcategories.slug, subId),
          })
          actualIds.push(sub?.id ?? subId)
        }

        if (actualIds.length === 1) {
          whereClauses.push(eq(products.subcategoryId, actualIds[0]))
        } else if (actualIds.length > 1) {
          whereClauses.push(inArray(products.subcategoryId, actualIds))
        }
      }

      if (vendor) {
        const vendorIds = Array.isArray(vendor) ? vendor : [vendor]
        const actualIds: Array<string> = []

        for (const vId of vendorIds) {
          const v = await db.query.vendors.findFirst({
            where: eq(vendors.slug, vId),
          })
          actualIds.push(v?.id ?? vId)
        }

        if (actualIds.length === 1) {
          whereClauses.push(eq(products.vendorId, actualIds[0]))
        } else if (actualIds.length > 1) {
          whereClauses.push(inArray(products.vendorId, actualIds))
        }
      }

      if (minPrice !== undefined) {
        whereClauses.push(
          gte(
            sql`COALESCE(${products.salePrice}, ${products.price})`,
            minPrice.toString(),
          ),
        )
      }

      if (maxPrice !== undefined) {
        whereClauses.push(
          lte(
            sql`COALESCE(${products.salePrice}, ${products.price})`,
            maxPrice.toString(),
          ),
        )
      }

      if (featured !== undefined) {
        whereClauses.push(eq(products.isFeatured, featured))
      }

      if (dealType) {
        whereClauses.push(eq(products.dealType, dealType as any))
      }

      if (q) {
        whereClauses.push(sql`${products.title} ILIKE ${`%${q}%`}`)
      }

      if (eventType) {
        const eventTypeRecord = await db.query.eventTypes.findFirst({
          where: eq(eventTypes.slug, eventType),
        })
        if (eventTypeRecord) {
          const productIdsWithType = await db
            .select({ productId: productEventTypes.productId })
            .from(productEventTypes)
            .where(eq(productEventTypes.eventTypeId, eventTypeRecord.id))

          if (productIdsWithType.length > 0) {
            whereClauses.push(
              inArray(
                products.id,
                productIdsWithType.map((p) => p.productId),
              ),
            )
          } else {
            whereClauses.push(sql`FALSE`)
          }
        }
      }

      const orderBy = []
      if (sort === 'price_asc') {
        orderBy.push(
          asc(sql`COALESCE(${products.salePrice}, ${products.price})`),
        )
      } else if (sort === 'price_desc') {
        orderBy.push(
          desc(sql`COALESCE(${products.salePrice}, ${products.price})`),
        )
      } else if (sort === 'rating_desc') {
        orderBy.push(desc(products.ratingAverage))
      } else if (sort === 'newest') {
        orderBy.push(desc(products.createdAt))
      } else {
        orderBy.push(desc(products.createdAt))
      }

      const data = await db.query.products.findMany({
        where: and(...whereClauses),
        limit,
        offset,
        orderBy,
        with: {
          images: true,
          vendor: true,
          variants: true,
          shippingOptions: true,
        },
      })

      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(...whereClauses))

      const total = countResult[0]?.count ?? 0

      return {
        data: data.map(transformProduct),
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
        hasMore: offset + data.length < Number(total),
      }
    }),

  getProductBySlug: publicProcedure
    .route({
      operationId: 'getProductBySlug',
      summary: 'Get Product by Slug',
      description: 'Returns a single product by its slug.',
      tags: ['Catalog'],
    })
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      logger.debug(`[getProductBySlug] Searching for slug: "${input.slug}"`)

      // Use direct select with joins for maximum reliability
      const results = await db
        .select()
        .from(products)
        .where(eq(products.slug, input.slug))
        .limit(1)

      if (!results[0]) {
        logger.warn(
          `[getProductBySlug] Product NOT FOUND in DB for slug: "${input.slug}"`,
        )
        return null
      }

      const p = results[0]

      // Fetch related data manually if needed, or use findFirst if we trust it
      // Let's try findFirst again now that we confirmed basic select works
      const fullProduct = await db.query.products.findFirst({
        where: eq(products.id, p.id),
        with: {
          images: true,
          vendor: true,
          variants: true,
          shippingOptions: true,
          specifications: true,
        },
      })

      if (!fullProduct) {
        logger.warn(
          `[getProductBySlug] Full product data NOT FOUND for ID: ${p.id}`,
        )
        return null
      }

      logger.debug(
        `[getProductBySlug] Transforming product: "${fullProduct.title}"`,
      )
      try {
        const transformed = transformProduct(fullProduct)
        logger.debug(
          `[getProductBySlug] Successfully transformed product: ${transformed?.id}`,
        )
        return transformed
      } catch (err) {
        logger.error(
          `[getProductBySlug] TRANSFORMATION FAILED for product ${fullProduct.id}:`,
          err,
        )
        throw err
      }
    }),

  searchProducts: publicProcedure
    .route({
      operationId: 'searchProducts',
      summary: 'Search Products',
      description: 'Search products by title or description.',
      tags: ['Catalog'],
    })
    .input(
      z.object({
        q: z.string(),
        limit: z.number().int().min(1).max(50).default(10),
      }),
    )
    .handler(async ({ input }) => {
      const { q, limit } = input

      const results = await db.query.products.findMany({
        where: and(
          eq(products.status, 'active'),
          sql`${products.title} ILIKE ${`%${q}%`}`,
        ),
        limit,
        with: {
          images: true,
          vendor: true,
          variants: true,
          shippingOptions: true,
        },
      })

      return results.map(transformProduct)
    }),

  listVendors: publicProcedure
    .route({
      operationId: 'listVendors',
      summary: 'List Vendors',
      description: 'Returns a list of all active vendors.',
      tags: ['Catalog'],
    })
    .handler(async () => {
      const allVendors = await db.query.vendors.findMany({
        where: eq(vendors.isActive, true),
        orderBy: [desc(vendors.ratingAverage), desc(vendors.productCount)],
      })

      return allVendors.map((v) => ({
        ...v,
        rating: v.ratingAverage,
        reviewCount: v.ratingCount,
        score: v.score,
        joinedAt: v.joinedAt.toISOString(),
      }))
    }),

  getVendorBySlug: publicProcedure
    .route({
      operationId: 'getVendorBySlug',
      summary: 'Get Vendor by Slug',
      description: 'Returns a single vendor by its slug or ID.',
      tags: ['Catalog'],
    })
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      // First try to find by slug
      let v = await db.query.vendors.findFirst({
        where: eq(vendors.slug, input.slug),
      })

      // If not found by slug, try to find by ID
      if (!v) {
        v = await db.query.vendors.findFirst({
          where: eq(vendors.id, input.slug),
        })
      }

      if (!v) return null

      return {
        ...v,
        rating: v.ratingAverage,
        reviewCount: v.ratingCount,
        score: v.score,
        joinedAt: v.joinedAt.toISOString(),
      }
    }),

  // --- Vendor Specific Procedures (Protected) ---

  listMyProducts: protectedProcedure
    .route({
      operationId: 'listMyProducts',
      summary: 'List My Products',
      description: 'Lists all products belonging to the authenticated vendor.',
      tags: ['Vendor Product'],
    })
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(1000).default(20),
          offset: z.number().int().min(0).default(0),
        })
        .optional(),
    )
    .handler(async ({ input, context }) => {
      const vendorId = await getVendorId(context.session.user.id)

      const myProducts = await db.query.products.findMany({
        where: eq(products.vendorId, vendorId),
        limit: input?.limit ?? 20,
        offset: input?.offset ?? 0,
        orderBy: [desc(products.createdAt)],
        with: {
          images: true,
          category: true,
          subcategory: true,
        },
      })

      return myProducts
    }),

  createProduct: protectedProcedure
    .route({
      operationId: 'createProduct',
      summary: 'Create Product',
      description: 'Creates a new product for the authenticated vendor.',
      tags: ['Vendor Product'],
    })
    .input(z.any())
    .handler(async ({ input, context }) => {
      try {
        const vendorId = await getVendorId(context.session.user.id)
        const productId = nanoid()

        // Define schema for manual parsing
        const schema = z.object({
          title: z.string().min(2),
          slug: z.string().min(2),
          description: z.string().min(5),
          descriptionShort: z.string().min(5).optional(),
          categoryId: z.string(),
          subcategoryId: z.string().optional(),
          brand: z.string().optional(),
          sku: z.string().optional(),
          price: z.string(),
          salePrice: z.string().optional().nullable(),
          stock: z.coerce.number().int().min(0),
          status: z
            .enum(['draft', 'active', 'out_of_stock', 'archived'])
            .default('draft'),
          images: z
            .array(
              z.object({
                url: z.string(),
                alt: z.string().optional().nullable(),
                isPrimary: z.boolean().default(false),
              }),
            )
            .optional(),
          keyFeatures: z.array(z.string()).optional(),
        })

        const result = schema.safeParse(input)
        if (!result.success) {
          const errorMsg = `Validation failed: ${JSON.stringify(result.error.format())}`
          logger.error('[Create Product]', errorMsg)
          throw new ORPCError('BAD_REQUEST', {
            message: errorMsg,
          })
        }

        const parsedInput = result.data

        await db.transaction(async (tx) => {
          await tx.insert(products).values({
            id: productId,
            vendorId,
            title: parsedInput.title,
            slug: parsedInput.slug,
            description: parsedInput.description,
            descriptionShort: parsedInput.descriptionShort,
            brand: parsedInput.brand,
            sku: parsedInput.sku,
            categoryId: parsedInput.categoryId,
            subcategoryId: parsedInput.subcategoryId,
            price: parsedInput.price,
            salePrice: parsedInput.salePrice,
            stock: parsedInput.stock,
            status: parsedInput.status,
            content: parsedInput.keyFeatures
              ? { keyFeatures: parsedInput.keyFeatures }
              : undefined,
          })

          if (parsedInput.images && parsedInput.images.length > 0) {
            await tx.insert(productImages).values(
              parsedInput.images.map((img, index) => ({
                id: nanoid(),
                productId,
                url: img.url,
                alt: img.alt,
                isPrimary: img.isPrimary,
                sortOrder: index,
              })),
            )
          }

          // Increment vendor's product count
          await tx
            .update(vendors)
            .set({
              productCount: sql`${vendors.productCount} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(vendors.id, vendorId))
        })

        return { id: productId }
      } catch (error) {
        logger.error('[Create Product] ERROR:', error)
        if (error instanceof ORPCError) throw error
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }),

  updateProduct: protectedProcedure
    .route({
      operationId: 'updateProduct',
      summary: 'Update Product',
      description:
        'Updates an existing product. Ensures the product belongs to the vendor.',
      tags: ['Vendor Product'],
    })
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        descriptionShort: z.string().optional(),
        brand: z.string().optional(),
        sku: z.string().optional(),
        categoryId: z.string().optional(),
        price: z.string().optional(),
        stock: z.coerce.number().int().optional(),
        status: z
          .enum(['draft', 'active', 'out_of_stock', 'archived'])
          .optional(),
        keyFeatures: z.array(z.string()).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const vendorId = await getVendorId(context.session.user.id)
      const vendorUserId = context.session.user.id

      // Get existing product to check stock levels
      const existingProduct = await db
        .select()
        .from(products)
        .where(and(eq(products.id, input.id), eq(products.vendorId, vendorId)))
        .limit(1)

      if (existingProduct.length === 0) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Product not found or unauthorized',
        })
      }

      const oldStock = existingProduct[0].stock
      const oldProduct = existingProduct[0]

      // Prepare update data
      const updateData: any = {
        ...input,
        updatedAt: new Date(),
      }

      // If keyFeatures is provided, update the content field
      if (input.keyFeatures !== undefined) {
        const existingContent = (oldProduct.content as any) || {}
        updateData.content = {
          ...existingContent,
          keyFeatures: input.keyFeatures,
        }
        delete updateData.keyFeatures
      }

      const result = await db
        .update(products)
        .set(updateData)
        .where(and(eq(products.id, input.id), eq(products.vendorId, vendorId)))
        .returning()

      if (result.length === 0) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Product not found or unauthorized',
        })
      }

      const updatedProduct = result[0]

      // Check stock levels and send notifications if needed
      if (input.stock !== undefined && input.stock !== oldStock) {
        const newStock = input.stock
        const lowStockThreshold = 5

        // Out of stock notification
        if (newStock === 0 && oldStock > 0) {
          await notificationService.notifyOutOfStock(
            vendorUserId,
            updatedProduct.id,
            updatedProduct.title,
          )
        }
        // Low stock notification
        else if (
          newStock > 0 &&
          newStock <= lowStockThreshold &&
          (oldStock > lowStockThreshold || oldStock === 0)
        ) {
          await notificationService.notifyLowStock(
            vendorUserId,
            updatedProduct.id,
            updatedProduct.title,
            newStock,
            lowStockThreshold,
          )
        }
      }

      return updatedProduct
    }),

  deleteProduct: protectedProcedure
    .route({
      operationId: 'deleteProduct',
      summary: 'Delete Product',
      description:
        'Deletes a product. Ensures the product belongs to the vendor.',
      tags: ['Vendor Product'],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const vendorId = await getVendorId(context.session.user.id)

      // Helper function to extract S3 key from URL
      const extractS3Key = (url: string | null): string | null => {
        if (!url) return null

        // Match everything after '/images/' until a '?' or end of string
        const match = url.match(/\/images\/(.+?)(?:\?|$)/)
        if (match) {
          return match[1]
        }
        return null
      }

      await db.transaction(async (tx) => {
        // Get product images before deleting
        const images = await tx
          .select()
          .from(productImages)
          .where(eq(productImages.productId, input.id))

        // Collect S3 files to delete
        const filesToDelete: Array<string> = []
        for (const img of images) {
          const key = extractS3Key(img.url)
          if (key) filesToDelete.push(key)
        }

        // Delete product (cascades to productImages due to foreign key)
        const result = await tx
          .delete(products)
          .where(
            and(eq(products.id, input.id), eq(products.vendorId, vendorId)),
          )
          .returning()

        if (result.length === 0) {
          throw new ORPCError('NOT_FOUND', {
            message: 'Product not found or unauthorized',
          })
        }

        // Delete files from S3
        const deletedFiles: Array<string> = []
        for (const fileKey of filesToDelete) {
          try {
            await context.storage.deleteFile(fileKey)
            deletedFiles.push(fileKey)
            logger.debug(`[Vendor Delete Product] Deleted S3 file: ${fileKey}`)
          } catch (error) {
            logger.error(
              `[Vendor Delete Product] Failed to delete file ${fileKey}:`,
              error,
            )
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
          .where(eq(vendors.id, vendorId))

        logger.info(
          `[Vendor Delete Product] Deleted product ${input.id}, removed ${deletedFiles.length} images from S3`,
        )
      })

      return { success: true }
    }),
})
