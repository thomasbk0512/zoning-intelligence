/**
 * APN (Assessor's Parcel Number) utilities
 * Handles sanitization, validation, and formatting
 */

/**
 * Sanitize APN input by removing all non-digit characters
 * @param input - Raw APN input (may contain spaces, dashes, etc.)
 * @returns Sanitized APN containing only digits
 */
export function sanitizeApn(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }
  return input.replace(/\D/g, '')
}

/**
 * Validate APN format
 * @param apn - Sanitized APN (digits only)
 * @returns true if valid, false otherwise
 */
export function validateApn(apn) {
  if (!apn || typeof apn !== 'string') {
    return false
  }
  // APN should be 8-12 digits (typical range for US parcel numbers)
  const sanitized = sanitizeApn(apn)
  return sanitized.length >= 8 && sanitized.length <= 12 && /^\d+$/.test(sanitized)
}

/**
 * Format APN for display (e.g., "0204050712" -> "0204 050-712")
 * @param apn - Sanitized APN
 * @returns Formatted APN string
 */
export function formatApn(apn) {
  if (!apn || typeof apn !== 'string') {
    return ''
  }
  const sanitized = sanitizeApn(apn)
  if (sanitized.length === 0) {
    return ''
  }
  
  // Common format: XXXX XX-XXX (10 digits)
  if (sanitized.length === 10) {
    return `${sanitized.slice(0, 4)} ${sanitized.slice(4, 6)}-${sanitized.slice(6)}`
  }
  
  // For other lengths, just add spaces every 4 digits
  return sanitized.match(/.{1,4}/g)?.join(' ') || sanitized
}

