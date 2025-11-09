#!/usr/bin/env node
/**
 * Validate Citation Manifests
 * 
 * Validates manifest files against schema using AJV.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const MANIFEST_SCHEMA = join(__dirname, '../../ui/src/engine/citations/manifest.schema.json')
const MANIFESTS = [
  join(__dirname, '../../ui/src/engine/citations/manifest.austin.json'),
  join(__dirname, '../../ui/src/engine/citations/manifest.travis_etj.json'),
]

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)

let errors = []

// Load schema
if (!existsSync(MANIFEST_SCHEMA)) {
  console.error('❌ Manifest schema not found:', MANIFEST_SCHEMA)
  process.exit(1)
}

const schema = JSON.parse(readFileSync(MANIFEST_SCHEMA, 'utf-8'))
const validate = ajv.compile(schema)

// Validate each manifest
for (const manifestPath of MANIFESTS) {
  if (!existsSync(manifestPath)) {
    console.warn(`⚠️  Manifest not found: ${manifestPath}`)
    continue
  }

  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    if (!validate(manifest)) {
      console.error(`❌ ${manifestPath} validation failed:`)
      validate.errors?.forEach(err => {
        console.error(`  - ${err.instancePath || '/'}: ${err.message}`)
        errors.push(`${manifestPath}: ${err.instancePath || '/'}: ${err.message}`)
      })
    } else {
      console.log(`✅ ${manifestPath} validated: ${manifest.jurisdiction_id} v${manifest.version}`)
    }
  } catch (error) {
    console.error(`❌ Error validating ${manifestPath}:`, error.message)
    errors.push(`${manifestPath}: ${error.message}`)
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Found ${errors.length} validation error(s)`)
  process.exit(1)
}

console.log('✅ All manifests validated successfully')

