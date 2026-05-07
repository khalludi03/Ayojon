import { z } from 'zod'
import { db } from '@my-better-t-app/db'
import { coupons } from '@my-better-t-app/db/schema/index'
import { and, eq, sql } from 'drizzle-orm'
import { ORPCError } from '@orpc/server'
import { nanoid } from 'nanoid'
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from '../index'

export const couponRouter = router({
  validateCoupon: publicProcedure
    .route({
      method: 'POST',
      path: '/validate',
      operationId: 'validateCoupon',
      summary: 'Validate Coupon',
      description:
        'Validates a coupon code and returns the discount details if valid.',
      tags: ['Coupon'],
    })
    .input(
      z.object({
        code: z.string().min(1).toUpperCase(),
        orderAmount: z.number().min(0),
      }),
    )
    .output(
      z.object({
        valid: z.boolean(),
        coupon: z
          .object({
            id: z.string(),
            code: z.string(),
            type: z.enum(['percentage', 'fixed', 'free_shipping']),
            value: z.number(),
            discountAmount: z.number(),
            message: z.string().optional(),
          })
          .optional(),
        error: z.string().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const now = new Date()

      const coupon = await db
        .select()
        .from(coupons)
        .where(and(eq(coupons.code, input.code), eq(coupons.status, 'active')))
        .limit(1)

      if (!coupon[0]) {
        return {
          valid: false,
          error: 'Invalid coupon code',
        }
      }

      const c = coupon[0]

      if (c.startsAt && new Date(c.startsAt) > now) {
        return {
          valid: false,
          error: 'This coupon is not yet active',
        }
      }

      if (c.endsAt && new Date(c.endsAt) < now) {
        return {
          valid: false,
          error: 'This coupon has expired',
        }
      }

      if (c.usageLimit !== null && c.usageCount >= c.usageLimit) {
        return {
          valid: false,
          error: 'This coupon has reached its usage limit',
        }
      }

      if (c.minOrderAmount !== null) {
        const minAmount = parseFloat(c.minOrderAmount)
        if (input.orderAmount < minAmount) {
          return {
            valid: false,
            error: `Minimum order amount is ৳${minAmount}`,
          }
        }
      }

      let discountAmount = 0
      const value = parseFloat(c.value)

      switch (c.type) {
        case 'percentage':
          discountAmount = (input.orderAmount * value) / 100
          break
        case 'fixed':
          discountAmount = value
          break
        case 'free_shipping':
          discountAmount = 0
          break
      }

      if (c.maxDiscountAmount !== null) {
        const maxDiscount = parseFloat(c.maxDiscountAmount)
        discountAmount = Math.min(discountAmount, maxDiscount)
      }

      discountAmount = Math.min(discountAmount, input.orderAmount)

      return {
        valid: true,
        coupon: {
          id: c.id,
          code: c.code,
          type: c.type,
          value,
          discountAmount: Math.round(discountAmount * 100) / 100,
          message:
            c.type === 'free_shipping'
              ? 'Free shipping applied!'
              : c.type === 'percentage'
                ? `${value}% discount applied!`
                : `৳${value} discount applied!`,
        },
      }
    }),

  incrementUsage: protectedProcedure
    .route({
      method: 'POST',
      operationId: 'incrementCouponUsage',
      summary: 'Increment Coupon Usage',
      description:
        'Increments the usage count of a coupon after successful order.',
      tags: ['Coupon'],
    })
    .input(
      z.object({
        couponId: z.string(),
      }),
    )
    .handler(async ({ input }) => {
      await db
        .update(coupons)
        .set({
          usageCount: sql`${coupons.usageCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(coupons.id, input.couponId))

      return { success: true }
    }),

  listCoupons: adminProcedure
    .route({
      method: 'POST',
      operationId: 'listCoupons',
      summary: 'List All Coupons',
      description: 'Lists all coupons for admin management.',
      tags: ['Admin', 'Coupon'],
    })
    .handler(async () => {
      const allCoupons = await db
        .select()
        .from(coupons)
        .orderBy(coupons.createdAt)

      return { coupons: allCoupons }
    }),

  createCoupon: adminProcedure
    .route({
      method: 'POST',
      operationId: 'createCoupon',
      summary: 'Create Coupon',
      description: 'Creates a new coupon.',
      tags: ['Admin', 'Coupon'],
    })
    .input(
      z.object({
        code: z.string().min(3).max(20).toUpperCase(),
        type: z.enum(['percentage', 'fixed', 'free_shipping']),
        value: z.number().positive(),
        minOrderAmount: z.number().positive().optional(),
        maxDiscountAmount: z.number().positive().optional(),
        usageLimit: z.number().int().positive().optional(),
        startsAt: z.coerce.date().optional(),
        endsAt: z.coerce.date().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const existing = await db
        .select()
        .from(coupons)
        .where(eq(coupons.code, input.code))
        .limit(1)

      if (existing[0]) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'Coupon code already exists',
        })
      }

      const id = nanoid()
      const coupon = await db
        .insert(coupons)
        .values({
          id,
          code: input.code,
          type: input.type,
          value: input.value.toString(),
          minOrderAmount: input.minOrderAmount?.toString(),
          maxDiscountAmount: input.maxDiscountAmount?.toString(),
          usageLimit: input.usageLimit,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
        })
        .returning()

      return coupon[0]
    }),

  updateCoupon: adminProcedure
    .route({
      method: 'PATCH',
      operationId: 'updateCoupon',
      summary: 'Update Coupon',
      description: 'Updates an existing coupon.',
      tags: ['Admin', 'Coupon'],
    })
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['active', 'expired', 'disabled']).optional(),
        usageLimit: z.number().int().positive().optional(),
        endsAt: z.coerce.date().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const { id, ...updates } = input

      const result = await db
        .update(coupons)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(coupons.id, id))
        .returning()

      if (result.length === 0) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Coupon not found',
        })
      }

      return result[0]
    }),

  deleteCoupon: adminProcedure
    .route({
      method: 'DELETE',
      operationId: 'deleteCoupon',
      summary: 'Delete Coupon',
      description: 'Deletes a coupon permanently.',
      tags: ['Admin', 'Coupon'],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input }) => {
      const result = await db
        .delete(coupons)
        .where(eq(coupons.id, input.id))
        .returning()

      if (result.length === 0) {
        throw new ORPCError('NOT_FOUND', {
          message: 'Coupon not found',
        })
      }

      return { success: true }
    }),
})
