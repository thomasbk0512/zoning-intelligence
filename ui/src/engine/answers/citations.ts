/**
 * Code Citations
 * 
 * Manages code references and public URLs for citations.
 */

import { CodeCitation } from './rules'

/**
 * Get public URL for a code citation (if available)
 */
export function getCitationUrl(citation: CodeCitation): string | null {
  if (citation.code_id === 'austin_ldc_2024') {
    // Austin Land Development Code 2024
    // In a real implementation, this would link to the actual code
    // For MVP, return a placeholder or null
    return `https://library.municode.com/tx/austin/codes/land_development_code?nodeId=${citation.section}`
  }

  return null
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
    default:
      return codeId
  }
}

