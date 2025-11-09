/**
 * Unit tests for Anchor Validation
 */

import { describe, it, expect } from 'vitest'
import { validateCitation, attachVersionInfo } from '../../src/engine/citations/validate'
import type { CodeCitation } from '../../src/engine/answers/rules'
import { loadSnapshot } from '../../src/engine/citations/snapshot'

describe('Anchor Validation', () => {
  it('should validate existing citation', async () => {
    const snapshot = await loadSnapshot('austin')
    const citation: CodeCitation = {
      code_id: 'austin_ldc_2024',
      section: '25-2-492',
      anchor: '(A)',
      snippet: 'Minimum lot size: 5,750 square feet',
    }

    const result = validateCitation(citation, snapshot)
    expect(result.exists).toBe(true)
    expect(result.anchor).toBeDefined()
  })

  it('should detect missing citation', async () => {
    const snapshot = await loadSnapshot('austin')
    const citation: CodeCitation = {
      code_id: 'austin_ldc_2024',
      section: '99-9-999',
      anchor: '(X)',
    }

    const result = validateCitation(citation, snapshot)
    expect(result.exists).toBe(false)
  })

  it('should attach version info to citations', async () => {
    const citations: CodeCitation[] = [
      {
        code_id: 'austin_ldc_2024',
        section: '25-2-492',
        anchor: '(A)',
      },
    ]

    const enriched = await attachVersionInfo(citations, 'austin')
    expect(enriched.length).toBe(1)
    expect(enriched[0].version).toBeDefined()
    expect(enriched[0].published_at).toBeDefined()
  })
})

