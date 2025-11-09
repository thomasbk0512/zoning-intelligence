/**
 * Jurisdiction Registry Types
 */

export interface JurisdictionRegistry extends Array<JurisdictionEntry> {}

export interface JurisdictionEntry {
  id: string
  name: string
  code_ids: string[]
  priority: number
}

