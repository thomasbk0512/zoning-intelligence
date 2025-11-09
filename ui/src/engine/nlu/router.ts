/**
 * Natural Language Query Router
 * 
 * Deterministic parser that maps natural language queries to Answer Card intents.
 */

import patternsData from './patterns.en.json'

export type IntentMode = 'apn' | 'latlng' | 'none'

export interface ParseResult {
  intent: string | null
  mode: IntentMode
  params: {
    apn?: string
    latitude?: number
    longitude?: number
    zone?: string
  }
  confidence: number
  needs_disambiguation: boolean
  needs_confirmation: boolean
  alternatives?: string[]
}

/**
 * Tokenize query into words (lowercase, normalized)
 */
function tokenize(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)
}

/**
 * Score intent based on keywords and hints
 */
function scoreIntent(
  tokens: string[],
  keywords: string[],
  hints: string[]
): number {
  let score = 0
  
  // Check for exact keyword matches (full phrases)
  const queryLower = tokens.join(' ')
  for (const keyword of keywords) {
    if (queryLower.includes(keyword.toLowerCase())) {
      score += 1.0
    }
  }
  
  // Check for hint matches (individual words)
  for (const hint of hints) {
    if (tokens.includes(hint.toLowerCase())) {
      score += 0.5
    }
  }
  
  return score
}

/**
 * Extract APN from query
 */
function extractAPN(query: string): string | null {
  // Pattern: 7+ digit number (APN format)
  const apnPattern = /\b(\d{7,})\b/
  const match = query.match(apnPattern)
  return match ? match[1] : null
}

/**
 * Extract lat/lng from query
 */
function extractLatLng(query: string): { latitude: number; longitude: number } | null {
  // Pattern: latitude, longitude (with optional +/- signs)
  const latLngPattern = /(-?\d+\.?\d*)\s*[,;]\s*(-?\d+\.?\d*)/
  const match = query.match(latLngPattern)
  if (match) {
    const lat = parseFloat(match[1])
    const lng = parseFloat(match[2])
    // Validate ranges (rough check)
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: lat, longitude: lng }
    }
  }
  return null
}

/**
 * Detect locator mode from query
 */
function detectLocatorMode(query: string, patterns: typeof patternsData): IntentMode {
  const queryLower = query.toLowerCase()
  
  // Check for APN patterns
  if (extractAPN(query)) {
    return 'apn'
  }
  
  // Check for APN keywords
  for (const keyword of patterns.locators.apn) {
    if (queryLower.includes(keyword)) {
      return 'apn'
    }
  }
  
  // Check for lat/lng patterns
  if (extractLatLng(query)) {
    return 'latlng'
  }
  
  // Check for lat/lng keywords
  for (const keyword of patterns.locators.latlng) {
    if (queryLower.includes(keyword)) {
      return 'latlng'
    }
  }
  
  return 'none'
}

/**
 * Extract zone from query (e.g., "SF-3", "SF3", "sf-3")
 */
function extractZone(query: string): string | null {
  const zonePattern = /\b(SF[- ]?\d+|MF[- ]?\d+|CS|LR|GR|LI|MI|HI)\b/i
  const match = query.match(zonePattern)
  if (match) {
    // Normalize format (SF-3, SF3 -> SF-3)
    return match[1].replace(/\s+/, '-').toUpperCase()
  }
  return null
}

/**
 * Parse natural language query
 */
export function parseQuery(query: string): ParseResult {
  const tokens = tokenize(query)
  const patterns = patternsData
  
  // Score all intents
  const intentScores: Record<string, number> = {}
  for (const [intent, config] of Object.entries(patterns.intents)) {
    intentScores[intent] = scoreIntent(tokens, config.keywords, config.hints)
  }
  
  // Find top intent(s)
  const sortedIntents = Object.entries(intentScores)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, score]) => score > 0)
  
  if (sortedIntents.length === 0) {
    return {
      intent: null,
      mode: 'none',
      params: {},
      confidence: 0,
      needs_disambiguation: false,
      needs_confirmation: true,
    }
  }
  
  const topIntent = sortedIntents[0]
  const topScore = topIntent[1]
  const secondScore = sortedIntents.length > 1 ? sortedIntents[1][1] : 0
  
  // Check for ties (needs disambiguation)
  const needsDisambiguation = topScore > 0 && topScore === secondScore && sortedIntents.length > 1
  
  // Calculate confidence (normalize score)
  const maxPossibleScore = Math.max(
    ...Object.values(patterns.intents).map(config => 
      config.keywords.length * 1.0 + config.hints.length * 0.5
    )
  )
  const confidence = Math.min(topScore / maxPossibleScore, 1.0)
  
  // Detect locator mode
  const mode = detectLocatorMode(query, patterns)
  
  // Extract parameters
  const params: ParseResult['params'] = {}
  const apn = extractAPN(query)
  if (apn) {
    params.apn = apn
  }
  
  const latLng = extractLatLng(query)
  if (latLng) {
    params.latitude = latLng.latitude
    params.longitude = latLng.longitude
  }
  
  const zone = extractZone(query)
  if (zone) {
    params.zone = zone
  }
  
  // Determine if confirmation needed
  const needsConfirmation = confidence < 0.7 || mode === 'none'
  
  // Get alternatives for disambiguation
  const alternatives = needsDisambiguation
    ? sortedIntents.slice(0, 2).map(([intent]) => intent)
    : undefined
  
  return {
    intent: topIntent[0],
    mode,
    params,
    confidence,
    needs_disambiguation: needsDisambiguation,
    needs_confirmation: needsConfirmation,
    alternatives,
  }
}

