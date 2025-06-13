/**
 * Time formatting utilities to prevent Next.js hydration mismatches
 * 
 * These utilities ensure consistent time formatting between server and client
 * by using ISO strings and avoiding locale-specific formatting during SSR.
 */

/**
 * Format a Date to a consistent string that works the same on server and client
 * Format: YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19)
}

/**
 * Format a Date to just the date part
 * Format: YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Format a Date to just the time part
 * Format: HH:mm:ss
 */
export function formatTime(date: Date): string {
  return date.toISOString().substring(11, 19)
}

/**
 * Safe time formatter that checks if component is mounted to prevent hydration issues
 */
export function safeFormatDateTime(date: Date, mounted: boolean = true, fallback: string = "Loading..."): string {
  if (!mounted) return fallback
  return formatDateTime(date)
}

/**
 * Format seconds to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

/**
 * Get relative time string (e.g., "2 minutes ago") but in a consistent way
 */
export function getRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }
} 