#!/usr/bin/env node
/**
 * Simulate Code Update
 * 
 * Mutates one anchor snippet_hash to simulate a stale citation.
 * Used for testing stale detection in CI.
 */

import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ANCHORS_FILE = join(__dirname, '../../ui/src/engine/citations/anchors.austin.json')
const BACKUP_FILE = join(__dirname, '../../ui/src/engine/citations/anchors.austin.json.backup')

// Backup original
if (!existsSync(BACKUP_FILE)) {
  const original = readFileSync(ANCHORS_FILE, 'utf-8')
  writeFileSync(BACKUP_FILE, original)
  console.log('✅ Backed up original anchors file')
}

// Load and mutate
const anchors = JSON.parse(readFileSync(ANCHORS_FILE, 'utf-8'))

// Mutate first anchor's snippet_hash
if (anchors.anchors && anchors.anchors.length > 0) {
  // Change hash to simulate stale
  anchors.anchors[0].snippet_hash = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  writeFileSync(ANCHORS_FILE, JSON.stringify(anchors, null, 2))
  console.log(`✅ Simulated stale anchor: ${anchors.anchors[0].section}:${anchors.anchors[0].anchor}`)
}

function existsSync(path: string): boolean {
  try {
    require('fs').accessSync(path)
    return true
  } catch {
    return false
  }
}

