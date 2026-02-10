import { z } from "zod";
import { protectedProcedure, os } from "../index";
import { db } from "@my-better-t-app/db";
import { address } from "@my-better-t-app/db/schema/address";
import { eq, and, desc } from "drizzle-orm";
import { nanoid } from "nanoid";
import { ORPCError } from "@orpc/server";

export const addressRouter = os.router({
  listAddresses: protectedProcedure
    .route({
      method: "GET",
      path: "/",
      operationId: "listAddresses",
      summary: "List current user's addresses",
      tags: ["Address"],
    })
    .handler(async ({ context }) => {
      const userId = context.session.user.id;
      
      const addresses = await db
        .select()
        .from(address)
        .where(eq(address.userId, userId))
        .orderBy(desc(address.isDefault), desc(address.createdAt));

      return addresses;
    }),

  addAddress: protectedProcedure
    .route({
      method: "POST",
      path: "/",
      operationId: "addAddress",
      summary: "Add a new address",
      tags: ["Address"],
    })
    .input(z.object({
      name: z.string(),
      phone: z.string(),
      addressLine1: z.string(),
      addressLine2: z.string().optional(),
      city: z.string(),
      state: z.string(), // This maps to 'division' in the frontend
      postalCode: z.string(),
      country: z.string().default("Bangladesh"),
      type: z.enum(["home", "office"]),
      isDefault: z.boolean().default(false),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;
      const id = nanoid();

      return await db.transaction(async (tx) => {
        // If this is the first address or set as default, unset others
        if (input.isDefault) {
          await tx
            .update(address)
            .set({ isDefault: false })
            .where(eq(address.userId, userId));
        } else {
          // Check if it's the first address, if so make it default
          const existing = await tx
            .select()
            .from(address)
            .where(eq(address.userId, userId))
            .limit(1);
          
          if (existing.length === 0) {
            input.isDefault = true;
          }
        }

        const result = await tx
          .insert(address)
          .values({
            id,
            userId,
            name: input.name,
            phone: input.phone,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2,
            city: input.city,
            state: input.state,
            postalCode: input.postalCode,
            country: input.country,
            type: input.type,
            isDefault: input.isDefault,
          })
          .returning();

        return result[0];
      });
    }),

  updateAddress: protectedProcedure
    .route({
      method: "PATCH",
      path: "/{id}",
      operationId: "updateAddress",
      summary: "Update an address",
      tags: ["Address"],
    })
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      phone: z.string().optional(),
      addressLine1: z.string().optional(),
      addressLine2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      type: z.enum(["home", "office"]).optional(),
      isDefault: z.boolean().optional(),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      return await db.transaction(async (tx) => {
        // Verify ownership
        const existing = await tx
          .select()
          .from(address)
          .where(and(eq(address.id, input.id), eq(address.userId, userId)))
          .limit(1);

        if (existing.length === 0) {
          throw new ORPCError("NOT_FOUND", { message: "Address not found" });
        }

        // If setting as default, unset others
        if (input.isDefault) {
          await tx
            .update(address)
            .set({ isDefault: false })
            .where(eq(address.userId, userId));
        }

        const result = await tx
          .update(address)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(address.id, input.id))
          .returning();

        return result[0];
      });
    }),

  deleteAddress: protectedProcedure
    .route({
      method: "DELETE",
      path: "/{id}",
      operationId: "deleteAddress",
      summary: "Delete an address",
      tags: ["Address"],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      return await db.transaction(async (tx) => {
        // Verify ownership and check if it was default
        const existing = await tx
          .select()
          .from(address)
          .where(and(eq(address.id, input.id), eq(address.userId, userId)))
          .limit(1);

        if (existing.length === 0) {
          throw new ORPCError("NOT_FOUND", { message: "Address not found" });
        }

        const wasDefault = existing[0].isDefault;

        await tx
          .delete(address)
          .where(eq(address.id, input.id));

        // If we deleted the default address, make another one default
        if (wasDefault) {
          const nextAddress = await tx
            .select()
            .from(address)
            .where(eq(address.userId, userId))
            .limit(1);
          
          if (nextAddress.length > 0) {
            await tx
              .update(address)
              .set({ isDefault: true })
              .where(eq(address.id, nextAddress[0].id));
          }
        }

        return { success: true };
      });
    }),

  setDefault: protectedProcedure
    .route({
      method: "POST",
      path: "/{id}/default",
      operationId: "setDefaultAddress",
      summary: "Set an address as default",
      tags: ["Address"],
    })
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id;

      return await db.transaction(async (tx) => {
        // Verify ownership
        const existing = await tx
          .select()
          .from(address)
          .where(and(eq(address.id, input.id), eq(address.userId, userId)))
          .limit(1);

        if (existing.length === 0) {
          throw new ORPCError("NOT_FOUND", { message: "Address not found" });
        }

        // Unset current default
        await tx
          .update(address)
          .set({ isDefault: false })
          .where(eq(address.userId, userId));

        // Set new default
        const result = await tx
          .update(address)
          .set({ isDefault: true, updatedAt: new Date() })
          .where(eq(address.id, input.id))
          .returning();

        return result[0];
      });
    }),
});
