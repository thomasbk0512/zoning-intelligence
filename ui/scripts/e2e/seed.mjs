#!/usr/bin/env node
/**
 * E2E Seed Script
 * Prepares fixture data from CI subset for deterministic E2E tests
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const FIXTURES_DIR = join(__dirname, '../../tests/e2e/fixtures')
const DERIVED_PARCELS = join(__dirname, '../../../data/austin/derived/parcels.geojson')
const GOLDEN_TESTS_DIR = join(__dirname, '../../../tests/golden')

// Ensure fixtures directory exists
if (!existsSync(FIXTURES_DIR)) {
  mkdirSync(FIXTURES_DIR, { recursive: true })
}

// Sample fixture data (used if derived data not available)
const sampleFixtures = {
  'sample-result.json': {
    apn: '0204050712',
    jurisdiction: 'Austin, TX',
    zone: 'SF-3',
    setbacks_ft: { front: 25.0, side: 5.0, rear: 10.0, street_side: 0.0 },
    height_ft: 35,
    far: 0.4,
    lot_coverage_pct: 40,
    overlays: [],
    sources: [
      { type: 'Zoning Code', cite: 'Section 25-2-492' },
      { type: 'Parcel Data', cite: 'Travis County Appraisal District' }
    ],
    notes: 'Standard single-family residential zoning',
    run_ms: 1234
  },
  'sample-result-lat-lng.json': {
    apn: '0204050713',
    jurisdiction: 'Austin, TX',
    zone: 'SF-2',
    setbacks_ft: { front: 30.0, side: 7.5, rear: 15.0, street_side: 0.0 },
    height_ft: 30,
    far: 0.35,
    lot_coverage_pct: 35,
    overlays: ['Historic'],
    sources: [
      { type: 'Zoning Code', cite: 'Section 25-2-491' },
      { type: 'Parcel Data', cite: 'Travis County Appraisal District' }
    ],
    notes: 'Historic overlay district',
    run_ms: 1456
  }
}

// Try to extract from golden tests if available
function extractFromGoldenTests() {
  if (!existsSync(GOLDEN_TESTS_DIR)) {
    console.log('Golden tests directory not found, using sample fixtures')
    return null
  }

  try {
    // Read first few golden test files
    const goldenFiles = ['001.apn.json', '002.apn.json']
    const fixtures = {}

    for (const file of goldenFiles) {
      const goldenPath = join(GOLDEN_TESTS_DIR, file)
      if (existsSync(goldenPath)) {
        const content = JSON.parse(readFileSync(goldenPath, 'utf-8'))
        fixtures[file.replace('.apn.json', '-result.json')] = content
      }
    }

    return Object.keys(fixtures).length > 0 ? fixtures : null
  } catch (error) {
    console.warn('Error reading golden tests:', error.message)
    return null
  }
}

// Main execution
const fixtures = extractFromGoldenTests() || sampleFixtures

// Write fixtures
for (const [filename, data] of Object.entries(fixtures)) {
  const filepath = join(FIXTURES_DIR, filename)
  writeFileSync(filepath, JSON.stringify(data, null, 2))
  console.log(`✓ Created fixture: ${filename}`)
}

console.log(`\n✓ E2E fixtures prepared in ${FIXTURES_DIR}`)

