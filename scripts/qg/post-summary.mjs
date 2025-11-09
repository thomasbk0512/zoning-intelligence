#!/usr/bin/env node
/**
 * Post Summary
 * 
 * Posts quality gates summary to GitHub Step Summary and PR comment.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const SUMMARY_PATH = join(__dirname, '../../ui/artifacts/qg-summary.json')
const GITHUB_STEP_SUMMARY = process.env.GITHUB_STEP_SUMMARY
const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

if (!existsSync(SUMMARY_PATH)) {
  console.error('❌ qg-summary.json not found')
  process.exit(1)
}

const summary = JSON.parse(readFileSync(SUMMARY_PATH, 'utf-8'))

// Generate Markdown summary
function generateMarkdown() {
  const status = summary.verdict === 'PASS' ? '✅ PASS' : '❌ FAIL'
  
  let md = `# Quality Gates Summary\n\n`
  md += `**Verdict:** ${status}\n\n`
  
  // E2E
  md += `## E2E Tests\n`
  md += `- **Pass:** ${summary.gates.e2e_pass ? '✅' : '❌'}\n`
  md += `- **Retries Used:** ${summary.gates.e2e_retries_used} (expected: 0)\n\n`
  
  // Lighthouse
  md += `## Lighthouse Scores\n\n`
  md += `| Route | Performance | Accessibility | Best Practices | SEO |\n`
  md += `|-------|-------------|--------------|----------------|-----|\n`
  for (const route of summary.routes) {
    const scores = summary.gates.lh[route] || {}
    md += `| ${route} | ${scores.performance || 'N/A'} | ${scores.accessibility || 'N/A'} | ${scores.best_practices || 'N/A'} | ${scores.seo || 'N/A'} |\n`
  }
  md += `\n`
  
  // CWV
  md += `## Core Web Vitals\n`
  md += `- **LCP:** ${summary.gates.cwv.lcp_s !== null ? `${summary.gates.cwv.lcp_s.toFixed(2)}s` : 'N/A'} (threshold: ≤2.5s)\n`
  md += `- **CLS:** ${summary.gates.cwv.cls !== null ? summary.gates.cwv.cls : 'N/A'} (threshold: ≤0.10)\n`
  md += `- **TBT:** ${summary.gates.cwv.tbt_ms !== null ? `${summary.gates.cwv.tbt_ms}ms` : 'N/A'} (threshold: ≤200ms)\n\n`
  
  // A11y
  md += `## Accessibility\n`
  md += `- **Serious/Critical Violations:** ${summary.gates.a11y_serious_or_higher} (threshold: 0)\n`
  md += `- **Contrast Failures:** ${summary.gates.contrast_failures} (threshold: 0)\n\n`
  
  // Telemetry
  md += `## Telemetry\n`
  md += `- **Schema Validation:** ${summary.gates.telemetry_schema_validation_pass ? '✅' : '❌'}\n\n`
  
  // Bundle
  md += `## Bundle Size\n`
  md += `- **Growth:** ${summary.gates.bundle_growth_gzip_kb || 'N/A'}\n\n`
  
  // Errors
  if (summary.errors.length > 0) {
    md += `## Errors\n\n`
    summary.errors.forEach(err => {
      md += `- ❌ ${err}\n`
    })
    md += `\n`
  }
  
  return md
}

// Write to GitHub Step Summary
if (GITHUB_STEP_SUMMARY) {
  const md = generateMarkdown()
  writeFileSync(GITHUB_STEP_SUMMARY, md, 'utf-8')
  console.log('✅ Posted summary to GitHub Step Summary')
}

// Post PR comment if in PR context
if (GITHUB_EVENT_PATH && GITHUB_TOKEN) {
  try {
    const event = JSON.parse(readFileSync(GITHUB_EVENT_PATH, 'utf-8'))
    const prNumber = event.pull_request?.number || event.number
    
    if (prNumber) {
      const md = generateMarkdown()
      const repo = process.env.GITHUB_REPOSITORY
      
      // Post comment via gh CLI
      const tempFile = join(__dirname, '../../ui/artifacts/pr-comment.md')
      writeFileSync(tempFile, md, 'utf-8')
      
      execSync(
        `gh pr comment ${prNumber} --body-file ${tempFile}`,
        { env: { ...process.env, GITHUB_TOKEN }, stdio: 'inherit' }
      )
      
      console.log(`✅ Posted summary to PR #${prNumber}`)
    }
  } catch (error) {
    console.warn(`⚠️  Failed to post PR comment: ${error.message}`)
  }
}

