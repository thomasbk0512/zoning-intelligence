/**
 * Citation Snapshot Loader
 * 
 * Loads manifest and anchors for a jurisdiction.
 */

export interface CodeManifest {
  jurisdiction_id: string
  version: string
  published_at: string
  sources: Array<{
    code_id: string
    name: string
    url: string
    sections: string[]
  }>
  hash: string
}

export interface AnchorEntry {
  section: string
  anchor: string
  snippet_hash: string
  snippet?: string
}

export interface AnchorsFile {
  code_id: string
  anchors: AnchorEntry[]
}

export interface CitationSnapshot {
  manifest: CodeManifest
  anchors: Record<string, AnchorEntry> // key: `${section}:${anchor}`
}

/**
 * Load manifest for a jurisdiction
 */
export async function loadManifest(jurisdictionId: string): Promise<CodeManifest | null> {
  try {
    const response = await fetch(`/engine/citations/manifest.${jurisdictionId}.json`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn(`Failed to load manifest for ${jurisdictionId}:`, error)
  }
  return null
}

/**
 * Load anchors for a code
 */
export async function loadAnchors(codeId: string): Promise<AnchorsFile | null> {
  try {
    // Map code_id to jurisdiction for file lookup
    const jurisdictionMap: Record<string, string> = {
      'austin_ldc_2024': 'austin',
      'travis_etj_ord_2024': 'travis_etj',
    }
    const jurisdictionId = jurisdictionMap[codeId]
    if (!jurisdictionId) {
      return null
    }

    const response = await fetch(`/engine/citations/anchors.${jurisdictionId}.json`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.warn(`Failed to load anchors for ${codeId}:`, error)
  }
  return null
}

/**
 * Load complete snapshot for a jurisdiction
 */
export async function loadSnapshot(jurisdictionId: string): Promise<CitationSnapshot | null> {
  const manifest = await loadManifest(jurisdictionId)
  if (!manifest) {
    return null
  }

  // Load anchors for all sources
  const anchorsMap: Record<string, AnchorEntry> = {}
  for (const source of manifest.sources) {
    const anchorsFile = await loadAnchors(source.code_id)
    if (anchorsFile) {
      for (const anchor of anchorsFile.anchors) {
        const key = `${anchor.section}:${anchor.anchor}`
        anchorsMap[key] = anchor
      }
    }
  }

  return {
    manifest,
    anchors: anchorsMap,
  }
}

