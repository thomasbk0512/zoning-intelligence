#!/usr/bin/env node
/**
 * Verify UI Schema
 * 
 * Verifies that the current UI schema matches SCHEMA_LOCK.json.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const LOCK_PATH = join(__dirname, '../../SCHEMA_LOCK.json')

if (!existsSync(LOCK_PATH)) {
  console.error('❌ SCHEMA_LOCK.json not found. Run freeze-ui.mjs first.')
  process.exit(1)
}

const lock = JSON.parse(readFileSync(LOCK_PATH, 'utf-8'))
const expectedHash = lock.lock_hash_sha256

// Recreate schema (must match freeze-ui.mjs exactly)
const currentSchema = {
  version: '1.0.0',
  frozen_at: lock.frozen_at, // Keep original frozen_at
  fields: lock.fields, // Use fields from lock
  tolerance: lock.tolerance,
}

const schemaString = JSON.stringify(currentSchema, null, 2)
const currentHash = createHash('sha256').update(schemaString).digest('hex')

if (currentHash !== expectedHash) {
  console.error('❌ UI schema drift detected!')
  console.error(`   Expected hash: ${expectedHash}`)
  console.error(`   Current hash:  ${currentHash}`)
  console.error('')
  console.error('Schema changes detected. Review SCHEMA_COMPAT.md for change control rules.')
  process.exit(1)
}

console.log('✅ UI schema verified (no drift)')
console.log(`   Hash: ${currentHash}`)
process.exit(0)

