/**
 * Zoning Answer Rules Engine
 * 
 * Maps {district, intent} → authoritative answer with citations.
 */

export type ZoningIntent =
  | 'front_setback'
  | 'side_setback'
  | 'rear_setback'
  | 'max_height'
  | 'lot_coverage'
  | 'min_lot_size'

export type AnswerStatus = 'answered' | 'needs_review' | 'missing'

export interface CodeCitation {
  code_id: string // e.g., "austin_ldc_2024"
  section: string // e.g., "25-2-492"
  anchor?: string // e.g., "(B)(1)"
  snippet?: string // Relevant code snippet
}

export interface ZoningAnswer {
  intent: ZoningIntent
  status: AnswerStatus
  value?: number
  unit?: string // e.g., "ft", "percent", "sqft"
  rationale?: string // Short explanation
  citations: CodeCitation[]
}

/**
 * Get answers for all intents for a given zone
 */
export function getAnswersForZone(zone: string): ZoningAnswer[] {
  const intents: ZoningIntent[] = [
    'front_setback',
    'side_setback',
    'rear_setback',
    'max_height',
    'lot_coverage',
    'min_lot_size',
  ]

  return intents.map(intent => getAnswerForIntent(zone, intent))
}

/**
 * Get answer for a specific intent and zone
 */
export function getAnswerForIntent(zone: string, intent: ZoningIntent): ZoningAnswer {
  // Normalize zone (e.g., "SF-3" → "SF3")
  const normalizedZone = zone.replace(/-/g, '').toUpperCase()

  // Austin LDC rules (simplified for MVP)
  const rules = getAustinRules(normalizedZone, intent)

  if (rules) {
    return {
      intent,
      status: 'answered',
      value: rules.value,
      unit: rules.unit,
      rationale: rules.rationale,
      citations: rules.citations,
    }
  }

  // If no rule found, return needs_review
  return {
    intent,
    status: 'needs_review',
    citations: [
      {
        code_id: 'austin_ldc_2024',
        section: '25-2-492', // General SF district section
        snippet: 'See applicable district regulations',
      },
    ],
  }
}

interface RuleDefinition {
  value: number
  unit: string
  rationale: string
  citations: CodeCitation[]
}

/**
 * Austin LDC rules (simplified for MVP)
 * Based on Austin Land Development Code 2024
 */
function getAustinRules(zone: string, intent: ZoningIntent): RuleDefinition | null {
  // SF-3 (Single Family Residential - Standard Lot)
  if (zone === 'SF3' || zone === 'SF-3') {
    switch (intent) {
      case 'front_setback':
        return {
          value: 25,
          unit: 'ft',
          rationale: 'Minimum front yard setback for SF-3',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-492',
              anchor: '(B)(1)',
              snippet: 'Front yard: 25 feet minimum',
            },
          ],
        }
      case 'side_setback':
        return {
          value: 5,
          unit: 'ft',
          rationale: 'Minimum interior side yard setback for SF-3',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-492',
              anchor: '(B)(2)',
              snippet: 'Interior side yard: 5 feet minimum',
            },
          ],
        }
      case 'rear_setback':
        return {
          value: 10,
          unit: 'ft',
          rationale: 'Minimum rear yard setback for SF-3',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-492',
              anchor: '(B)(3)',
              snippet: 'Rear yard: 10 feet minimum',
            },
          ],
        }
      case 'max_height':
        return {
          value: 35,
          unit: 'ft',
          rationale: 'Maximum building height for SF-3',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-492',
              anchor: '(C)',
              snippet: 'Maximum height: 35 feet',
            },
          ],
        }
      case 'lot_coverage':
        return {
          value: 40,
          unit: 'percent',
          rationale: 'Maximum lot coverage for SF-3',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-492',
              anchor: '(D)',
              snippet: 'Maximum lot coverage: 40 percent',
            },
          ],
        }
      case 'min_lot_size':
        return {
          value: 5750,
          unit: 'sqft',
          rationale: 'Minimum lot size for SF-3',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-492',
              anchor: '(A)',
              snippet: 'Minimum lot size: 5,750 square feet',
            },
          ],
        }
    }
  }

  // SF-2 (Single Family Residential - Small Lot)
  if (zone === 'SF2' || zone === 'SF-2') {
    switch (intent) {
      case 'front_setback':
        return {
          value: 25,
          unit: 'ft',
          rationale: 'Minimum front yard setback for SF-2',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-491',
              anchor: '(B)(1)',
              snippet: 'Front yard: 25 feet minimum',
            },
          ],
        }
      case 'side_setback':
        return {
          value: 5,
          unit: 'ft',
          rationale: 'Minimum interior side yard setback for SF-2',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-491',
              anchor: '(B)(2)',
              snippet: 'Interior side yard: 5 feet minimum',
            },
          ],
        }
      case 'rear_setback':
        return {
          value: 10,
          unit: 'ft',
          rationale: 'Minimum rear yard setback for SF-2',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-491',
              anchor: '(B)(3)',
              snippet: 'Rear yard: 10 feet minimum',
            },
          ],
        }
      case 'max_height':
        return {
          value: 35,
          unit: 'ft',
          rationale: 'Maximum building height for SF-2',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-491',
              anchor: '(C)',
              snippet: 'Maximum height: 35 feet',
            },
          ],
        }
      case 'lot_coverage':
        return {
          value: 40,
          unit: 'percent',
          rationale: 'Maximum lot coverage for SF-2',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-491',
              anchor: '(D)',
              snippet: 'Maximum lot coverage: 40 percent',
            },
          ],
        }
      case 'min_lot_size':
        return {
          value: 5750,
          unit: 'sqft',
          rationale: 'Minimum lot size for SF-2',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-491',
              anchor: '(A)',
              snippet: 'Minimum lot size: 5,750 square feet',
            },
          ],
        }
    }
  }

  // SF-1 (Single Family Residential - Large Lot)
  if (zone === 'SF1' || zone === 'SF-1') {
    switch (intent) {
      case 'front_setback':
        return {
          value: 40,
          unit: 'ft',
          rationale: 'Minimum front yard setback for SF-1',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-490',
              anchor: '(B)(1)',
              snippet: 'Front yard: 40 feet minimum',
            },
          ],
        }
      case 'side_setback':
        return {
          value: 10,
          unit: 'ft',
          rationale: 'Minimum interior side yard setback for SF-1',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-490',
              anchor: '(B)(2)',
              snippet: 'Interior side yard: 10 feet minimum',
            },
          ],
        }
      case 'rear_setback':
        return {
          value: 25,
          unit: 'ft',
          rationale: 'Minimum rear yard setback for SF-1',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-490',
              anchor: '(B)(3)',
              snippet: 'Rear yard: 25 feet minimum',
            },
          ],
        }
      case 'max_height':
        return {
          value: 35,
          unit: 'ft',
          rationale: 'Maximum building height for SF-1',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-490',
              anchor: '(C)',
              snippet: 'Maximum height: 35 feet',
            },
          ],
        }
      case 'lot_coverage':
        return {
          value: 35,
          unit: 'percent',
          rationale: 'Maximum lot coverage for SF-1',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-490',
              anchor: '(D)',
              snippet: 'Maximum lot coverage: 35 percent',
            },
          ],
        }
      case 'min_lot_size':
        return {
          value: 8750,
          unit: 'sqft',
          rationale: 'Minimum lot size for SF-1',
          citations: [
            {
              code_id: 'austin_ldc_2024',
              section: '25-2-490',
              anchor: '(A)',
              snippet: 'Minimum lot size: 8,750 square feet',
            },
          ],
        }
    }
  }

  return null
}

