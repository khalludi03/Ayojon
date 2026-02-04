import { z } from "zod";
import { protectedProcedure } from "../index";
import { db, address } from "@my-better-t-app/db";
import { eq, and, desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

const addressInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  type: z.enum(["home", "office"]),
  isDefault: z.boolean().optional().default(false),
});

const updateAddressSchema = addressInputSchema.partial().extend({
  id: z.string().min(1),
});

export const addressRouter = {
  list: protectedProcedure
    .route({
      method: "GET",
      path: "/addresses",
      operationId: "listAddresses",
      summary: "List User Addresses",
      description: "Get all saved addresses for the authenticated user",
      tags: ["Address"],
      successStatus: 200,
    })
    .output(
      z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          phone: z.string(),
          addressLine1: z.string(),
          addressLine2: z.string().nullable(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
          type: z.enum(["home", "office"]),
          isDefault: z.boolean(),
          createdAt: z.date(),
          updatedAt: z.date(),
        }),
      ),
    )
    .handler(async ({ context }) => {
      const addresses = await db
        .select()
        .from(address)
        .where(eq(address.userId, context.session.user.id))
        .orderBy(desc(address.isDefault), desc(address.createdAt));

      return addresses;
    }),

  create: protectedProcedure
    .route({
      method: "POST",
      path: "/addresses",
      operationId: "createAddress",
      summary: "Create Address",
      description: "Create a new address for the authenticated user (max 5 addresses)",
      tags: ["Address"],
      successStatus: 201,
    })
    .input(addressInputSchema)
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string(),
        addressLine1: z.string(),
        addressLine2: z.string().nullable(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
        type: z.enum(["home", "office"]),
        isDefault: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    )
    .handler(async ({ context, input }) => {
      // Check if user has reached the limit of 5 addresses
      const existingAddresses = await db
        .select()
        .from(address)
        .where(eq(address.userId, context.session.user.id));

      if (existingAddresses.length >= 5) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Maximum 5 addresses allowed",
        });
      }

      // If this is set as default, unset other defaults
      if (input.isDefault) {
        await db
          .update(address)
          .set({ isDefault: false })
          .where(eq(address.userId, context.session.user.id));
      }

      // If this is the first address, make it default
      const shouldBeDefault = existingAddresses.length === 0 || input.isDefault;

      // Generate ID
      const id = crypto.randomUUID();

      const [newAddress] = await db
        .insert(address)
        .values({
          id,
          userId: context.session.user.id,
          ...input,
          isDefault: shouldBeDefault,
        })
        .returning();

      return newAddress!;
    }),

  update: protectedProcedure
    .route({
      method: "PUT",
      path: "/addresses/:id",
      operationId: "updateAddress",
      summary: "Update Address",
      description: "Update an existing address",
      tags: ["Address"],
      successStatus: 200,
    })
    .input(updateAddressSchema)
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        phone: z.string(),
        addressLine1: z.string(),
        addressLine2: z.string().nullable(),
        city: z.string(),
        state: z.string(),
        postalCode: z.string(),
        country: z.string(),
        type: z.enum(["home", "office"]),
        isDefault: z.boolean(),
        createdAt: z.date(),
        updatedAt: z.date(),
      }),
    )
    .handler(async ({ context, input }) => {
      const { id, ...updateData } = input;

      // Check if address exists and belongs to user
      const existingAddress = await db
        .select()
        .from(address)
        .where(
          and(eq(address.id, id), eq(address.userId, context.session.user.id)),
        )
        .limit(1);

      if (existingAddress.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Address not found",
        });
      }

      // If setting as default, unset other defaults
      if (updateData.isDefault) {
        await db
          .update(address)
          .set({ isDefault: false })
          .where(eq(address.userId, context.session.user.id));
      }

      const [updatedAddress] = await db
        .update(address)
        .set(updateData)
        .where(eq(address.id, id))
        .returning();

      return updatedAddress!;
    }),

  delete: protectedProcedure
    .route({
      method: "DELETE",
      path: "/addresses/:id",
      operationId: "deleteAddress",
      summary: "Delete Address",
      description: "Delete an address",
      tags: ["Address"],
      successStatus: 200,
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      // Check if address exists and belongs to user
      const existingAddress = await db
        .select()
        .from(address)
        .where(
          and(
            eq(address.id, input.id),
            eq(address.userId, context.session.user.id),
          ),
        )
        .limit(1);

      if (existingAddress.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Address not found",
        });
      }

      const wasDefault = existingAddress[0]!.isDefault;

      await db.delete(address).where(eq(address.id, input.id));

      // If deleted address was default, set another address as default
      if (wasDefault) {
        const remainingAddresses = await db
          .select()
          .from(address)
          .where(eq(address.userId, context.session.user.id))
          .limit(1);

        if (remainingAddresses.length > 0) {
          await db
            .update(address)
            .set({ isDefault: true })
            .where(eq(address.id, remainingAddresses[0]!.id));
        }
      }

      return { success: true };
    }),

  setDefault: protectedProcedure
    .route({
      method: "PUT",
      path: "/addresses/:id/set-default",
      operationId: "setDefaultAddress",
      summary: "Set Default Address",
      description: "Set an address as the default address",
      tags: ["Address"],
      successStatus: 200,
    })
    .input(z.object({ id: z.string() }))
    .output(z.object({ success: z.boolean() }))
    .handler(async ({ context, input }) => {
      // Check if address exists and belongs to user
      const existingAddress = await db
        .select()
        .from(address)
        .where(
          and(
            eq(address.id, input.id),
            eq(address.userId, context.session.user.id),
          ),
        )
        .limit(1);

      if (existingAddress.length === 0) {
        throw new ORPCError("NOT_FOUND", {
          message: "Address not found",
        });
      }

      // Unset all defaults for this user
      await db
        .update(address)
        .set({ isDefault: false })
        .where(eq(address.userId, context.session.user.id));

      // Set the specified address as default
      await db
        .update(address)
        .set({ isDefault: true })
        .where(eq(address.id, input.id));

      return { success: true };
    }),
};
