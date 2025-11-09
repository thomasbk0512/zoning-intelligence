#!/usr/bin/env node
/**
 * Telemetry Validation Script
 * 
 * Validates NDJSON telemetry events against JSON Schema using ajv.
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load schema from events.ts (exported schema)
const schemaPath = join(__dirname, '../../src/telemetry/events.ts')
let schema

try {
  // Read and parse the schema from the TypeScript file
  // For now, we'll use the inline schema definition
  schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    definitions: {
      baseEvent: {
        type: 'object',
        required: ['event_type', 'timestamp', 'session_id', 'build_id', 'route', 'schema_version'],
        properties: {
          event_type: { type: 'string' },
          timestamp: { type: 'number' },
          session_id: { type: 'string' },
          build_id: { type: 'string' },
          route: { type: 'string' },
          schema_version: { type: 'string' },
        },
      },
      pageViewEvent: {
        allOf: [
          { $ref: '#/definitions/baseEvent' },
          {
            type: 'object',
            required: ['event_type', 'referrer_type'],
            properties: {
              event_type: { const: 'page_view' },
              referrer_type: { enum: ['internal', 'external', 'direct'] },
            },
          },
        ],
      },
      searchSubmitEvent: {
        allOf: [
          { $ref: '#/definitions/baseEvent' },
          {
            type: 'object',
            required: ['event_type', 'mode', 'query_len', 'valid'],
            properties: {
              event_type: { const: 'search_submit' },
              mode: { enum: ['apn', 'latlng'] },
              query_len: { type: 'number', minimum: 0 },
              valid: { type: 'boolean' },
            },
          },
        ],
      },
      validationErrorEvent: {
        allOf: [
          { $ref: '#/definitions/baseEvent' },
          {
            type: 'object',
            required: ['event_type', 'field', 'reason'],
            properties: {
              event_type: { const: 'validation_error' },
              field: { enum: ['apn', 'lat', 'lng'] },
              reason: { enum: ['format', 'range', 'required'] },
            },
          },
        ],
      },
      resultsRenderEvent: {
        allOf: [
          { $ref: '#/definitions/baseEvent' },
          {
            type: 'object',
            required: ['event_type', 'result_count', 'fetch_ms', 'render_ms', 'schema_fields'],
            properties: {
              event_type: { const: 'results_render' },
              result_count: { type: 'number', minimum: 0 },
              fetch_ms: { type: 'number', minimum: 0 },
              render_ms: { type: 'number', minimum: 0 },
              schema_fields: { type: 'number', minimum: 0 },
            },
          },
        ],
      },
      errorShownEvent: {
        allOf: [
          { $ref: '#/definitions/baseEvent' },
          {
            type: 'object',
            required: ['event_type', 'surface', 'code'],
            properties: {
              event_type: { const: 'error_shown' },
              surface: { enum: ['results', 'search'] },
              code: { type: 'string' },
            },
          },
        ],
      },
      webVitalsEvent: {
        allOf: [
          { $ref: '#/definitions/baseEvent' },
          {
            type: 'object',
            required: ['event_type', 'metric', 'value', 'rating'],
            properties: {
              event_type: { const: 'web_vitals' },
              metric: { enum: ['FCP', 'LCP', 'CLS', 'INP', 'TTFB'] },
              value: { type: 'number', minimum: 0 },
              rating: { enum: ['good', 'needs-improvement', 'poor'] },
            },
          },
        ],
      },
    },
    oneOf: [
      { $ref: '#/definitions/pageViewEvent' },
      { $ref: '#/definitions/searchSubmitEvent' },
      { $ref: '#/definitions/validationErrorEvent' },
      { $ref: '#/definitions/resultsRenderEvent' },
      { $ref: '#/definitions/errorShownEvent' },
      { $ref: '#/definitions/webVitalsEvent' },
    ],
  }
} catch (error) {
  console.error('Failed to load schema:', error.message)
  process.exit(1)
}

// Initialize Ajv
const ajv = new Ajv({ allErrors: true, strict: false })
addFormats(ajv)
const validate = ajv.compile(schema)

// Parse command line arguments
const ndjsonPath = process.argv[2]

if (!ndjsonPath) {
  console.error('Usage: node validate.mjs <path-to-telemetry.ndjson>')
  process.exit(1)
}

// Read and parse NDJSON
let events
try {
  const content = readFileSync(ndjsonPath, 'utf-8')
  events = content
    .split('\n')
    .filter(line => line.trim())
    .map((line, idx) => {
      try {
        return JSON.parse(line)
      } catch (error) {
        console.error(`Error parsing line ${idx + 1}:`, error.message)
        return null
      }
    })
    .filter(event => event !== null)
} catch (error) {
  console.error(`Failed to read ${ndjsonPath}:`, error.message)
  process.exit(1)
}

// Validate each event
let errorCount = 0
const errors = []

events.forEach((event, idx) => {
  const valid = validate(event)
  if (!valid) {
    errorCount++
    errors.push({
      index: idx + 1,
      event_type: event.event_type || 'unknown',
      errors: validate.errors || [],
    })
  }
})

// Report results
if (errorCount === 0) {
  console.log(`✅ Validation passed: ${events.length} events validated successfully`)
  process.exit(0)
} else {
  console.error(`❌ Validation failed: ${errorCount} of ${events.length} events have errors\n`)
  
  errors.forEach(({ index, event_type, errors: eventErrors }) => {
    console.error(`Event ${index} (${event_type}):`)
    eventErrors.forEach(err => {
      console.error(`  - ${err.instancePath || 'root'}: ${err.message}`)
    })
    console.error('')
  })
  
  process.exit(1)
}

