import { S3Client } from 'bun'
import { env } from '@my-better-t-app/env/server'

export const s3Client = new S3Client({
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  bucket: env.S3_BUCKET,
  endpoint: env.S3_ENDPOINT,
  region: env.S3_REGION,
})

/**
 * Get a public URL for an S3 object.
 * If S3_PUBLIC_URL is provided, it uses that as the base.
 * Otherwise, it constructs it from the endpoint and bucket.
 */
export function getPublicUrl(key: string): string {
  if (env.S3_PUBLIC_URL) {
    const baseUrl = env.S3_PUBLIC_URL.endsWith('/')
      ? env.S3_PUBLIC_URL.slice(0, -1)
      : env.S3_PUBLIC_URL
    const cleanKey = key.startsWith('/') ? key.slice(1) : key
    return `${baseUrl}/${cleanKey}`
  }

  // Fallback to constructing URL from endpoint
  const endpoint = env.S3_ENDPOINT.endsWith('/')
    ? env.S3_ENDPOINT.slice(0, -1)
    : env.S3_ENDPOINT
  const cleanKey = key.startsWith('/') ? key.slice(1) : key
  return `${endpoint}/${env.S3_BUCKET}/${cleanKey}`
}

/**
 * Generate a presigned URL for uploading a file.
 */
export function getUploadPresignedUrl(
  key: string,
  options?: { expiresIn?: number; type?: string },
) {
  const file = s3Client.file(key)
  return file.presign({
    method: 'PUT',
    expiresIn: options?.expiresIn ?? 3600,
    ...(options?.type && { acl: 'public-read', contentType: options.type }),
  })
}

/**
 * Generate a presigned URL for downloading a private file.
 */
export function getDownloadPresignedUrl(
  key: string,
  options?: { expiresIn?: number },
) {
  const file = s3Client.file(key)
  return file.presign({
    method: 'GET',
    expiresIn: options?.expiresIn ?? 3600,
  })
}

/**
 * Delete a file from S3.
 * Returns true if deleted, false if file didn't exist.
 */
export async function deleteFile(key: string): Promise<boolean> {
  try {
    const file = s3Client.file(key)
    await file.delete()
    return true
  } catch (error: any) {
    // If the file doesn't exist, that's okay - consider it a success
    if (
      error.message?.includes('not found') ||
      error.message?.includes('Not Found')
    ) {
      return false
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * Check if a file exists in S3.
 */
export async function fileExists(key: string): Promise<boolean> {
  const file = s3Client.file(key)
  return await file.exists()
}

/**
 * Extract S3 key from a public URL or presigned URL.
 * Returns null if the URL doesn't match the expected format.
 */
export function extractKeyFromUrl(url: string): string | null {
  try {
    // Try to extract from public URL format
    if (env.S3_PUBLIC_URL) {
      const baseUrl = env.S3_PUBLIC_URL.endsWith('/')
        ? env.S3_PUBLIC_URL.slice(0, -1)
        : env.S3_PUBLIC_URL

      if (url.startsWith(baseUrl)) {
        return url.substring(baseUrl.length + 1) // +1 for the slash
      }
    }

    // Try to extract from endpoint-based URL
    const endpoint = env.S3_ENDPOINT.endsWith('/')
      ? env.S3_ENDPOINT.slice(0, -1)
      : env.S3_ENDPOINT

    const bucketPrefix = `${endpoint}/${env.S3_BUCKET}/`
    if (url.startsWith(bucketPrefix)) {
      const key = url.substring(bucketPrefix.length).split('?')[0]
      return key ?? null
    }

    return null
  } catch {
    return null
  }
}
