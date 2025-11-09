#!/usr/bin/env node
/**
 * Apply Overrides to Golden Vectors
 * 
 * Recomputes golden vectors with overrides applied and generates a report.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const GOLDENS_DIR = join(__dirname, '../../ui/src/engine/answers/goldens')
const OVERRIDES_PATH = join(__dirname, '../../ui/src/engine/answers/overrides.json')
const OUTPUT_REPORT = join(__dirname, '../../ui/artifacts/answers-with-overrides.report.json')

// Simple merge function (matches merge.ts logic)
function mergeWithOverrides(answer, overrides, apn) {
  if (!answer.answer_id) return answer

  const [district, intent] = answer.answer_id.split(':')
  if (!district || !intent) return answer

  const now = new Date()
  const applicableOverrides = overrides.filter(override => {
    if (override.expires) {
      const expiresDate = new Date(override.expires)
      if (expiresDate < now) return false
    }
    if (override.district !== district || override.intent !== intent) return false
    if (override.scope === 'parcel') return override.apn === apn
    return true
  })

  if (applicableOverrides.length === 0) return answer

  const parcelOverride = applicableOverrides.find(o => o.scope === 'parcel')
  const districtOverride = applicableOverrides.find(o => o.scope === 'district' || !o.scope)
  const selectedOverride = parcelOverride || districtOverride

  if (!selectedOverride) return answer

  return {
    ...answer,
    value: selectedOverride.value,
    unit: selectedOverride.unit,
    rationale: selectedOverride.rationale,
    citations: [selectedOverride.citation, ...answer.citations],
    provenance: 'override',
  }
}

try {
  // Load overrides
  const overrides = existsSync(OVERRIDES_PATH)
    ? JSON.parse(readFileSync(OVERRIDES_PATH, 'utf-8'))
    : []

  // Filter expired
  const now = new Date()
  const activeOverrides = overrides.filter(o => {
    if (!o.expires) return true
    return new Date(o.expires) >= now
  })

  // Process each golden file
  const goldenFiles = readdirSync(GOLDENS_DIR).filter(f => f.endsWith('.json'))
  const report = {
    timestamp: new Date().toISOString(),
    overrides_count: overrides.length,
    active_overrides_count: activeOverrides.length,
    golden_files: [],
    overridden_count: 0,
    missing_count: 0,
  }

  for (const file of goldenFiles) {
    const filePath = join(GOLDENS_DIR, file)
    const golden = JSON.parse(readFileSync(filePath, 'utf-8'))
    const zone = golden.zone

    let overriddenInZone = 0
    const answersWithOverrides = golden.answers.map(answer => {
      const merged = mergeWithOverrides(answer, activeOverrides)
      if (merged.provenance === 'override') {
        overriddenInZone++
      }
      if (merged.status === 'missing') {
        report.missing_count++
      }
      return merged
    })

    report.golden_files.push({
      file,
      zone,
      answers_count: answersWithOverrides.length,
      overridden_count: overriddenInZone,
    })

    report.overridden_count += overriddenInZone
  }

  // Write report
  const reportDir = dirname(OUTPUT_REPORT)
  if (!existsSync(reportDir)) {
    const { mkdirSync } = await import('fs')
    mkdirSync(reportDir, { recursive: true })
  }
  writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2))

  // Compute hash
  const hash = createHash('sha256')
  hash.update(JSON.stringify(activeOverrides))
  const overridesHash = hash.digest('hex')

  console.log(`✅ Applied overrides to ${goldenFiles.length} golden file(s)`)
  console.log(`   Active overrides: ${activeOverrides.length}`)
  console.log(`   Overridden answers: ${report.overridden_count}`)
  console.log(`   Missing answers: ${report.missing_count}`)
  console.log(`   Overrides hash: ${overridesHash.substring(0, 8)}...`)

  // Fail if missing answers
  if (report.missing_count > 0) {
    console.error(`❌ Found ${report.missing_count} missing answer(s)`)
    process.exit(1)
  }

  // Write hash to report
  report.overrides_hash_sha256 = overridesHash
  writeFileSync(OUTPUT_REPORT, JSON.stringify(report, null, 2))
} catch (error) {
  console.error(`❌ Error applying overrides: ${error.message}`)
  process.exit(1)
}

