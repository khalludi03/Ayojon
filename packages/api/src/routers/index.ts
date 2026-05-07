import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '../index'
import { storageRouter } from './storage'
import { vendorRouter } from './vendor'
import { productRouter } from './product'
import { adminRouter } from './admin'
import { orderRouter } from './order'
import { addressRouter } from './address'
import { wishlistRouter } from './wishlist'
import { cartRouter } from './cart'
import { notificationRouter } from './notification'
import { reviewRouter } from './review'
import { homepageRouter } from './homepage'
import { couponRouter } from './coupon'

export const appRouter = router({
  storage: storageRouter,
  vendor: vendorRouter,
  product: productRouter,
  order: orderRouter,
  address: addressRouter,
  wishlist: wishlistRouter,
  cart: cartRouter,
  notifications: notificationRouter,
  review: reviewRouter,
  vendorProduct: productRouter,
  catalog: productRouter,
  admin: adminRouter,
  homepage: homepageRouter,
  coupon: couponRouter,
  healthCheck: publicProcedure
    .route({
      method: 'GET',
      path: '/health',
      operationId: 'healthCheck',
      summary: 'Health Check',
      description:
        'Check if the API server is running and responding to requests',
      tags: ['System'],
      successStatus: 200,
    })
    .output(z.string().describe('Health status message'))
    .handler(() => {
      return 'OK'
    }),
  privateData: protectedProcedure
    .route({
      method: 'GET',
      path: '/private',
      operationId: 'getPrivateData',
      summary: 'Get Private User Data',
      description:
        'Fetch private user data for the authenticated user. Requires a valid session cookie.',
      tags: ['User', 'Authentication'],
      successStatus: 200,
    })
    .output(
      z.object({
        message: z.string().describe('A private message for the user'),
        user: z
          .object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
          })
          .describe("The authenticated user's information"),
      }),
    )
    .handler(({ context }) => {
      return {
        message: 'This is private',
        user: context.session.user,
      }
    }),
}) as any

export type AppRouter = typeof appRouter
