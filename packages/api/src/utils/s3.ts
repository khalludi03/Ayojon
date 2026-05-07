export const extractS3Key = (url: string | null): string | null => {
  if (!url) return null
  const match = url.match(/\/images\/(.+?)(?:\?|$)/)
  if (match) {
    return match[1] ?? null
  }
  // Fallback for raw keys that aren't full URLs
  if (url.includes('/') && !url.startsWith('http')) return url
  return null
}
