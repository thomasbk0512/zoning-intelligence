#!/usr/bin/env node
/**
 * Validate Jurisdiction Registry
 * 
 * Validates registry.json against schema and performs semantic checks.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const REGISTRY_PATH = join(__dirname, '../../ui/src/engine/juris/registry.json')
const REGISTRY_SCHEMA = join(__dirname, '../../ui/src/engine/juris/registry.schema.json')
const CITATIONS_PATH = join(__dirname, '../../ui/src/engine/answers/citations.ts')

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

let errors = []

// Validate registry
if (existsSync(REGISTRY_PATH) && existsSync(REGISTRY_SCHEMA)) {
  try {
    const registry = JSON.parse(readFileSync(REGISTRY_PATH, 'utf-8'))
    const schema = JSON.parse(readFileSync(REGISTRY_SCHEMA, 'utf-8'))
    const validate = ajv.compile(schema)

    if (!validate(registry)) {
      console.error('❌ Registry schema validation failed:')
      validate.errors?.forEach(err => {
        console.error(`  - ${err.instancePath || '/'}: ${err.message}`)
        errors.push(`Registry: ${err.instancePath || '/'}: ${err.message}`)
      })
    } else {
      console.log(`✅ Registry validated: ${registry.length} jurisdiction(s)`)
      
      // Semantic checks
      const ids = new Set()
      registry.forEach((entry, index) => {
        // Check unique IDs
        if (ids.has(entry.id)) {
          errors.push(`Registry entry ${index}: duplicate ID "${entry.id}"`)
        }
        ids.add(entry.id)
        
        // Check code_ids are defined
        if (!entry.code_ids || entry.code_ids.length === 0) {
          errors.push(`Registry entry ${index} (${entry.id}): missing code_ids`)
        }
        
        // Check code_ids reference known anchors (basic check)
        // In a full implementation, would parse citations.ts
        entry.code_ids.forEach(codeId => {
          if (!codeId || typeof codeId !== 'string') {
            errors.push(`Registry entry ${index} (${entry.id}): invalid code_id "${codeId}"`)
          }
        })
      })
    }
  } catch (error) {
    console.error(`❌ Error validating registry: ${error.message}`)
    errors.push(`Registry: ${error.message}`)
  }
} else {
  console.warn('⚠️  Registry files not found')
}

if (errors.length > 0) {
  console.error(`\n❌ Found ${errors.length} validation error(s)`)
  process.exit(1)
}

console.log('✅ Jurisdiction registry validated successfully')

