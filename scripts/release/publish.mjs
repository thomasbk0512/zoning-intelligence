#!/usr/bin/env node
/**
 * Publish GA Release
 * 
 * Creates annotated tag and GitHub Release with artifacts.
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const VERSION = '1.5.0'
const TAG = `v${VERSION}`
const RELEASE_DIR = join(__dirname, '../../release')
const ARTIFACTS_DIR = join(__dirname, '../../ui/artifacts')
const RELEASE_NOTES_PATH = join(__dirname, '../../RELEASE_NOTES_v1.5.0.md')

console.log(`🚀 Publishing GA release ${TAG}...`)

// 1. Read release notes
if (!existsSync(RELEASE_NOTES_PATH)) {
  console.error(`❌ Release notes not found: ${RELEASE_NOTES_PATH}`)
  process.exit(1)
}

const releaseNotes = readFileSync(RELEASE_NOTES_PATH, 'utf-8')

// 2. Create annotated tag
console.log(`✓ Creating annotated tag ${TAG}...`)
try {
  execSync(`git tag -a "${TAG}" -m "Release ${TAG}"`, {
    stdio: 'inherit',
  })
  console.log(`  ✅ Tag ${TAG} created`)
} catch (error) {
  console.error(`  ❌ Failed to create tag: ${error.message}`)
  process.exit(1)
}

// 3. Push tag
console.log(`✓ Pushing tag ${TAG}...`)
try {
  execSync(`git push origin "${TAG}"`, {
    stdio: 'inherit',
  })
  console.log(`  ✅ Tag ${TAG} pushed`)
} catch (error) {
  console.error(`  ❌ Failed to push tag: ${error.message}`)
  process.exit(1)
}

// 4. Create GitHub Release
console.log(`✓ Creating GitHub Release ${TAG}...`)
const repo = process.env.GITHUB_REPOSITORY || 'thomasbk0512/zoning-intelligence'

try {
  // Create release via gh CLI
  const releaseOutput = execSync(
    `gh release create "${TAG}" --title "v${VERSION} — GA Release" --notes-file "${RELEASE_NOTES_PATH}"`,
    {
      encoding: 'utf-8',
      stdio: 'pipe',
    }
  )
  console.log(`  ✅ GitHub Release created`)
  console.log(`  ${releaseOutput.trim()}`)
} catch (error) {
  console.error(`  ❌ Failed to create GitHub Release: ${error.message}`)
  console.error(`  Note: Ensure gh CLI is authenticated and has release permissions`)
  process.exit(1)
}

// 5. Upload artifacts (if available)
console.log(`✓ Uploading artifacts...`)
const artifacts = [
  { name: 'build_info.json', path: join(__dirname, '../../ui/public/build_info.json') },
  { name: 'qg-summary.json', path: join(ARTIFACTS_DIR, 'qg-summary.json') },
  { name: 'SCHEMA_LOCK.json', path: join(__dirname, '../../SCHEMA_LOCK.json') },
]

for (const artifact of artifacts) {
  if (existsSync(artifact.path)) {
    try {
      execSync(
        `gh release upload "${TAG}" "${artifact.path}" --clobber`,
        { stdio: 'pipe' }
      )
      console.log(`  ✅ Uploaded ${artifact.name}`)
    } catch (error) {
      console.warn(`  ⚠️  Failed to upload ${artifact.name}: ${error.message}`)
    }
  } else {
    console.warn(`  ⚠️  Artifact not found: ${artifact.path}`)
  }
}

console.log(`\n✅ Release ${TAG} published successfully!`)
console.log(`   Release URL: https://github.com/${repo}/releases/tag/${TAG}`)

