#!/usr/bin/env node
/**
 * Validate Overlays and Exceptions
 * 
 * Validates overlays.json and exceptions.json against schemas and performs semantic checks.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OVERLAYS_PATH = join(__dirname, '../../ui/src/engine/answers/config/overlays.json')
const OVERLAYS_SCHEMA = join(__dirname, '../../ui/src/engine/answers/config/overlays.schema.json')
const EXCEPTIONS_PATH = join(__dirname, '../../ui/src/engine/answers/config/exceptions.json')
const EXCEPTIONS_SCHEMA = join(__dirname, '../../ui/src/engine/answers/config/exceptions.schema.json')

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

let errors = []

// Validate overlays
if (existsSync(OVERLAYS_PATH) && existsSync(OVERLAYS_SCHEMA)) {
  try {
    const overlays = JSON.parse(readFileSync(OVERLAYS_PATH, 'utf-8'))
    const schema = JSON.parse(readFileSync(OVERLAYS_SCHEMA, 'utf-8'))
    const validate = ajv.compile(schema)

    if (!validate(overlays)) {
      console.error('❌ Overlays schema validation failed:')
      validate.errors?.forEach(err => {
        console.error(`  - ${err.instancePath || '/'}: ${err.message}`)
        errors.push(`Overlays: ${err.instancePath || '/'}: ${err.message}`)
      })
    } else {
      console.log(`✅ Overlays validated: ${overlays.length} overlay(s)`)
      
      // Semantic checks
      overlays.forEach((overlay, index) => {
        // Check citations
        if (!overlay.citations || overlay.citations.length === 0) {
          errors.push(`Overlay ${index} (${overlay.id}): missing citations`)
        }
        
        // Check unit matches intent unit
        const intentUnits: Record<string, string> = {
          front_setback: 'ft',
          side_setback: 'ft',
          rear_setback: 'ft',
          max_height: 'ft',
          lot_coverage: 'percent',
          min_lot_size: 'sqft',
        }
        
        overlay.applies_to.forEach(intent => {
          const expectedUnit = intentUnits[intent]
          if (expectedUnit && overlay.unit !== expectedUnit) {
            errors.push(`Overlay ${index} (${overlay.id}): unit mismatch for ${intent} (expected ${expectedUnit}, got ${overlay.unit})`)
          }
        })
      })
    }
  } catch (error) {
    console.error(`❌ Error validating overlays: ${error.message}`)
    errors.push(`Overlays: ${error.message}`)
  }
} else {
  console.warn('⚠️  Overlays files not found')
}

// Validate exceptions
if (existsSync(EXCEPTIONS_PATH) && existsSync(EXCEPTIONS_SCHEMA)) {
  try {
    const exceptions = JSON.parse(readFileSync(EXCEPTIONS_PATH, 'utf-8'))
    const schema = JSON.parse(readFileSync(EXCEPTIONS_SCHEMA, 'utf-8'))
    const validate = ajv.compile(schema)

    if (!validate(exceptions)) {
      console.error('❌ Exceptions schema validation failed:')
      validate.errors?.forEach(err => {
        console.error(`  - ${err.instancePath || '/'}: ${err.message}`)
        errors.push(`Exceptions: ${err.instancePath || '/'}: ${err.message}`)
      })
    } else {
      console.log(`✅ Exceptions validated: ${exceptions.length} exception(s)`)
      
      // Semantic checks
      exceptions.forEach((exception, index) => {
        // Check citations
        if (!exception.citations || exception.citations.length === 0) {
          errors.push(`Exception ${index} (${exception.id}): missing citations`)
        }
        
        // Check adjustments have valid intents
        exception.adjustments.forEach((adj, adjIndex) => {
          const validIntents = ['front_setback', 'side_setback', 'rear_setback', 'max_height', 'lot_coverage', 'min_lot_size']
          if (!validIntents.includes(adj.intent)) {
            errors.push(`Exception ${index} (${exception.id}): invalid intent ${adj.intent} in adjustment ${adjIndex}`)
          }
        })
      })
    }
  } catch (error) {
    console.error(`❌ Error validating exceptions: ${error.message}`)
    errors.push(`Exceptions: ${error.message}`)
  }
} else {
  console.warn('⚠️  Exceptions files not found')
}

if (errors.length > 0) {
  console.error(`\n❌ Found ${errors.length} validation error(s)`)
  process.exit(1)
}

console.log('✅ All overlays and exceptions validated successfully')
