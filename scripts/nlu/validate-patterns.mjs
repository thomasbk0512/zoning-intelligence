#!/usr/bin/env node
/**
 * Validate NLU Patterns
 * 
 * Validates patterns.en.json against schema and performs semantic checks.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const PATTERNS_SCHEMA = join(__dirname, '../../ui/src/engine/nlu/patterns.schema.json')
const PATTERNS_FILE = join(__dirname, '../../ui/src/engine/nlu/patterns.en.json')

const ajv = new Ajv({ allErrors: true })

let errors = []

// Load schema
if (!existsSync(PATTERNS_SCHEMA)) {
  console.error('❌ Patterns schema not found:', PATTERNS_SCHEMA)
  process.exit(1)
}

const schema = JSON.parse(readFileSync(PATTERNS_SCHEMA, 'utf-8'))
const validate = ajv.compile(schema)

// Validate patterns file
if (!existsSync(PATTERNS_FILE)) {
  console.error('❌ Patterns file not found:', PATTERNS_FILE)
  process.exit(1)
}

try {
  const patterns = JSON.parse(readFileSync(PATTERNS_FILE, 'utf-8'))
  
  // Schema validation
  if (!validate(patterns)) {
    console.error('❌ Patterns schema validation failed:')
    validate.errors?.forEach(err => {
      console.error(`  - ${err.instancePath || '/'}: ${err.message}`)
      errors.push(`${err.instancePath || '/'}: ${err.message}`)
    })
  } else {
    console.log('✅ Patterns schema validation passed')
  }
  
  // Semantic checks
  const intentKeywords = new Set()
  const intentHints = new Set()
  
  for (const [intent, config] of Object.entries(patterns.intents)) {
    // Check for duplicate keywords
    for (const keyword of config.keywords) {
      if (intentKeywords.has(keyword.toLowerCase())) {
        errors.push(`Duplicate keyword: "${keyword}"`)
      }
      intentKeywords.add(keyword.toLowerCase())
    }
    
    // Check for duplicate hints
    for (const hint of config.hints) {
      if (intentHints.has(hint.toLowerCase())) {
        errors.push(`Duplicate hint: "${hint}"`)
      }
      intentHints.add(hint.toLowerCase())
    }
    
    // Check for empty arrays
    if (config.keywords.length === 0) {
      errors.push(`Intent "${intent}" has no keywords`)
    }
    if (config.hints.length === 0) {
      errors.push(`Intent "${intent}" has no hints`)
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Semantic validation failed:')
    errors.forEach(err => console.error(`  - ${err}`))
    process.exit(1)
  }
  
  console.log('✅ All patterns validated successfully')
  process.exit(0)
} catch (error) {
  console.error('❌ Error validating patterns:', error.message)
  process.exit(1)
}

