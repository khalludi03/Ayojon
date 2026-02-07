import { z } from "zod";
import { protectedProcedure } from "../index";

export const storageRouter = {
  getUploadUrl: protectedProcedure
    .route({
      method: "POST",
      path: "/storage/upload-url",
      operationId: "getUploadUrl",
      summary: "Get Presigned Upload URL",
      description: "Generates a presigned URL for uploading a file directly to S3.",
      tags: ["Storage"],
    })
    .input(
      z.object({
        key: z.string().describe("The S3 key (path) for the file"),
        type: z.string().optional().describe("The MIME type of the file"),
      })
    )
    .output(
      z.object({
        url: z.string().describe("The presigned URL for PUT request"),
        publicUrl: z.string().describe("The final public URL of the file"),
        key: z.string().describe("The final S3 key"),
      })
    )
    .handler(async ({ input, context }) => {
      // Basic security: prepend user ID to key to prevent overwriting others' files
      const safeKey = `${context.session.user.id}/${input.key}`;
      
      const url = context.storage.getUploadPresignedUrl(safeKey, {
        type: input.type,
      });

      const publicUrl = context.storage.getPublicUrl(safeKey);

      return { url, publicUrl, key: safeKey };
    }),

  deleteFile: protectedProcedure
    .route({
      method: "POST",
      path: "/storage/delete",
      operationId: "deleteFile",
      summary: "Delete File from Storage",
      description: "Deletes a file from S3.",
      tags: ["Storage"],
    })
    .input(
      z.object({
        key: z.string().describe("The S3 key (path) for the file to delete"),
      })
    )
    .output(
      z.object({
        success: z.boolean(),
      })
    )
    .handler(async ({ input, context }) => {
      // Ensure users can only delete their own files
      if (!input.key.startsWith(`${context.session.user.id}/`)) {
        throw new Error("Unauthorized to delete this file");
      }

      await context.storage.deleteFile(input.key);
      return { success: true };
    }),
};
