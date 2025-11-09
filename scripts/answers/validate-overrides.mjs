#!/usr/bin/env node
/**
 * Validate Overrides
 * 
 * Validates overrides.json against schema and performs semantic checks.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OVERRIDES_PATH = join(__dirname, '../../ui/src/engine/answers/overrides.json')
const SCHEMA_PATH = join(__dirname, '../../ui/src/engine/answers/overrides.schema.json')

if (!existsSync(OVERRIDES_PATH)) {
  console.error(`❌ Overrides file not found: ${OVERRIDES_PATH}`)
  process.exit(1)
}

if (!existsSync(SCHEMA_PATH)) {
  console.error(`❌ Schema file not found: ${SCHEMA_PATH}`)
  process.exit(1)
}

try {
  const overrides = JSON.parse(readFileSync(OVERRIDES_PATH, 'utf-8'))
  const schema = JSON.parse(readFileSync(SCHEMA_PATH, 'utf-8'))

  // Validate against schema
  const ajv = new Ajv({ allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(schema)

  if (!validate(overrides)) {
    console.error('❌ Schema validation failed:')
    validate.errors?.forEach(err => {
      console.error(`  - ${err.instancePath || '/'}: ${err.message}`)
    })
    process.exit(1)
  }

  // Semantic checks
  const now = new Date()
  let expiredCount = 0
  let errors = []

  overrides.forEach((override, index) => {
    // Check expiration
    if (override.expires) {
      const expiresDate = new Date(override.expires)
      if (expiresDate < now) {
        expiredCount++
        errors.push(`Override ${index}: expired on ${override.expires}`)
      }
    }

    // Check code_id is known
    if (override.citation?.code_id && override.citation.code_id !== 'austin_ldc_2024') {
      errors.push(`Override ${index}: unknown code_id "${override.citation.code_id}"`)
    }

    // Check parcel scope has APN
    if (override.scope === 'parcel' && !override.apn) {
      errors.push(`Override ${index}: parcel scope requires APN`)
    }
  })

  if (expiredCount > 0) {
    console.warn(`⚠️  Found ${expiredCount} expired override(s)`)
    errors.forEach(err => console.warn(`  - ${err}`))
  }

  if (errors.length > 0 && expiredCount === 0) {
    // Non-expiration errors are fatal
    console.error('❌ Validation errors:')
    errors.forEach(err => console.error(`  - ${err}`))
    process.exit(1)
  }

  console.log(`✅ Overrides validated: ${overrides.length} override(s)`)
  if (expiredCount > 0) {
    console.log(`⚠️  ${expiredCount} expired override(s) will be ignored`)
  }
} catch (error) {
  console.error(`❌ Error validating overrides: ${error.message}`)
  process.exit(1)
}

