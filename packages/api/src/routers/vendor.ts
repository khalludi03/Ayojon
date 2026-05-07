import { z } from 'zod'
import { db } from '@my-better-t-app/db'
import {
  orderItems,
  orders,
  platformSettings,
  user,
  vendorApplications,
  vendors,
} from '@my-better-t-app/db/schema/index'
import { and, desc, eq, gte, inArray, or, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { ORPCError } from '@orpc/server'
import { protectedProcedure, router } from '../index'
import * as orderService from '../services/order-service'
import * as payoutService from '../services/payout-service'
import * as notificationService from '../services/notification-service'

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export const vendorRouter = router({
  getOrders: protectedProcedure
    .route({
      operationId: 'getVendorOrders',
      summary: 'Get Vendor Orders',
      description: 'Get all orders containing products from this vendor.',
      tags: ['Vendor'],
    })
    .input(
      z.object({
        status: z.string().optional(),
        limit: z.coerce.number().int().min(1).max(1000).default(20),
        offset: z.coerce.number().int().min(0).default(0),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // 1. Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        throw new ORPCError('FORBIDDEN', {
          message: 'User is not a registered vendor',
        })
      }

      const vendorId = vendor.id

      // 2. Get order IDs that have items from this vendor
      const items = await db
        .select({ orderId: orderItems.orderId })
        .from(orderItems)
        .where(eq(orderItems.vendorId, vendorId))

      const orderIds = [...new Set(items.map((i) => i.orderId))]

      if (orderIds.length === 0) {
        return { data: [], total: 0 }
      }

      // 3. Get the full orders
      const whereClauses = [inArray(orders.id, orderIds)]
      if (input.status) {
        whereClauses.push(eq(orders.status, input.status as any))
      }

      const data = await db.query.orders.findMany({
        where: and(...whereClauses),
        orderBy: [desc(orders.createdAt)],
        limit: input.limit,
        offset: input.offset,
        with: {
          items: {
            where: eq(orderItems.vendorId, vendorId),
          },
          user: true,
        },
      })

      return {
        data,
        total: orderIds.length,
      }
    }),

  getOrderDetails: protectedProcedure
    .route({
      method: 'GET',
      path: '/orders/{orderId}',
      operationId: 'getVendorOrderDetails',
      summary: 'Get Vendor Order Details',
      description:
        "Get detailed information about a specific order containing vendor's products.",
      tags: ['Vendor'],
    })
    .input(
      z.object({
        orderId: z.string(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // 1. Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        throw new ORPCError('FORBIDDEN', {
          message: 'User is not a registered vendor',
        })
      }

      // 2. Verify order contains this vendor's items
      const item = await db.query.orderItems.findFirst({
        where: and(
          eq(orderItems.orderId, input.orderId),
          eq(orderItems.vendorId, vendor.id),
        ),
      })

      if (!item) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Order not found or does not contain your products',
        })
      }

      // 3. Get the full order details with only this vendor's items
      const order = await db.query.orders.findFirst({
        where: eq(orders.id, input.orderId),
        with: {
          items: {
            where: eq(orderItems.vendorId, vendor.id),
          },
          user: true,
          payments: true,
        },
      })

      if (!order) {
        throw new ORPCError('NOT_FOUND', { message: 'Order not found' })
      }

      return order
    }),

  updateOrderStatus: protectedProcedure
    .route({
      method: 'POST',
      operationId: 'updateVendorOrderStatus',
      summary: 'Update Vendor Order Status',
      description:
        'Allows a vendor to update the status of an order containing their products.',
      tags: ['Vendor'],
    })
    .input(
      z.object({
        orderId: z.string(),
        status: z.enum([
          'pending',
          'confirmed',
          'shipped',
          'delivered',
          'cancelled',
          'returned',
        ]),
        trackingNumber: z.string().optional(),
        reason: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id
      console.log(
        `[updateOrderStatus] Request from user ${userId} for order ${input.orderId} to status ${input.status}`,
      )

      // 1. Verify vendor ownership
      const [vendor] = await db
        .select({ id: vendors.id, name: vendors.name })
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        console.warn(`[updateOrderStatus] User ${userId} is not a vendor`)
        throw new ORPCError('FORBIDDEN', {
          message: 'User is not a registered vendor',
        })
      }

      console.log(
        `[updateOrderStatus] Vendor verified: ${vendor.id} (${vendor.name})`,
      )

      const item = await db.query.orderItems.findFirst({
        where: and(
          eq(orderItems.orderId, input.orderId),
          eq(orderItems.vendorId, vendor.id),
        ),
      })

      if (!item) {
        console.warn(
          `[updateOrderStatus] Order ${input.orderId} does not contain items for vendor ${vendor.id}`,
        )
        throw new ORPCError('FORBIDDEN', {
          message: 'Order does not belong to this vendor',
        })
      }

      // 2. Update the order status
      const updateData: any = {
        status: input.status,
        updatedAt: new Date(),
      }

      if (input.trackingNumber) {
        console.log(
          `[updateOrderStatus] Adding tracking number: ${input.trackingNumber}`,
        )
        updateData.trackingNumber = input.trackingNumber
      }

      console.log(
        `[updateOrderStatus] Executing transition for order ${input.orderId} to ${input.status}`,
      )
      try {
        // Use transitionOrderStatus to ensure state machine rules and side effects are applied
        const result = await orderService.transitionOrderStatus(
          input.orderId,
          input.status as any,
          userId,
          input.reason,
        )

        if (!result.success) {
          console.warn(`[updateOrderStatus] Transition failed: ${result.error}`)
          throw new ORPCError('BAD_REQUEST', { message: result.error })
        }

        // If tracking number provided, update it separately
        if (input.trackingNumber) {
          await orderService.updateOrderTracking(
            input.orderId,
            input.trackingNumber,
            vendor.id,
          )
        }

        console.log(
          `[updateOrderStatus] Order ${input.orderId} updated successfully to ${input.status}`,
        )
        return result.order
      } catch (err) {
        console.error(`[updateOrderStatus] TRANSITION FAILED:`, err)
        if (err instanceof ORPCError) throw err
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to update order status',
        })
      }
    }),

  getVendorProfile: protectedProcedure
    .route({
      operationId: 'getVendorProfile',
      summary: 'Get My Vendor Profile',
      description:
        'Gets the vendor profile for the currently authenticated user.',
      tags: ['Vendor'],
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id

      const vendor = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      return {
        vendor: vendor[0] ?? null,
      }
    }),

  submitVendorApplication: protectedProcedure
    .route({
      operationId: 'submitVendorApplication',
      summary: 'Submit Vendor Application',
      description:
        'Submits a new vendor application for the authenticated user.',
      tags: ['Vendor'],
    })
    .input(
      z.object({
        businessName: z.string().optional(),
        businessType: z.string().optional(),
        taxId: z.string().optional(),
        businessPhone: z.string().optional(),
        businessAddress: z
          .object({
            street: z.string().optional(),
            city: z.string().optional(),
            division: z.string().optional(),
            postalCode: z.string().optional(),
          })
          .optional(),
        yearsInBusiness: z.coerce.number().optional(),
        storeName: z.string().optional(),
        storeDescription: z.string().optional(),
        productCategories: z.array(z.string()).optional(),
        logoUrl: z.string().optional(),
        bannerUrl: z.string().optional(),
        tradeLicenseUrl: z.string().optional(),
        identificationUrl: z.string().optional(),
        bankDetailsUrl: z.string().optional(),
      }),
    )
    .output(
      z.object({
        applicationId: z.string(),
        status: z.string(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // Check for existing pending application
      const existing = await db
        .select()
        .from(vendorApplications)
        .where(
          and(
            eq(vendorApplications.userId, userId),
            eq(vendorApplications.status, 'pending'),
          ),
        )
        .limit(1)

      if (existing.length > 0) {
        throw new ORPCError('CONFLICT', {
          message: 'You already have a pending application.',
        })
      }

      const applicationId = nanoid()

      await db.transaction(async (tx) => {
        // Create application
        await tx.insert(vendorApplications).values({
          id: applicationId,
          userId,
          businessName: input.businessName || 'Unknown',
          businessType: (input.businessType as any) || 'individual',
          taxId: input.taxId || 'Unknown',
          businessPhone: input.businessPhone || 'Unknown',
          businessAddress: JSON.stringify(input.businessAddress || {}),
          yearsInBusiness: input.yearsInBusiness || 0,
          storeName: input.storeName || 'Unknown Store',
          storeDescription: input.storeDescription,
          productCategories: JSON.stringify(input.productCategories || []),
          logoUrl: input.logoUrl,
          bannerUrl: input.bannerUrl,
          tradeLicenseUrl: input.tradeLicenseUrl,
          identificationUrl: input.identificationUrl,
          bankDetailsUrl: input.bankDetailsUrl,
          status: 'pending',
        })

        // Update user status
        await tx
          .update(user)
          .set({
            vendorStatus: 'pending',
          })
          .where(eq(user.id, userId))
      })

      return {
        applicationId,
        status: 'pending',
      }
    }),

  getVendorApplicationStatus: protectedProcedure
    .route({
      operationId: 'getVendorApplicationStatus',
      summary: 'Get Vendor Application Status',
      description: "Gets the status of the current user's vendor application.",
      tags: ['Vendor'],
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id

      const application = await db
        .select()
        .from(vendorApplications)
        .where(eq(vendorApplications.userId, userId))
        .orderBy(desc(vendorApplications.submittedAt))
        .limit(1)

      return {
        application: application[0] ?? null,
      }
    }),

  updateVendorProfile: protectedProcedure
    .route({
      operationId: 'updateVendorProfile',
      summary: 'Update Vendor Profile',
      description: 'Allows a vendor to update their store profile information.',
      tags: ['Vendor'],
    })
    .input(
      z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        logoUrl: z.string().optional().nullable(),
        bannerUrl: z.string().optional().nullable(),
        location: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        website: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // Get current vendor profile
      const [currentVendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!currentVendor) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Vendor profile not found.',
        })
      }

      // Helper function to extract S3 key from URL
      const extractS3Key = (url: string | null): string | null => {
        if (!url) return null

        // Match everything after '/images/' until a '?' or end of string
        // This correctly captures 'USER_ID/path/to/file'
        const match = url.match(/\/images\/(.+?)(?:\?|$)/)
        if (match) {
          return match[1] ?? null
        }

        // Fallback for raw keys or non-URL strings
        if (url.includes('/') && !url.startsWith('http')) return url

        return null
      }

      // Collect files to delete
      const filesToDelete: Array<string> = []

      // Check if logo is being replaced or removed
      if (input.logoUrl !== undefined) {
        const oldLogoKey = extractS3Key(currentVendor.logoUrl)
        const newLogoKey = extractS3Key(input.logoUrl)

        // If we have an old key and either:
        // 1. A new key is provided that's different
        // 2. The input is explicitly null (deletion)
        if (
          oldLogoKey &&
          (oldLogoKey !== newLogoKey || input.logoUrl === null)
        ) {
          filesToDelete.push(oldLogoKey)
        }
      }

      // Check if banner is being replaced or removed
      if (input.bannerUrl !== undefined) {
        const oldBannerKey = extractS3Key(currentVendor.bannerUrl)
        const newBannerKey = extractS3Key(input.bannerUrl)

        if (
          oldBannerKey &&
          (oldBannerKey !== newBannerKey || input.bannerUrl === null)
        ) {
          filesToDelete.push(oldBannerKey)
        }
      }

      // Delete old files from S3
      const deletedFiles: Array<string> = []
      for (const fileKey of filesToDelete) {
        try {
          await context.storage.deleteFile(fileKey)
          deletedFiles.push(fileKey)
          console.log(`[Vendor Update] Deleted old file: ${fileKey}`)
        } catch (error) {
          console.error(
            `[Vendor Update] Failed to delete file ${fileKey}:`,
            error,
          )
          // Continue even if deletion fails
        }
      }

      // Build update object with only provided fields
      const updateData: Record<string, any> = {
        updatedAt: new Date(),
      }

      if (input.name !== undefined) updateData.name = input.name
      if (input.description !== undefined)
        updateData.description = input.description
      if (input.logoUrl !== undefined) updateData.logoUrl = input.logoUrl
      if (input.bannerUrl !== undefined) updateData.bannerUrl = input.bannerUrl
      if (input.location !== undefined) updateData.location = input.location
      if (input.address !== undefined) updateData.address = input.address
      if (input.phone !== undefined) updateData.phone = input.phone
      if (input.email !== undefined) updateData.email = input.email
      if (input.website !== undefined) updateData.website = input.website

      // Update vendor profile
      const updated = await db
        .update(vendors)
        .set(updateData)
        .where(eq(vendors.userId, userId))
        .returning()

      return {
        success: true,
        vendor: updated[0],
        deletedFiles: deletedFiles.length > 0 ? deletedFiles : undefined,
      }
    }),

  getDashboardStats: protectedProcedure
    .route({
      operationId: 'getVendorDashboardStats',
      summary: 'Get Vendor Dashboard Statistics',
      description:
        'Get KPI metrics for the vendor dashboard including revenue, orders, and ratings.',
      tags: ['Vendor'],
    })
    .output(
      z.object({
        totalRevenue: z.string(),
        ordersThisMonth: z.number(),
        pendingOrders: z.number(),
        storeRating: z.number(),
        vendorScore: z.number(),
        revenueGrowth: z.number().optional(),
        ordersGrowth: z.number().optional(),
      }),
    )
    .handler(async ({ context }) => {
      const userId = context.session.user.id

      // Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        return {
          totalRevenue: '0',
          ordersThisMonth: 0,
          pendingOrders: 0,
          storeRating: 0,
          vendorScore: 0,
        }
      }

      const vendorId = vendor.id

      // Get total revenue from vendor's items in delivered orders (after commission deduction)
      const vendorItems = await db
        .select({
          price: orderItems.price,
          quantity: orderItems.quantity,
          status: orders.status,
          createdAt: orders.createdAt,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orderItems.vendorId, vendorId))

      // Get platform commission rate
      const settings = await db.query.platformSettings.findFirst({
        where: eq(platformSettings.id, 'current'),
      })
      const commissionRate = settings?.platformCommission ?? 10

      console.log('[Vendor Metrics] Commission Rate:', commissionRate)
      console.log('[Vendor Metrics] Settings:', settings)

      // Calculate vendor earnings (subtotal - commission) for delivered orders only
      const totalRevenue = vendorItems
        .filter((item) =>
          [
            'delivered',
            'vendor_paid',
            'cash_collected',
            'settlement_ready',
            'vendor_settled',
          ].includes(item.status),
        )
        .reduce((sum, item) => {
          const itemTotal = parseFloat(item.price) * item.quantity
          const commissionAmount = (itemTotal * commissionRate) / 100
          const vendorAmount = itemTotal - commissionAmount
          console.log('[Vendor Metrics] Item:', {
            price: item.price,
            quantity: item.quantity,
            status: item.status,
            itemTotal,
            commissionAmount,
            vendorAmount,
          })
          return sum + vendorAmount
        }, 0)

      console.log(
        '[Vendor Metrics] Total Revenue (after commission):',
        totalRevenue,
      )

      // Orders this month
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const stats = await db
        .select({
          orderId: orderItems.orderId,
          status: orders.status,
          createdAt: orders.createdAt,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(eq(orderItems.vendorId, vendorId))

      const ordersThisMonth = new Set(
        stats.filter((s) => s.createdAt >= startOfMonth).map((s) => s.orderId),
      ).size

      const pendingOrders = new Set(
        stats
          .filter((s) =>
            ['pending', 'placed', 'payment_received'].includes(s.status),
          )
          .map((s) => s.orderId),
      ).size

      return {
        totalRevenue: totalRevenue.toFixed(2),
        ordersThisMonth,
        pendingOrders,
        storeRating: vendor.ratingAverage || 0,
        vendorScore: vendor.score || 0,
      }
    }),

  getRevenueData: protectedProcedure
    .route({
      operationId: 'getVendorRevenueData',
      summary: 'Get Vendor Revenue Chart Data',
      description:
        'Get daily revenue data for the last 30 days for chart visualization.',
      tags: ['Vendor'],
    })
    .output(
      z.array(
        z.object({
          date: z.string(),
          revenue: z.number(),
        }),
      ),
    )
    .handler(async ({ context }) => {
      const userId = context.session.user.id

      // Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        // Return 30 days of zero data
        const data = []
        const today = new Date()
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          data.push({
            date: date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            revenue: 0,
          })
        }
        return data
      }

      // Get orders from last 30 days containing vendor items
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const vendorId = vendor.id
      const recentItems = await db
        .select({
          createdAt: orders.createdAt,
          price: orderItems.price,
          quantity: orderItems.quantity,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .where(
          and(
            eq(orderItems.vendorId, vendorId),
            gte(orders.createdAt, thirtyDaysAgo),
            or(
              // bKash orders
              sql`${orders.status} IN ('delivered', 'vendor_paid')`,
              // COD orders
              sql`${orders.status} IN ('cash_collected', 'settlement_ready', 'vendor_settled')`,
            ),
          ),
        )

      // Group by date
      const revenueByDate = new Map<string, number>()
      const today = new Date()

      // Initialize all 30 days with 0
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const key = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
        revenueByDate.set(key, 0)
      }

      // Get platform commission rate
      const settingsForChart = await db.query.platformSettings.findFirst({
        where: eq(platformSettings.id, 'current'),
      })
      const commissionRateForChart = settingsForChart?.platformCommission ?? 10

      console.log('[Vendor Chart] Commission Rate:', commissionRateForChart)

      // Add actual revenue (vendor earnings after commission)
      recentItems.forEach((item) => {
        const date = new Date(item.createdAt)
        const key = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
        const current = revenueByDate.get(key) || 0
        const itemTotal = parseFloat(item.price) * item.quantity
        const commissionAmount = (itemTotal * commissionRateForChart) / 100
        const vendorAmount = itemTotal - commissionAmount
        console.log('[Vendor Chart] Item:', {
          date: key,
          itemTotal,
          commissionAmount,
          vendorAmount,
        })
        revenueByDate.set(key, current + vendorAmount)
      })

      // Convert to array
      return Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
        date,
        revenue,
      }))
    }),

  getRecentOrders: protectedProcedure
    .route({
      operationId: 'getVendorRecentOrders',
      summary: 'Get Recent Vendor Orders',
      description: 'Get the most recent orders for the vendor dashboard.',
      tags: ['Vendor'],
    })
    .input(
      z.object({
        limit: z.coerce.number().int().min(1).max(50).default(10),
      }),
    )
    .output(
      z.array(
        z.object({
          id: z.string(),
          orderNumber: z.string(),
          customerName: z.string(),
          items: z.number(),
          total: z.string(),
          status: z.string(),
          date: z.string(),
        }),
      ),
    )
    .handler(async ({ context, input }) => {
      const userId = context.session.user.id

      // Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        return []
      }

      const vendorId = vendor.id

      // Get recent orders containing items from this vendor
      const results = await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          customerName: user.name,
          status: orders.status,
          createdAt: orders.createdAt,
          itemPrice: orderItems.price,
          itemQuantity: orderItems.quantity,
        })
        .from(orderItems)
        .innerJoin(orders, eq(orderItems.orderId, orders.id))
        .innerJoin(user, eq(orders.userId, user.id))
        .where(eq(orderItems.vendorId, vendorId))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit * 5) // Fetch more because one order might have multiple items

      // Group by order ID to count items and sum vendor-specific total
      const orderMap = new Map<string, any>()

      results.forEach((row) => {
        if (!orderMap.has(row.id)) {
          orderMap.set(row.id, {
            id: row.id,
            orderNumber: row.orderNumber,
            customerName: row.customerName || 'Unknown',
            items: 0,
            vendorTotal: 0,
            status: row.status,
            date: row.createdAt.toISOString(),
          })
        }

        const entry = orderMap.get(row.id)
        entry.items += row.itemQuantity
        entry.vendorTotal += parseFloat(row.itemPrice) * row.itemQuantity
      })

      return Array.from(orderMap.values())
        .slice(0, input.limit)
        .map((order) => ({
          ...order,
          total: order.vendorTotal.toFixed(2),
        }))
    }),

  getNotifications: protectedProcedure
    .route({
      operationId: 'getVendorNotifications',
      summary: 'Get Vendor Notifications',
      description: 'Get recent notifications for the vendor.',
      tags: ['Vendor'],
    })
    .output(
      z.array(
        z.object({
          id: z.string(),
          type: z.enum(['order', 'return', 'stock']),
          title: z.string(),
          description: z.string(),
          time: z.string(),
          unread: z.boolean(),
        }),
      ),
    )
    .handler(async ({ context }) => {
      const userId = context.session.user.id

      // Get notifications from database
      const notifications = await notificationService.getUserNotifications(
        userId,
        10,
        0,
      )

      // Map database notifications to the frontend format
      return notifications.map((notification) => {
        // Map notification types to frontend types
        let type: 'order' | 'return' | 'stock' = 'order'
        if (notification.type === 'return_request') {
          type = 'return'
        } else if (
          notification.type === 'low_stock_alert' ||
          notification.type === 'out_of_stock_alert'
        ) {
          type = 'stock'
        } else if (
          notification.type === 'new_order' ||
          notification.type === 'order_status_updated'
        ) {
          type = 'order'
        }

        // Format time relative to now
        const timeAgo = formatTimeAgo(notification.createdAt)

        return {
          id: notification.id,
          type,
          title: notification.title,
          description: notification.message,
          time: timeAgo,
          unread: !notification.isRead,
        }
      })
    }),

  getNotificationsUnreadCount: protectedProcedure
    .route({
      operationId: 'getVendorNotificationsUnreadCount',
      summary: 'Get Vendor Unread Notifications Count',
      description: 'Get the count of unread notifications for the vendor.',
      tags: ['Vendor'],
    })
    .output(z.object({ count: z.number() }))
    .handler(async ({ context }) => {
      const userId = context.session.user.id
      const count = await notificationService.getUnreadCount(userId)
      return { count }
    }),

  markAllNotificationsAsRead: protectedProcedure
    .route({
      method: 'POST',
      operationId: 'markAllVendorNotificationsAsRead',
      summary: 'Clear All Notifications',
      description: 'Delete all vendor notifications.',
      tags: ['Vendor'],
    })
    .input(z.object({}))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context }) => {
      const userId = context.session.user.id
      await notificationService.deleteAllNotifications(userId)
      return { success: true }
    }),

  // ====================================================================
  // New Payment Flow Endpoints
  // ====================================================================

  confirmOrder: protectedProcedure
    .route({
      method: 'POST',
      operationId: 'confirmOrder',
      summary: 'Confirm Order',
      description:
        "Vendor confirms a COD order. This moves it from 'placed' to 'confirmed'.",
      tags: ['Vendor', 'Orders'],
    })
    .input(z.object({ orderId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        throw new ORPCError('FORBIDDEN', {
          message: 'User is not a registered vendor',
        })
      }

      const hasItems = await orderService.vendorOwnsOrderItems(
        input.orderId,
        vendor.id,
      )
      if (!hasItems) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You do not have items in this order',
        })
      }

      const result = await orderService.transitionOrderStatus(
        input.orderId,
        'confirmed',
        userId,
      )

      if (!result.success) {
        throw new ORPCError('BAD_REQUEST', { message: result.error })
      }

      return result.order
    }),

  markOrderShipped: protectedProcedure
    .route({
      method: 'POST',
      operationId: 'markOrderShipped',
      summary: 'Mark Order as Shipped',
      description:
        'Vendor marks an order as shipped with optional tracking number. Works for both bKash and COD orders.',
      tags: ['Vendor', 'Orders'],
    })
    .input(
      z.object({
        orderId: z.string(),
        trackingNumber: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // 1. Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        throw new ORPCError('FORBIDDEN', {
          message: 'User is not a registered vendor',
        })
      }

      // 2. Verify vendor owns items in this order
      const hasItems = await orderService.vendorOwnsOrderItems(
        input.orderId,
        vendor.id,
      )
      if (!hasItems) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You do not have items in this order',
        })
      }

      // 3. Update tracking number if provided
      if (input.trackingNumber) {
        await orderService.updateOrderTracking(
          input.orderId,
          input.trackingNumber,
          vendor.id,
        )
      }

      // 4. Transition order to shipped status
      const result = await orderService.transitionOrderStatus(
        input.orderId,
        'shipped',
        userId,
      )

      if (!result.success) {
        throw new ORPCError('BAD_REQUEST', { message: result.error })
      }

      return result.order
    }),

  markOrderDelivered: protectedProcedure
    .route({
      method: 'POST',
      operationId: 'markOrderDelivered',
      summary: 'Mark Order as Delivered',
      description:
        'Vendor marks an order as delivered. For COD orders, this also records cash collection.',
      tags: ['Vendor', 'Orders'],
    })
    .input(z.object({ orderId: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        throw new ORPCError('FORBIDDEN', {
          message: 'User is not a registered vendor',
        })
      }

      const hasItems = await orderService.vendorOwnsOrderItems(
        input.orderId,
        vendor.id,
      )
      if (!hasItems) {
        throw new ORPCError('FORBIDDEN', {
          message: 'You do not have items in this order',
        })
      }

      const result = await orderService.transitionOrderStatus(
        input.orderId,
        'delivered',
        userId,
      )

      if (!result.success) {
        throw new ORPCError('BAD_REQUEST', { message: result.error })
      }

      return result.order
    }),

  getVendorPayoutHistory: protectedProcedure
    .route({
      method: 'GET',
      operationId: 'getVendorPayoutHistory',
      summary: 'Get Vendor Payout History',
      description: 'View payout history for the logged-in vendor.',
      tags: ['Vendor', 'Payouts'],
    })
    .input(
      z.object({
        status: z
          .enum(['pending', 'processing', 'completed', 'failed'])
          .optional(),
        limit: z.coerce.number().int().min(1).max(100).default(50),
        offset: z.coerce.number().int().min(0).default(0),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        throw new ORPCError('FORBIDDEN', {
          message: 'User is not a registered vendor',
        })
      }

      const payouts = await payoutService.getVendorPayouts(
        vendor.id,
        input.status,
        input.limit,
        input.offset,
      )

      return {
        payouts,
        total: payouts.length,
      }
    }),

  getVendorPayoutStats: protectedProcedure
    .route({
      method: 'GET',
      operationId: 'getVendorPayoutStats',
      summary: 'Get Vendor Payout Statistics',
      description:
        "Get statistics about vendor's payouts (pending and completed amounts).",
      tags: ['Vendor', 'Payouts'],
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id

      // Get vendor profile
      const [vendor] = await db
        .select()
        .from(vendors)
        .where(eq(vendors.userId, userId))
        .limit(1)

      if (!vendor) {
        throw new ORPCError('FORBIDDEN', {
          message: 'User is not a registered vendor',
        })
      }

      const stats = await payoutService.getVendorPayoutStats(vendor.id)
      return stats
    }),
})
