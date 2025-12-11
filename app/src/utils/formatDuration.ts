/**
 * Formats a duration in seconds to a mm:ss string
 * @param seconds - Duration in seconds
 * @returns Formatted string like "3:45"
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
