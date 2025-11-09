#!/usr/bin/env node
/**
 * Prepare GA Release
 * 
 * Aggregates artifacts, verifies contracts, and prepares release bundle.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { createWriteStream } from 'fs'
import { createReadStream } from 'fs'
import { pipeline } from 'stream/promises'
import { createGzip } from 'zlib'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const VERSION = '1.5.0'
const RELEASE_DIR = join(__dirname, '../../release')
const ARTIFACTS_DIR = join(__dirname, '../../ui/artifacts')

// Ensure release directory exists
if (!existsSync(RELEASE_DIR)) {
  mkdirSync(RELEASE_DIR, { recursive: true })
}

console.log(`📦 Preparing GA release v${VERSION}...`)

// 1. Verify UI schema
console.log('✓ Verifying UI schema...')
try {
  execSync('npm run schema:verify', {
    cwd: join(__dirname, '../../ui'),
    stdio: 'inherit',
  })
  console.log('  ✅ UI schema verified')
} catch (error) {
  console.error('  ❌ UI schema verification failed')
  process.exit(1)
}

// 2. Verify telemetry contract
console.log('✓ Verifying telemetry contract...')
const telemetryPath = join(ARTIFACTS_DIR, 'telemetry.ndjson')
if (existsSync(telemetryPath)) {
  try {
    execSync(`npm run telemetry:verify ${telemetryPath}`, {
      cwd: join(__dirname, '../../ui'),
      stdio: 'inherit',
    })
    console.log('  ✅ Telemetry contract verified')
  } catch (error) {
    console.error('  ❌ Telemetry contract verification failed')
    process.exit(1)
  }
} else {
  console.log('  ⚠️  Telemetry file not found, skipping verification')
}

// 3. Read quality gates summary
console.log('✓ Reading quality gates summary...')
const qgSummaryPath = join(ARTIFACTS_DIR, 'qg-summary.json')
if (!existsSync(qgSummaryPath)) {
  console.error('  ❌ Quality gates summary not found')
  process.exit(1)
}

const qgSummary = JSON.parse(readFileSync(qgSummaryPath, 'utf-8'))
if (qgSummary.verdict !== 'PASS') {
  console.error('  ❌ Quality gates did not pass')
  console.error('  Errors:', qgSummary.errors)
  process.exit(1)
}
console.log('  ✅ Quality gates: PASS')

// 4. Build production app
console.log('✓ Building production app...')
try {
  execSync('npm run build', {
    cwd: join(__dirname, '../../ui'),
    stdio: 'inherit',
  })
  console.log('  ✅ Build complete')
} catch (error) {
  console.error('  ❌ Build failed')
  process.exit(1)
}

// 5. Compute bundle size
console.log('✓ Computing bundle size...')
const distDir = join(__dirname, '../../ui/dist')
const buildInfoPath = join(__dirname, '../../ui/public/build_info.json')

let bundleSize = 0
if (existsSync(distDir)) {
  try {
    const { statSync, readdirSync } = await import('fs')
    const { join: pathJoin } = await import('path')
    
    function getDirSize(dir) {
      let size = 0
      const files = readdirSync(dir)
      for (const file of files) {
        const filePath = pathJoin(dir, file)
        const stat = statSync(filePath)
        if (stat.isDirectory()) {
          size += getDirSize(filePath)
        } else {
          size += stat.size
        }
      }
      return size
    }
    
    bundleSize = getDirSize(distDir)
    console.log(`  ✅ Bundle size: ${(bundleSize / 1024).toFixed(2)} KB (uncompressed)`)
  } catch (error) {
    console.warn('  ⚠️  Could not compute bundle size:', error.message)
  }
}

// 6. Create artifact bundle
console.log('✓ Creating artifact bundle...')
const bundlePath = join(RELEASE_DIR, `zoning-intelligence_v${VERSION}_build.zip`)

// For now, create a simple manifest of artifacts
const artifactManifest = {
  version: VERSION,
  timestamp: new Date().toISOString(),
  artifacts: {
    build_zip: bundlePath,
    qg_summary: qgSummaryPath,
    build_info: buildInfoPath,
  },
  quality_gates: qgSummary,
  bundle_size_bytes: bundleSize,
}

const manifestPath = join(RELEASE_DIR, 'artifact-manifest.json')
writeFileSync(manifestPath, JSON.stringify(artifactManifest, null, 2), 'utf-8')
console.log(`  ✅ Artifact manifest created: ${manifestPath}`)

console.log(`\n✅ Release preparation complete for v${VERSION}`)
console.log(`   Manifest: ${manifestPath}`)

