#!/usr/bin/env node
/**
 * Validate Citation Anchors
 * 
 * Validates anchor files against schema and cross-checks with manifests.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'
import { createHash } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ANCHOR_SCHEMA = join(__dirname, '../../ui/src/engine/citations/anchors.schema.json')
const ANCHORS = [
  join(__dirname, '../../ui/src/engine/citations/anchors.austin.json'),
  join(__dirname, '../../ui/src/engine/citations/anchors.travis_etj.json'),
]
const MANIFESTS = [
  join(__dirname, '../../ui/src/engine/citations/manifest.austin.json'),
  join(__dirname, '../../ui/src/engine/citations/manifest.travis_etj.json'),
]

const ajv = new Ajv({ allErrors: true })

let errors = []

// Load schema
if (!existsSync(ANCHOR_SCHEMA)) {
  console.error('❌ Anchor schema not found:', ANCHOR_SCHEMA)
  process.exit(1)
}

const schema = JSON.parse(readFileSync(ANCHOR_SCHEMA, 'utf-8'))
const validate = ajv.compile(schema)

// Load manifests
const manifests: Record<string, any> = {}
for (const manifestPath of MANIFESTS) {
  if (existsSync(manifestPath)) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    manifests[manifest.jurisdiction_id] = manifest
  }
}

// Validate each anchors file
for (const anchorPath of ANCHORS) {
  if (!existsSync(anchorPath)) {
    console.warn(`⚠️  Anchors file not found: ${anchorPath}`)
    continue
  }

  try {
    const anchorsContent = readFileSync(anchorPath, 'utf-8')
    const anchors = JSON.parse(anchorsContent)

    // Schema validation
    if (!validate(anchors)) {
      console.error(`❌ ${anchorPath} schema validation failed:`)
      validate.errors?.forEach(err => {
        console.error(`  - ${err.instancePath || '/'}: ${err.message}`)
        errors.push(`${anchorPath}: ${err.instancePath || '/'}: ${err.message}`)
      })
      continue
    }

    // Hash validation
    const hash = createHash('sha256').update(anchorsContent).digest('hex')
    const jurisdictionId = anchors.code_id.includes('austin') ? 'austin' : 'travis_etj'
    const manifest = manifests[jurisdictionId]

    if (manifest && manifest.hash !== hash) {
      console.error(`❌ ${anchorPath} hash mismatch:`)
      console.error(`  Expected: ${manifest.hash}`)
      console.error(`  Got:      ${hash}`)
      errors.push(`${anchorPath}: hash mismatch`)
    } else {
      console.log(`✅ ${anchorPath} validated: ${anchors.anchors.length} anchors, hash matches`)
    }
  } catch (error) {
    console.error(`❌ Error validating ${anchorPath}:`, error.message)
    errors.push(`${anchorPath}: ${error.message}`)
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Found ${errors.length} validation error(s)`)
  process.exit(1)
}

console.log('✅ All anchors validated successfully')

