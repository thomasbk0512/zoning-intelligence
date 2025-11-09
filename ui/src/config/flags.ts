/**
 * Feature Flags
 * 
 * Centralized feature flag configuration from environment variables.
 */

export const flags = {
  /**
   * Enable Answer Cards feature
   */
  answersEnabled: import.meta.env.VITE_ANSWERS_ENABLE === 'true' || import.meta.env.VITE_ANSWERS_ENABLE === '1',

  /**
   * Use stubbed answers (0 = real rules, 1 = stubbed/golden fixtures)
   */
  answersStub: import.meta.env.VITE_ANSWERS_STUB === '1' || import.meta.env.VITE_ANSWERS_STUB === 'true',

  /**
   * Enable telemetry collection
   */
  telemetryEnabled: import.meta.env.VITE_TELEM_ENABLE === 'true' || import.meta.env.VITE_TELEM_ENABLE === '1',

  /**
   * Telemetry transport method (console, http, none)
   */
  telemetryTransport: import.meta.env.VITE_TELEM_TRANSPORT || 'console',

  /**
   * Preview build mode (enables additional debug info)
   */
  previewBuild: import.meta.env.VITE_PREVIEW_BUILD === 'true' || import.meta.env.VITE_PREVIEW_BUILD === '1',
} as const

/**
 * Get feature flag value
 */
export function getFlag(key: keyof typeof flags): boolean | string {
  return flags[key]
}

/**
 * Check if feature is enabled
 */
export function isEnabled(key: keyof typeof flags): boolean {
  const value = flags[key]
  return typeof value === 'boolean' ? value : value !== 'none' && value !== 'false'
}

