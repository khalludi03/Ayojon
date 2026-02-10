import { z } from "zod";
import { protectedProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { orders, orderItems } from "@my-better-t-app/db/schema/orders";
import { products } from "@my-better-t-app/db/schema/products";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ORPCError } from "@orpc/server";

export const orderRouter = os.router({
  placeOrder: protectedProcedure
    .route({
      method: "POST",
      path: "/place",
      operationId: "placeOrder",
      summary: "Place a new order",
      tags: ["Orders"],
    })
    .input(z.object({
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
      payment: z.object({
        method: z.string(),
        transactionId: z.string().optional(),
      }),
      items: z.array(z.object({
        productId: z.string(),
        vendorId: z.string(),
        title: z.string(),
        price: z.number(),
        quantity: z.number(),
        variantInfo: z.string().optional(),
      })),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const orderId = nanoid();

      try {
        return await db.transaction(async (tx) => {
          // 1. Create the order
          await tx.insert(orders).values({
            id: orderId,
            orderNumber: input.orderNumber,
            userId,
            status: "pending",
            paymentStatus: input.payment.transactionId ? "paid" : "pending",
            subtotal: input.subtotal.toString(),
            shippingCost: input.shippingCost.toString(),
            tax: input.tax.toString(),
            discount: input.discount.toString(),
            total: input.total.toString(),
            shippingName: input.shipping.fullName,
            shippingPhone: input.shipping.phone,
            shippingAddressLine1: input.shipping.addressLine1,
            shippingAddressLine2: input.shipping.addressLine2,
            shippingCity: input.shipping.city,
            shippingDivision: input.shipping.division,
            shippingPostalCode: input.shipping.postalCode,
            deliveryMethod: input.deliveryMethod,
            paymentMethod: input.payment.method,
            paymentTransactionId: input.payment.transactionId,
          });

          // 2. Create order items
          for (const item of input.items) {
            await tx.insert(orderItems).values({
              id: nanoid(),
              orderId,
              productId: item.productId,
              vendorId: item.vendorId,
              title: item.title,
              price: item.price.toString(),
              quantity: item.quantity,
              variantInfo: item.variantInfo,
            });

            // 3. Update stock (optional but recommended)
            await tx
              .update(products)
              .set({
                stock: sql`stock - ${item.quantity}`,
              })
              .where(eq(products.id, item.productId));
          }

          return { id: orderId, orderNumber: input.orderNumber };
        });
      } catch (error) {
        console.error("Order placement failed:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: "Failed to place order. Please try again.",
        });
      }
    }),

  listMyOrders: protectedProcedure
    .route({
      method: "GET",
      path: "/my-orders",
      operationId: "listMyOrders",
      summary: "List current user's orders",
      tags: ["Orders"],
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id;
      
      const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, userId),
        orderBy: [desc(orders.createdAt)],
        with: {
          items: true,
        }
      });

      return userOrders;
    }),

  getOrderDetails: protectedProcedure
    .route({
      method: "GET",
      path: "/{id}",
      operationId: "getOrderDetails",
      summary: "Get order details",
      tags: ["Orders"],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      
      const order = await db.query.orders.findFirst({
        where: and(eq(orders.id, input.id), eq(orders.userId, userId)),
        with: {
          items: true,
        }
      });

      if (!order) {
        throw new ORPCError("NOT_FOUND", { message: "Order not found" });
      }

      return order;
    }),
});

// For stock decrement SQL
import { sql } from "drizzle-orm";
