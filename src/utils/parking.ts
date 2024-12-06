// Generate space number with prefix and padding
export const generateSpaceNumber = (prefix: string, index: number, padLength = 3): string => {
  return `${prefix}${String(index).padStart(padLength, '0')}`
}

// Increment space number
export const incrementSpaceNumber = (currentNumber: string): string => {
  const prefix = currentNumber.replace(/\d+$/, '')
  const number = parseInt(currentNumber.match(/\d+$/)?.[0] || '0')
  return generateSpaceNumber(prefix, number + 1)
}

// Validate space number format
export const validateSpaceNumber = (number: string): boolean => {
  return /^[A-Za-z0-9\u4e00-\u9fa5-]+\d{3,}$/.test(number)
}

// Check space capacity
export const checkSpaceCapacity = (
  currentCount: number,
  addCount: number,
  capacity: number
): boolean => {
  return (currentCount + addCount) <= capacity
}

// Generate default zone name (A, B, C, ...)
export const generateDefaultZoneName = (index: number): string => {
  return String.fromCharCode(65 + index)
}

// Generate default space number (A-001, A-002, ...)
export const generateDefaultSpaceNumber = (zoneName: string, index: number): string => {
  return generateSpaceNumber(zoneName, index)
}