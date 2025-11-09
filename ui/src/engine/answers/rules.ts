/** * Zoning Answer Rules Engine *  * Maps {district, intent} → authoritative answer with citations. */export type ZoningIntent =  | 'front_setback'  | 'side_setback'  | 'rear_setback'  | 'max_height'  | 'lot_coverage'  | 'min_lot_size'export type AnswerStatus = 'answered' | 'needs_review' | 'missing'export interface CodeCitation {  code_id: string // e.g., "austin_ldc_2024"  section: string // e.g., "25-2-492"  anchor?: string // e.g., "(B)(1)"  snippet?: string // Relevant code snippet}export interface ZoningAnswer {  intent: ZoningIntent  status: AnswerStatus  value?: number  unit?: string // e.g., "ft", "percent", "sqft"  rationale?: string // Short explanation  citations: CodeCitation[]  answer_id?: string // `${district}:${intent}` for feedback tracking  provenance?: 'rule' | 'override' // Whether answer comes from rules or override}/** * Get answers for a zone in a specific jurisdiction */export function getAnswersForZone(zone: string, jurisdictionId: string = 'austin'): ZoningAnswer[] {  const intents: ZoningIntent[] = [    'front_setback',    'side_setback',    'rear_setback',    'max_height',    'lot_coverage',    'min_lot_size',  ]  return intents.map(intent => getAnswerForIntent(zone, intent, jurisdictionId))}/** * Get answer for a specific intent and zone */export function getAnswerForIntent(zone: string, intent: ZoningIntent, jurisdictionId: string = 'austin'): ZoningAnswer {  // Normalize zone (e.g., "SF-3" → "SF3")  const normalizedZone = zone.replace(/-/g, '').toUpperCase()  const answerId = `${zone}:${intent}`  // Get rules based on jurisdiction  const rules =    jurisdictionId === 'travis_etj'      ? getETJRules(normalizedZone, intent)      : getAustinRules(normalizedZone, intent)  if (rules) {    return {      intent,      status: 'answered',      value: rules.value,      unit: rules.unit,      rationale: rules.rationale,      citations: rules.citations,      answer_id: answerId,      provenance: 'rule',    }  }  // If no rule found, return needs_review  return {    intent,    status: 'needs_review',    citations: [      {        code_id: 'austin_ldc_2024',        section: '25-2-492', // General SF district section        snippet: 'See applicable district regulations',      },    ],    answer_id: answerId,    provenance: 'rule',  }}interface RuleDefinition {  value: number  unit: string  rationale: string  citations: CodeCitation[]}/** * Austin LDC rules (simplified for MVP) * Based on Austin Land Development Code 2024 */function getAustinRules(zone: string, intent: ZoningIntent): RuleDefinition | null {  // SF-3 (Single Family Residential - Standard Lot)  if (zone === 'SF3' || zone === 'SF-3') {    switch (intent) {      case 'front_setback':        return {          value: 25,          unit: 'ft',          rationale: 'Minimum front yard setback for SF-3',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-492',              anchor: '(B)(1)',              snippet: 'Front yard: 25 feet minimum',            },          ],        }      case 'side_setback':        return {          value: 5,          unit: 'ft',          rationale: 'Minimum interior side yard setback for SF-3',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-492',              anchor: '(B)(2)',              snippet: 'Interior side yard: 5 feet minimum',            },          ],        }      case 'rear_setback':        return {          value: 10,          unit: 'ft',          rationale: 'Minimum rear yard setback for SF-3',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-492',              anchor: '(B)(3)',              snippet: 'Rear yard: 10 feet minimum',            },          ],        }      case 'max_height':        return {          value: 35,          unit: 'ft',          rationale: 'Maximum building height for SF-3',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-492',              anchor: '(C)',              snippet: 'Maximum height: 35 feet',            },          ],        }      case 'lot_coverage':        return {          value: 40,          unit: 'percent',          rationale: 'Maximum lot coverage for SF-3',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-492',              anchor: '(D)',              snippet: 'Maximum lot coverage: 40 percent',            },          ],        }      case 'min_lot_size':        return {          value: 5750,          unit: 'sqft',          rationale: 'Minimum lot size for SF-3',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-492',              anchor: '(A)',              snippet: 'Minimum lot size: 5,750 square feet',            },          ],        }    }  }  // SF-2 (Single Family Residential - Small Lot)  if (zone === 'SF2' || zone === 'SF-2') {    switch (intent) {      case 'front_setback':        return {          value: 25,          unit: 'ft',          rationale: 'Minimum front yard setback for SF-2',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-491',              anchor: '(B)(1)',              snippet: 'Front yard: 25 feet minimum',            },          ],        }      case 'side_setback':        return {          value: 5,          unit: 'ft',          rationale: 'Minimum interior side yard setback for SF-2',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-491',              anchor: '(B)(2)',              snippet: 'Interior side yard: 5 feet minimum',            },          ],        }      case 'rear_setback':        return {          value: 10,          unit: 'ft',          rationale: 'Minimum rear yard setback for SF-2',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-491',              anchor: '(B)(3)',              snippet: 'Rear yard: 10 feet minimum',            },          ],        }      case 'max_height':        return {          value: 35,          unit: 'ft',          rationale: 'Maximum building height for SF-2',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-491',              anchor: '(C)',              snippet: 'Maximum height: 35 feet',            },          ],        }      case 'lot_coverage':        return {          value: 40,          unit: 'percent',          rationale: 'Maximum lot coverage for SF-2',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-491',              anchor: '(D)',              snippet: 'Maximum lot coverage: 40 percent',            },          ],        }      case 'min_lot_size':        return {          value: 5750,          unit: 'sqft',          rationale: 'Minimum lot size for SF-2',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-491',              anchor: '(A)',              snippet: 'Minimum lot size: 5,750 square feet',            },          ],        }    }  }  // SF-1 (Single Family Residential - Large Lot)  if (zone === 'SF1' || zone === 'SF-1') {    switch (intent) {      case 'front_setback':        return {          value: 40,          unit: 'ft',          rationale: 'Minimum front yard setback for SF-1',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-490',              anchor: '(B)(1)',              snippet: 'Front yard: 40 feet minimum',            },          ],        }      case 'side_setback':        return {          value: 10,          unit: 'ft',          rationale: 'Minimum interior side yard setback for SF-1',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-490',              anchor: '(B)(2)',              snippet: 'Interior side yard: 10 feet minimum',            },          ],        }      case 'rear_setback':        return {          value: 25,          unit: 'ft',          rationale: 'Minimum rear yard setback for SF-1',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-490',              anchor: '(B)(3)',              snippet: 'Rear yard: 25 feet minimum',            },          ],        }      case 'max_height':        return {          value: 35,          unit: 'ft',          rationale: 'Maximum building height for SF-1',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-490',              anchor: '(C)',              snippet: 'Maximum height: 35 feet',            },          ],        }      case 'lot_coverage':        return {          value: 35,          unit: 'percent',          rationale: 'Maximum lot coverage for SF-1',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-490',              anchor: '(D)',              snippet: 'Maximum lot coverage: 35 percent',            },          ],        }      case 'min_lot_size':        return {          value: 8750,          unit: 'sqft',          rationale: 'Minimum lot size for SF-1',          citations: [            {              code_id: 'austin_ldc_2024',              section: '25-2-490',              anchor: '(A)',              snippet: 'Minimum lot size: 8,750 square feet',            },          ],        }    }  }  return null}
/**
 * Get ETJ rules for a zone and intent
 */
function getETJRules(zone: string, intent: ZoningIntent): RuleDefinition | null {
  // Travis County ETJ rules (simplified)
  const etjRules: Record<string, Record<ZoningIntent, RuleDefinition>> = {
    SF1: {
      front_setback: {
        value: 30,
        unit: 'ft',
        rationale: 'Minimum front yard setback for SF-1 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.1.1', anchor: '(A)', snippet: 'Front yard: 30 feet minimum' }],
      },
      side_setback: {
        value: 10,
        unit: 'ft',
        rationale: 'Minimum interior side yard setback for SF-1 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.1.1', anchor: '(B)', snippet: 'Interior side yard: 10 feet minimum' }],
      },
      rear_setback: {
        value: 15,
        unit: 'ft',
        rationale: 'Minimum rear yard setback for SF-1 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.1.1', anchor: '(C)', snippet: 'Rear yard: 15 feet minimum' }],
      },
      max_height: {
        value: 35,
        unit: 'ft',
        rationale: 'Maximum building height for SF-1 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.1.2', anchor: '(A)', snippet: 'Maximum height: 35 feet' }],
      },
      lot_coverage: {
        value: 35,
        unit: 'percent',
        rationale: 'Maximum lot coverage for SF-1 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.1.3', anchor: '(A)', snippet: 'Maximum lot coverage: 35 percent' }],
      },
      min_lot_size: {
        value: 7200,
        unit: 'sqft',
        rationale: 'Minimum lot size for SF-1 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.1.0', anchor: '(A)', snippet: 'Minimum lot size: 7,200 square feet' }],
      },
    },
    SF2: {
      front_setback: {
        value: 25,
        unit: 'ft',
        rationale: 'Minimum front yard setback for SF-2 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.2.1', anchor: '(A)', snippet: 'Front yard: 25 feet minimum' }],
      },
      side_setback: {
        value: 5,
        unit: 'ft',
        rationale: 'Minimum interior side yard setback for SF-2 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.2.1', anchor: '(B)', snippet: 'Interior side yard: 5 feet minimum' }],
      },
      rear_setback: {
        value: 10,
        unit: 'ft',
        rationale: 'Minimum rear yard setback for SF-2 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.2.1', anchor: '(C)', snippet: 'Rear yard: 10 feet minimum' }],
      },
      max_height: {
        value: 35,
        unit: 'ft',
        rationale: 'Maximum building height for SF-2 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.2.2', anchor: '(A)', snippet: 'Maximum height: 35 feet' }],
      },
      lot_coverage: {
        value: 40,
        unit: 'percent',
        rationale: 'Maximum lot coverage for SF-2 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.2.3', anchor: '(A)', snippet: 'Maximum lot coverage: 40 percent' }],
      },
      min_lot_size: {
        value: 6000,
        unit: 'sqft',
        rationale: 'Minimum lot size for SF-2 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.2.0', anchor: '(A)', snippet: 'Minimum lot size: 6,000 square feet' }],
      },
    },
    SF3: {
      front_setback: {
        value: 25,
        unit: 'ft',
        rationale: 'Minimum front yard setback for SF-3 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.3.1', anchor: '(A)', snippet: 'Front yard: 25 feet minimum' }],
      },
      side_setback: {
        value: 5,
        unit: 'ft',
        rationale: 'Minimum interior side yard setback for SF-3 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.3.1', anchor: '(B)', snippet: 'Interior side yard: 5 feet minimum' }],
      },
      rear_setback: {
        value: 10,
        unit: 'ft',
        rationale: 'Minimum rear yard setback for SF-3 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.3.1', anchor: '(C)', snippet: 'Rear yard: 10 feet minimum' }],
      },
      max_height: {
        value: 35,
        unit: 'ft',
        rationale: 'Maximum building height for SF-3 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.3.2', anchor: '(A)', snippet: 'Maximum height: 35 feet' }],
      },
      lot_coverage: {
        value: 40,
        unit: 'percent',
        rationale: 'Maximum lot coverage for SF-3 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.3.3', anchor: '(A)', snippet: 'Maximum lot coverage: 40 percent' }],
      },
      min_lot_size: {
        value: 5750,
        unit: 'sqft',
        rationale: 'Minimum lot size for SF-3 in Travis County ETJ',
        citations: [{ code_id: 'travis_etj_ord_2024', section: '3.3.0', anchor: '(A)', snippet: 'Minimum lot size: 5,750 square feet' }],
      },
    },
  }

  return etjRules[zone]?.[intent] || null
}
