/**
 * Build Information
 * 
 * Provides access to build metadata injected at build time.
 */

export interface BuildInfo {
  version?: string
  git_sha?: string
  build_time?: string
  ci_run_url?: string
  gates_summary?: {
    verdict?: string
    gates?: {
      e2e_pass?: boolean
      lh?: Record<string, any>
      telemetry_schema_validation_pass?: boolean
    }
  }
  overrides?: {
    count?: number
    hash_sha256?: string
  }
}

let cachedBuildInfo: BuildInfo | null = null

/**
 * Get build information
 */
export async function getBuildInfo(): Promise<BuildInfo> {
  if (cachedBuildInfo) {
    return cachedBuildInfo
  }

  try {
    const response = await fetch('/build_info.json')
    if (response.ok) {
      cachedBuildInfo = await response.json()
      return cachedBuildInfo || {}
    }
  } catch (error) {
    // Build info is optional, fail gracefully
    console.warn('Failed to load build info:', error)
  }

  return {}
}

