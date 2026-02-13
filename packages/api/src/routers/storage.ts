import { z } from 'zod'
import { os, protectedProcedure } from '../index'

export const storageRouter = os.router({
  getUploadUrl: protectedProcedure
    .route({
      method: 'POST',
      path: '/storage/upload-url',
      operationId: 'getUploadUrl',
      summary: 'Get Presigned Upload URL',
      description:
        'Generates a presigned URL for uploading a file directly to S3.',
      tags: ['Storage'],
    })
    .input(
      z.object({
        key: z.string().describe('The S3 key (path) for the file'),
        type: z.string().optional().describe('The MIME type of the file'),
      }),
    )
    .output(
      z.object({
        url: z.string().describe('The presigned URL for PUT request'),
        publicUrl: z.string().describe('The final public URL of the file'),
        key: z.string().describe('The final S3 key'),
      }),
    )
    .handler(({ input, context }) => {
      const safeKey = `${context.session.user.id}/${input.key}`

      const url = context.storage.getUploadPresignedUrl(safeKey, {
        type: input.type,
      })

      const publicUrl = context.storage.getPublicUrl(safeKey)

      return { url, publicUrl, key: safeKey }
    }),

  deleteFile: protectedProcedure
    .route({
      method: 'POST',
      path: '/storage/delete',
      operationId: 'deleteFile',
      summary: 'Delete File from Storage',
      description: 'Deletes a file from S3.',
      tags: ['Storage'],
    })
    .input(
      z.object({
        key: z.string().describe('The S3 key (path) for the file to delete'),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        existed: z
          .boolean()
          .describe('Whether the file existed before deletion'),
      }),
    )
    .handler(async ({ input, context }) => {
      // Ensure users can only delete their own files
      if (!input.key.startsWith(`${context.session.user.id}/`)) {
        throw new Error('Unauthorized to delete this file')
      }

      const existed = await context.storage.deleteFile(input.key)
      return { success: true, existed }
    }),

  deleteFiles: protectedProcedure
    .route({
      method: 'POST',
      path: '/storage/delete-batch',
      operationId: 'deleteFiles',
      summary: 'Delete Multiple Files from Storage',
      description: 'Deletes multiple files from S3 in a batch operation.',
      tags: ['Storage'],
    })
    .input(
      z.object({
        keys: z
          .array(z.string())
          .min(1)
          .max(100)
          .describe('Array of S3 keys to delete (max 100)'),
      }),
    )
    .output(
      z.object({
        success: z.boolean(),
        results: z.array(
          z.object({
            key: z.string(),
            deleted: z.boolean(),
            error: z.string().optional(),
          }),
        ),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id
      const results: Array<{ key: string; deleted: boolean; error?: string }> =
        []

      for (const key of input.keys) {
        // Ensure users can only delete their own files
        if (!key.startsWith(`${userId}/`)) {
          results.push({
            key,
            deleted: false,
            error: 'Unauthorized to delete this file',
          })
          continue
        }

        try {
          const existed = await context.storage.deleteFile(key)
          results.push({ key, deleted: existed })
        } catch (error: any) {
          results.push({
            key,
            deleted: false,
            error: error.message || 'Unknown error',
          })
        }
      }

      return {
        success: true,
        results,
      }
    }),
})
