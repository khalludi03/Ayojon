import { orpcClient } from '@/utils/orpc'

/**
 * Uploads a file to S3 using a presigned URL.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  file: File,
  path: string,
  type?: string,
): Promise<string> {
  const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`
  const key = `${path}/${fileName}`
  const contentType = type || file.type

  try {
    // 1. Get presigned URL from server
    console.log(`[Upload] Getting presigned URL for: ${key} (${contentType})`)
    const result = await orpcClient.storage.getUploadUrl({
      key,
      type: contentType,
    })

    const { url, publicUrl } = result
    console.log(`[Upload] Got presigned URL, uploading...`)

    // 2. Upload to S3 using PUT
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': contentType,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Upload] S3 upload failed:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
      })
      throw new Error(
        `Failed to upload file to S3: ${response.statusText} - ${errorText}`,
      )
    }

    console.log(`[Upload] Success! Public URL: ${publicUrl}`)
    return publicUrl
  } catch (error) {
    console.error(`[Upload] Upload error:`, error)
    if (error instanceof Error) {
      // Check for common auth errors
      if (
        error.message.includes('UNAUTHORIZED') ||
        error.message.includes('401')
      ) {
        throw new Error(
          'You must be logged in to upload files. Please log in and try again.',
        )
      }
      if (
        error.message.includes('FORBIDDEN') ||
        error.message.includes('403')
      ) {
        throw new Error("You don't have permission to upload files.")
      }
    }
    throw error
  }
}
