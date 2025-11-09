#!/usr/bin/env node
/**
 * Exit on Thresholds
 * 
 * Reads qg-summary.json and exits with code 1 if any threshold is not met.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUMMARY_PATH = join(__dirname, '../../ui/artifacts/qg-summary.json')

if (!existsSync(SUMMARY_PATH)) {
  console.error('❌ qg-summary.json not found. Run aggregate.mjs first.')
  process.exit(1)
}

const summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf-8'))

if (summary.verdict === 'FAIL') {
  console.error('❌ Quality gates FAILED')
  console.error('')
  console.error('Threshold violations:')
  summary.errors.forEach(err => {
    console.error(`  - ${err}`)
  })
  console.error('')
  process.exit(1)
}

console.log('✅ All quality gates passed')
process.exit(0)

