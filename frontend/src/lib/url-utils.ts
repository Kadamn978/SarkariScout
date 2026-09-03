/**
 * Validates that a URL is safe to open in a new tab.
 * Only allows http/https protocols to prevent javascript: and data: URI attacks.
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return '#'

  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '#'
    }
    return url
  } catch {
    // If URL parsing fails, check if it's a relative path
    if (url.startsWith('/') || url.startsWith('#')) {
      return url
    }
    return '#'
  }
}

/**
 * Opens a URL safely in a new tab with noopener noreferrer.
 */
export function openExternalUrl(url: string | undefined | null) {
  const safeUrl = sanitizeUrl(url)
  if (safeUrl !== '#') {
    window.open(safeUrl, '_blank', 'noopener,noreferrer')
  }
}
