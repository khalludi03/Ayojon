/**
 * PURGE S3 BUCKET
 *
 * ⚠️ EXTREMELY DESTRUCTIVE ⚠️
 * Removes ALL files from the S3 bucket
 */

import { s3Client } from '../packages/storage/src/index'

async function purgeBucket() {
  console.log('\n🗑️  PURGING S3 BUCKET\n')
  try {
    console.log('🔍 Listing files...')
    const result = await (s3Client as any).list()
    const files = result.contents || []

    let count = 0
    for (const fileInfo of files) {
      console.log(`   🗑️  Deleting: ${fileInfo.key}`)
      const file = s3Client.file(fileInfo.key)
      await file.delete()
      count++
    }

    if (count === 0) {
      console.log('✅ Bucket is already empty.')
    } else {
      console.log(`\n✅ Successfully deleted ${count} files!`)
    }
  } catch (error) {
    console.error('\n❌ Error during purge:', error)
    process.exit(1)
  }
}

purgeBucket()
