#!/usr/bin/env node
/**
 * Validate Answer Traces
 * 
 * Validates trace completeness and structure across golden fixtures.
 */

import { readFileSync, readdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const TRACE_SCHEMA = join(__dirname, '../../ui/src/engine/answers/trace.schema.json')
const GOLDENS_DIR = join(__dirname, '../../ui/src/engine/answers/goldens')

const ajv = new Ajv({ allErrors: true })

let errors = []
let validatedCount = 0

// Load schema
if (!existsSync(TRACE_SCHEMA)) {
  console.error('❌ Trace schema not found:', TRACE_SCHEMA)
  process.exit(1)
}

const schema = JSON.parse(readFileSync(TRACE_SCHEMA, 'utf-8'))
const validate = ajv.compile(schema)

// Load all golden fixtures
if (!existsSync(GOLDENS_DIR)) {
  console.warn('⚠️  Goldens directory not found:', GOLDENS_DIR)
  process.exit(0)
}

const goldenFiles = readdirSync(GOLDENS_DIR).filter(f => f.endsWith('.json'))

console.log(`Validating traces in ${goldenFiles.length} golden fixtures...`)

for (const file of goldenFiles) {
  const filePath = join(GOLDENS_DIR, file)
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    
    // Check if this is an answer fixture with traces
    if (data.answers && Array.isArray(data.answers)) {
      for (const answer of data.answers) {
        const trace = answer.trace
        if (trace) {
          validatedCount++
          
          // Schema validation
          if (!validate(trace)) {
            console.error(`❌ ${file}: Trace validation failed for ${trace.answer_id}:`)
            validate.errors?.forEach(err => {
              console.error(`  - ${err.instancePath || '/'}: ${err.message}`)
              errors.push(`${file}:${trace.answer_id}: ${err.instancePath || '/'}: ${err.message}`)
            })
            continue
          }
          
          // Semantic checks
          if (trace.steps.length === 0) {
            errors.push(`${file}:${trace.answer_id}: No steps in trace`)
            continue
          }
          
          if (trace.steps[0].type !== 'rule') {
            errors.push(`${file}:${trace.answer_id}: First step must be rule, got ${trace.steps[0].type}`)
          }
          
          if (!trace.conflict && trace.final_value === null) {
            errors.push(`${file}:${trace.answer_id}: final_value is null but conflict is false`)
          }
          
          if (trace.conflict && trace.final_value !== null) {
            // This is acceptable - conflict can have a value if resolved
          }
          
          // Check citations
          for (const step of trace.steps) {
            if (step.citations.length === 0) {
              errors.push(`${file}:${trace.answer_id}: Step ${step.id} has no citations`)
            }
          }
          
          console.log(`✅ ${file}: ${trace.answer_id} validated`)
        } else {
          // Answer without trace - this is acceptable for some fixtures
          console.log(`⚠️  ${file}: Answer ${answer.intent} has no trace`)
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message)
    errors.push(`${file}: ${error.message}`)
  }
}

if (errors.length > 0) {
  console.error(`\n❌ Found ${errors.length} validation error(s)`)
  process.exit(1)
}

console.log(`\n✅ Validated ${validatedCount} traces successfully`)
process.exit(0)

