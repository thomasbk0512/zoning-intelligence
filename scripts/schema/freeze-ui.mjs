#!/usr/bin/env node
/**
 * Freeze UI Schema
 * 
 * Generates SCHEMA_LOCK.json from the current 11-field UI contract.
 */

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createHash } from 'crypto'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// 11-field UI schema (frozen)
const SCHEMA_LOCK = {
  version: '1.0.0',
  frozen_at: new Date().toISOString(),
  fields: [
    {
      name: 'apn',
      type: 'string',
      required: true,
      description: 'Assessor\'s Parcel Number',
    },
    {
      name: 'jurisdiction',
      type: 'string',
      required: true,
      description: 'Jurisdiction name (e.g., "Austin, TX")',
    },
    {
      name: 'zone',
      type: 'string',
      required: true,
      description: 'Zoning designation',
    },
    {
      name: 'setbacks_ft',
      type: 'object',
      required: true,
      description: 'Setback distances in feet',
      properties: {
        front: { type: 'number', unit: 'ft', tolerance: 0.1 },
        side: { type: 'number', unit: 'ft', tolerance: 0.1 },
        rear: { type: 'number', unit: 'ft', tolerance: 0.1 },
        street_side: { type: 'number', unit: 'ft', tolerance: 0.1 },
      },
    },
    {
      name: 'height_ft',
      type: 'number',
      required: true,
      unit: 'ft',
      tolerance: 0.0, // Exact match required
      description: 'Height limit in feet',
    },
    {
      name: 'far',
      type: 'number',
      required: true,
      description: 'Floor Area Ratio',
    },
    {
      name: 'lot_coverage_pct',
      type: 'number',
      required: true,
      unit: 'percent',
      description: 'Lot coverage percentage',
    },
    {
      name: 'overlays',
      type: 'array',
      required: true,
      items: { type: 'string' },
      description: 'Overlay districts',
    },
    {
      name: 'sources',
      type: 'array',
      required: true,
      items: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          cite: { type: 'string' },
        },
      },
      description: 'Data sources',
    },
    {
      name: 'notes',
      type: 'string',
      required: true,
      description: 'Additional notes',
    },
    {
      name: 'run_ms',
      type: 'number',
      required: true,
      unit: 'milliseconds',
      description: 'Query execution time',
    },
  ],
  tolerance: {
    distances_ft: 0.1,
    height_ft: 0.0,
  },
}

// Calculate hash
const schemaString = JSON.stringify(SCHEMA_LOCK, null, 2)
const hash = createHash('sha256').update(schemaString).digest('hex')

const lockWithHash = {
  ...SCHEMA_LOCK,
  lock_hash_sha256: hash,
}

// Write lock file
const lockPath = join(__dirname, '../../SCHEMA_LOCK.json')
writeFileSync(lockPath, JSON.stringify(lockWithHash, null, 2), 'utf-8')

console.log(`✅ UI schema locked to ${lockPath}`)
console.log(`   Hash: ${hash}`)
console.log(`   Fields: ${SCHEMA_LOCK.fields.length}`)

