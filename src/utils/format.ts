/**
 * Format date time string
 * @param dateStr Date string or Date object
 * @returns Formatted date time string
 */
export const formatDateTime = (dateStr?: string | Date): string => {
  if (!dateStr) return '-'
  
  try {
    const date = new Date(dateStr)
    // 检查是否为有效日期
    if (isNaN(date.getTime())) {
      return '-'
    }
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date)
  } catch (error) {
    console.error('Date formatting error:', error)
    return '-'
  }
}

/**
 * Format duration in minutes to readable string
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes?: number): string => {
  if (!minutes) return '-'
  
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (mins === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${mins}m`
} 