/**
 * Code Citations
 * 
 * Manages code references and public URLs for citations.
 */

import { CodeCitation } from './rules'
import { attachVersionInfo } from '../citations/validate'

export interface CitationWithVersion extends CodeCitation {
  version?: string
  published_at?: string
  stale?: boolean
  snippet_hash?: string
}

/**
 * Get public URL for a code citation (if available)
 */
export function getCitationUrl(citation: CodeCitation | CitationWithVersion): string | null {
  if (citation.code_id === 'austin_ldc_2024') {
    // Austin Land Development Code 2024
    // In a real implementation, this would link to the actual code
    // For MVP, return a placeholder or null
    return `https://library.municode.com/tx/austin/codes/land_development_code?nodeId=${citation.section}`
  }

  if (citation.code_id === 'travis_etj_ord_2024') {
    return `https://example.com/travis-etj-ordinance#${citation.section}`
  }

  return null
}

/**
 * Attach version info to citations (async wrapper)
 */
export async function enrichCitations(
  citations: CodeCitation[],
  jurisdictionId: string
): Promise<CitationWithVersion[]> {
  return attachVersionInfo(citations, jurisdictionId)
}

/**
 * Format citation for display
 */
export function formatCitation(citation: CodeCitation): string {
  let formatted = citation.section
  if (citation.anchor) {
    formatted += ` ${citation.anchor}`
  }
  return formatted
}

/**
 * Get full citation text with code name
 */
export function getFullCitationText(citation: CodeCitation): string {
  const codeName = getCodeName(citation.code_id)
  const section = formatCitation(citation)
  return `${codeName}, Section ${section}`
}

function getCodeName(codeId: string): string {
  switch (codeId) {
    case 'austin_ldc_2024':
      return 'Austin Land Development Code (2024)'
    case 'travis_etj_ord_2024':
      return 'Travis County ETJ Ordinance (2024)'
    default:
      return codeId
  }
}

/**
 * Code anchors for citation validation
 */
export const CODE_ANCHORS: Record<string, Record<string, string>> = {
  austin_ldc_2024: {
    '25-2-490': 'SF-1 district regulations',
    '25-2-491': 'SF-2 district regulations',
    '25-2-492': 'SF-3 district regulations',
  },
  travis_etj_ord_2024: {
    '3.1.0': 'SF-1 district: minimum lot size',
    '3.1.1': 'SF-1 district: yard setbacks',
    '3.1.2': 'SF-1 district: maximum height',
    '3.1.3': 'SF-1 district: lot coverage',
    '3.2.0': 'SF-2 district: minimum lot size',
    '3.2.1': 'SF-2 district: yard setbacks',
    '3.2.2': 'SF-2 district: maximum height',
    '3.2.3': 'SF-2 district: lot coverage',
    '3.3.0': 'SF-3 district: minimum lot size',
    '3.3.1': 'SF-3 district: yard setbacks',
    '3.3.2': 'SF-3 district: maximum height',
    '3.3.3': 'SF-3 district: lot coverage',
  },
}

