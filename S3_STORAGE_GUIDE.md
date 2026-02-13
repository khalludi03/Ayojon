# S3 Storage Guide

Complete guide for using S3 storage in the Ayojon application with Bun's S3 client.

## Configuration

Set these environment variables in your `.env` file:

```bash
S3_ACCESS_KEY_ID=your_access_key
S3_SECRET_ACCESS_KEY=your_secret_key
S3_REGION=us-east-1
S3_ENDPOINT=https://s3.amazonaws.com
S3_BUCKET=your-bucket-name
S3_PUBLIC_URL=https://your-cdn-url.com  # Optional
```

For local development with Supabase:

```bash
S3_ACCESS_KEY_ID=your_supabase_key
S3_SECRET_ACCESS_KEY=your_supabase_secret
S3_REGION=local
S3_ENDPOINT=http://127.0.0.1:54321/storage/v1/s3
S3_BUCKET=images
S3_PUBLIC_URL=http://127.0.0.1:54321/storage/v1/object/public/images
```

## API Endpoints

### 1. Get Upload URL

Generate a presigned URL for uploading files directly to S3.

**Endpoint:** `POST /storage/upload-url`

**Input:**

```typescript
{
  key: string;        // File path (e.g., "products/image.jpg")
  type?: string;      // MIME type (e.g., "image/jpeg")
}
```

**Output:**

```typescript
{
  url: string // Presigned URL for PUT request
  publicUrl: string // Final public URL after upload
  key: string // Full S3 key with user ID prefix
}
```

**Usage Example (Frontend):**

```typescript
import { orpc } from '@/utils/orpc';

// 1. Get presigned URL
const { url, publicUrl, key } = await orpc.storage.getUploadUrl.call({
  key: 'products/my-image.jpg',
  type: 'image/jpeg'
});

// 2. Upload file to S3
const file = /* your file */;
await fetch(url, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': 'image/jpeg',
  },
});

// 3. Save publicUrl to your database
console.log('File uploaded to:', publicUrl);
```

### 2. Delete File

Delete a single file from S3.

**Endpoint:** `POST /storage/delete`

**Input:**

```typescript
{
  key: string // S3 key (must start with your user ID)
}
```

**Output:**

```typescript
{
  success: boolean // Whether operation succeeded
  existed: boolean // Whether file existed before deletion
}
```

**Usage Example:**

```typescript
const result = await orpc.storage.deleteFile.call({
  key: 'user-id/products/old-image.jpg',
})

console.log('Deleted:', result.existed)
```

### 3. Delete Multiple Files (Batch)

Delete up to 100 files in a single request.

**Endpoint:** `POST /storage/delete-batch`

**Input:**

```typescript
{
  keys: string[];  // Array of S3 keys (1-100 items)
}
```

**Output:**

```typescript
{
  success: boolean
  results: Array<{
    key: string
    deleted: boolean
    error?: string
  }>
}
```

**Usage Example:**

```typescript
const result = await orpc.storage.deleteFiles.call({
  keys: [
    'user-id/products/image1.jpg',
    'user-id/products/image2.jpg',
    'user-id/products/image3.jpg',
  ],
})

// Check results
result.results.forEach((r) => {
  console.log(`${r.key}: ${r.deleted ? 'deleted' : 'failed'}`)
  if (r.error) console.error(`  Error: ${r.error}`)
})
```

## Storage Package Functions

Direct usage of the storage package (backend only):

```typescript
import * as storage from '@my-better-t-app/storage'

// 1. Get presigned upload URL
const uploadUrl = storage.getUploadPresignedUrl('user-id/path/to/file.jpg', {
  type: 'image/jpeg',
  expiresIn: 3600, // 1 hour
})

// 2. Get public URL
const publicUrl = storage.getPublicUrl('user-id/path/to/file.jpg')

// 3. Get presigned download URL (for private files)
const downloadUrl = storage.getDownloadPresignedUrl(
  'user-id/private/file.pdf',
  { expiresIn: 3600 },
)

// 4. Delete file
const existed = await storage.deleteFile('user-id/path/to/file.jpg')
console.log('File existed:', existed)

// 5. Check if file exists
const exists = await storage.fileExists('user-id/path/to/file.jpg')
console.log('File exists:', exists)

// 6. Extract key from URL
const key = storage.extractKeyFromUrl(
  'https://cdn.example.com/user-id/path/to/file.jpg',
)
console.log('Extracted key:', key)
```

## Security Features

### 1. User Isolation

All uploaded files are automatically prefixed with the user's ID:

```
Input:  "products/image.jpg"
Output: "user-123abc/products/image.jpg"
```

### 2. Delete Authorization

Users can only delete files in their own directory:

```typescript
// ✅ Allowed
deleteFile({ key: 'user-123abc/products/image.jpg' })

// ❌ Blocked - not your file
deleteFile({ key: 'user-456def/products/image.jpg' })
```

### 3. Error Handling

- Missing files return `existed: false` instead of throwing errors
- Invalid keys are rejected with clear error messages
- Batch operations continue even if individual files fail

## Best Practices

### 1. File Naming

Use descriptive, URL-safe file names:

```typescript
// ✅ Good
'products/red-shoes-front.jpg'
'vendor/logo-2024.png'
'documents/invoice-001.pdf'

// ❌ Bad
'image (1).jpg'
'file#@!.png'
```

### 2. File Organization

Organize files by purpose:

```
user-id/
  ├── products/         # Product images
  ├── vendor/          # Vendor profile images
  │   ├── logo.png
  │   └── banner.jpg
  ├── documents/       # Business documents
  └── temp/           # Temporary files
```

### 3. Cleanup

Always delete old files when updating:

```typescript
// Update product image
async function updateProductImage(productId: string, newFile: File) {
  // 1. Get old image URL from database
  const product = await getProduct(productId)
  const oldKey = storage.extractKeyFromUrl(product.imageUrl)

  // 2. Upload new image
  const { url, publicUrl } = await orpc.storage.getUploadUrl.call({
    key: `products/${productId}-${Date.now()}.jpg`,
    type: newFile.type,
  })

  await fetch(url, { method: 'PUT', body: newFile })

  // 3. Update database
  await updateProduct(productId, { imageUrl: publicUrl })

  // 4. Delete old image
  if (oldKey) {
    await orpc.storage.deleteFile.call({ key: oldKey })
  }
}
```

### 4. Batch Deletions

Use batch delete for multiple files:

```typescript
// ✅ Efficient - single request
await orpc.storage.deleteFiles.call({
  keys: [key1, key2, key3, key4, key5],
})

// ❌ Inefficient - 5 separate requests
await orpc.storage.deleteFile.call({ key: key1 })
await orpc.storage.deleteFile.call({ key: key2 })
await orpc.storage.deleteFile.call({ key: key3 })
await orpc.storage.deleteFile.call({ key: key4 })
await orpc.storage.deleteFile.call({ key: key5 })
```

## Testing

Run the S3 storage test script:

```bash
bun run scripts/test-s3-storage.ts
```

This will test:

- Presigned URL generation
- File upload
- Public URL access
- File existence check
- File deletion
- Error handling

## Troubleshooting

### Upload Fails

- Check S3 credentials in `.env`
- Verify bucket exists and has write permissions
- Check CORS configuration if uploading from browser
- Ensure presigned URL hasn't expired (default 1 hour)

### Delete Fails

- Verify file key starts with your user ID
- Check file actually exists in S3
- Ensure bucket has delete permissions

### Public URL Not Accessible

- Check if bucket has public read permissions
- Verify `S3_PUBLIC_URL` is set correctly
- For private files, use `getDownloadPresignedUrl` instead

### Connection Issues

- Verify `S3_ENDPOINT` is accessible
- Check firewall/network settings
- For local development, ensure Supabase is running

## Example: Complete Upload Flow

```typescript
import { orpc } from '@/utils/orpc'

async function uploadProductImage(file: File, productId: string) {
  try {
    // 1. Generate upload URL
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const key = `products/${productId}-${timestamp}.${extension}`

    const {
      url,
      publicUrl,
      key: fullKey,
    } = await orpc.storage.getUploadUrl.call({
      key,
      type: file.type,
    })

    // 2. Upload to S3
    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!uploadResponse.ok) {
      throw new Error('Upload failed')
    }

    // 3. Verify upload (optional)
    const exists = await fetch(publicUrl)
    if (!exists.ok) {
      throw new Error('File not accessible after upload')
    }

    // 4. Return public URL for database
    return {
      url: publicUrl,
      key: fullKey,
      size: file.size,
      type: file.type,
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}
```

## Limits

- **Maximum file size**: Limited by S3 bucket configuration
- **Presigned URL expiration**: 1 hour (default)
- **Batch delete limit**: 100 files per request
- **Key length**: 1024 characters maximum

## Support

For issues or questions:

1. Check this guide first
2. Run the test script to verify configuration
3. Check S3 bucket logs
4. Review error messages carefully
