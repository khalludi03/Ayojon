import { z } from 'zod'
import { db } from '@my-better-t-app/db'
import { orders } from '@my-better-t-app/db/schema/orders'
import { products } from '@my-better-t-app/db/schema/products'
import { vendors } from '@my-better-t-app/db/schema/catalog'
import { desc, eq, sql } from 'drizzle-orm'
import { ORPCError } from '@orpc/server'
import { protectedProcedure, publicProcedure, router } from '../index'
import * as orderService from '../services/order-service'
import * as paymentService from '../services/payment-service'

export const orderRouter = router({
  placeOrder: protectedProcedure
    .route({
      method: 'POST',
      path: '/place',
      operationId: 'placeOrder',
      summary: 'Place a new order',
      tags: ['Orders'],
    })
    .input(
      z.object({
        orderNumber: z.string(),
        subtotal: z.number(),
        shippingCost: z.number(),
        tax: z.number(),
        discount: z.number(),
        total: z.number(),
        shipping: z.object({
          fullName: z.string(),
          phone: z.string(),
          addressLine1: z.string(),
          addressLine2: z.string().optional(),
          city: z.string(),
          division: z.string(),
          postalCode: z.string(),
        }),
        deliveryMethod: z.string().optional(),
        customerNote: z.string().optional(),
        payment: z.object({
          method: z.enum(['bkash', 'cod']),
          transactionId: z.string().optional(),
          senderMobile: z.string().optional(),
        }),
        items: z.array(
          z.object({
            productId: z.string(),
            vendorId: z.string(),
            title: z.string(),
            price: z.number(),
            quantity: z.number(),
            variantInfo: z.string().optional(),
            imageUrl: z.string().optional(),
          }),
        ),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      try {
        // Use the order service to create the order with proper initial status
        const order = await orderService.createOrder({
          userId,
          orderNumber: input.orderNumber,
          paymentMethod: input.payment.method,
          items: input.items,
          totals: {
            subtotal: input.subtotal,
            shippingCost: input.shippingCost,
            tax: input.tax,
            discount: input.discount,
            total: input.total,
          },
          shipping: input.shipping,
          deliveryMethod: input.deliveryMethod,
          customerNote: input.customerNote,
          paymentDetails: {
            transactionId: input.payment.transactionId,
            senderMobile: input.payment.senderMobile,
          },
        })

        // Update product stock and vendor sales
        await db.transaction(async (tx) => {
          for (const item of input.items) {
            // Update stock
            await tx
              .update(products)
              .set({
                stock: sql`${products.stock} - ${item.quantity}`,
              })
              .where(eq(products.id, item.productId))

            // Update vendor sales count
            await tx
              .update(vendors)
              .set({
                totalSales: sql`${vendors.totalSales} + 1`,
              })
              .where(eq(vendors.id, item.vendorId))
          }
        })

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentMethod: order.paymentMethod,
        }
      } catch (error) {
        console.error('Order placement failed:', error)
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to place order. Please try again.',
        })
      }
    }),

  submitPayment: protectedProcedure
    .route({
      method: 'POST',
      path: '/submit-payment',
      operationId: 'submitPayment',
      summary: 'Submit bKash Payment Proof',
      description:
        'Customer submits bKash transaction ID after making payment.',
      tags: ['Orders', 'Payments'],
    })
    .input(
      z.object({
        orderId: z.string(),
        transactionId: z.string().min(1, 'Transaction ID is required'),
        senderMobile: z.string().min(11, 'Mobile number is required'),
        amount: z.number().min(1, 'Amount is required'),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      const result = await paymentService.submitPaymentProof({
        orderId: input.orderId,
        transactionId: input.transactionId,
        senderMobile: input.senderMobile,
        amount: input.amount,
        userId,
      })

      if (!result.success) {
        throw new ORPCError('BAD_REQUEST', { message: result.error })
      }

      return {
        success: true,
        payment: result.payment,
      }
    }),

  listMyOrders: protectedProcedure
    .route({
      method: 'GET',
      path: '/my-orders',
      operationId: 'listMyOrders',
      summary: "List current user's orders",
      tags: ['Orders'],
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id

      const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, userId),
        orderBy: [desc(orders.createdAt)],
        with: {
          items: true,
        },
      })

      return userOrders
    }),

  getOrderDetails: protectedProcedure
    .route({
      method: 'GET',
      path: '/{id}',
      operationId: 'getOrderDetails',
      summary: 'Get order details',
      tags: ['Orders'],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id

      // Use order service to get full details including payment and payouts
      const order = await orderService.getOrderDetails(input.id, userId)

      if (!order) {
        throw new ORPCError('NOT_FOUND', { message: 'Order not found' })
      }

      return order
    }),

  cancelOrder: protectedProcedure
    .route({
      method: 'POST',
      path: '/{id}/cancel',
      operationId: 'cancelOrder',
      summary: 'Cancel an order',
      tags: ['Orders'],
    })
    .input(
      z.object({
        id: z.string(),
        reason: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id
      return await orderService.transitionOrderStatus(
        input.id,
        'cancelled',
        userId,
        input.reason,
      )
    }),

  trackOrder: publicProcedure
    .route({
      method: 'GET',
      path: '/track/{orderNumber}',
      operationId: 'trackOrder',
      summary: 'Track an order by its number',
      tags: ['Orders'],
    })
    .input(z.object({ orderNumber: z.string() }))
    .handler(async ({ input }) => {
      const order = await orderService.getOrderByNumber(input.orderNumber)

      if (!order) {
        throw new ORPCError('NOT_FOUND', { message: 'Order not found' })
      }

      return order
    }),
})
