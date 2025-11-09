/**
 * Validation utilities
 * Scoped to active tab - no cross-tab validation
 */

export type SearchTab = 'nlq' | 'apn' | 'location'

export interface SearchValues {
  nlq?: string
  apn?: string
  latitude?: string
  longitude?: string
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

/**
 * Validate only fields for the active tab
 * @param tab - Active search tab
 * @param values - Form values
 * @returns Validation result with errors scoped to active tab
 */
export function validateActiveTab(tab: SearchTab, values: SearchValues): ValidationResult {
  const errors: Record<string, string> = {}

  switch (tab) {
    case 'nlq':
      if (!values.nlq || values.nlq.trim().length === 0) {
        errors.nlq = 'Please enter a question'
      } else if (values.nlq.trim().length < 4) {
        errors.nlq = 'Question must be at least 4 characters'
      }
      break

    case 'apn':
      if (!values.apn || values.apn.trim().length === 0) {
        errors.apn = 'APN is required'
      } else {
        const sanitized = values.apn.replace(/\D/g, '')
        if (sanitized.length < 8 || sanitized.length > 12) {
          errors.apn = 'Invalid APN format'
        }
      }
      break

    case 'location':
      const lat = values.latitude ? parseFloat(values.latitude) : NaN
      const lng = values.longitude ? parseFloat(values.longitude) : NaN

      if (!values.latitude || isNaN(lat)) {
        errors.latitude = 'Valid latitude is required'
      } else if (lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90'
      }

      if (!values.longitude || isNaN(lng)) {
        errors.longitude = 'Valid longitude is required'
      } else if (lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180'
      }
      break
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

