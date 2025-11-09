#!/usr/bin/env node
/**
 * Contrast checker for design tokens
 * Validates text/background pairs meet WCAG 2.1 AA (4.5:1 normal, 3:1 large/bold)
 */
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { colord } from 'colord'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load tokens
const tokensPath = join(__dirname, '../../src/design/tokens.json')
let tokens
try {
  tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'))
} catch (err) {
  console.error('Error loading tokens.json:', err.message)
  process.exit(1)
}

// Define text/background pairs to check
const pairs = [
  // Body text
  { name: 'Body text on white', text: tokens.colors.text, bg: tokens.colors.bg, size: 'normal' },
  { name: 'Body text on surface', text: tokens.colors.text, bg: tokens.colors.surface, size: 'normal' },
  { name: 'Muted text on white', text: tokens.colors['text-muted'], bg: tokens.colors.bg, size: 'normal' },
  { name: 'Muted text on surface', text: tokens.colors['text-muted'], bg: tokens.colors.surface, size: 'normal' },
  
  // Buttons
  { name: 'Primary button text', text: tokens.colors.bg, bg: tokens.colors.primary, size: 'normal' },
  { name: 'Secondary button text', text: tokens.colors.text, bg: tokens.colors.surface, size: 'normal' },
  
  // Links
  { name: 'Link on white', text: tokens.colors.primary, bg: tokens.colors.bg, size: 'normal' },
  { name: 'Link on surface', text: tokens.colors.primary, bg: tokens.colors.surface, size: 'normal' },
  
  // Headings (large text)
  { name: 'Heading on white', text: tokens.colors.text, bg: tokens.colors.bg, size: 'large' },
  { name: 'Heading on surface', text: tokens.colors.text, bg: tokens.colors.surface, size: 'large' },
  
  // Inputs
  { name: 'Input text on white', text: tokens.colors.text, bg: tokens.colors.bg, size: 'normal' },
  { name: 'Input border', text: tokens.colors.border, bg: tokens.colors.bg, size: 'ui' },
  
  // Focus ring (UI component - 3:1)
  { name: 'Focus ring on white', text: tokens.colors.primary, bg: tokens.colors.bg, size: 'ui' },
  { name: 'Focus ring on surface', text: tokens.colors.primary, bg: tokens.colors.surface, size: 'ui' },
  
  // Error states
  { name: 'Error text on white', text: tokens.colors.danger, bg: tokens.colors.bg, size: 'normal' },
  { name: 'Error text on surface', text: tokens.colors.danger, bg: tokens.colors.surface, size: 'normal' },
]

let failures = 0
const results = []

// Calculate contrast ratio using WCAG formula
function getContrastRatio(color1, color2) {
  const getLuminance = (color) => {
    const rgb = colord(color).toRgb()
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  
  const l1 = getLuminance(color1)
  const l2 = getLuminance(color2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

for (const pair of pairs) {
  const ratio = getContrastRatio(pair.text, pair.bg)
  const minRequired = pair.size === 'large' || pair.size === 'ui' ? 3.0 : 4.5
  const pass = ratio >= minRequired
  
  results.push({
    name: pair.name,
    text: pair.text,
    bg: pair.bg,
    ratio: ratio.toFixed(2),
    required: minRequired,
    pass,
  })
  
  if (!pass) {
    failures++
    console.error(`❌ ${pair.name}: ${ratio.toFixed(2)}:1 (required: ${minRequired}:1)`)
  } else {
    console.log(`✅ ${pair.name}: ${ratio.toFixed(2)}:1`)
  }
}

// Write report
const report = {
  timestamp: new Date().toISOString(),
  pairs_checked: pairs.length,
  failures,
  min_ratio_found: Math.min(...results.map(r => parseFloat(r.ratio))).toFixed(2),
  results,
}

const reportPath = join(__dirname, '../../contrast-report.json')
import { writeFileSync } from 'fs'
writeFileSync(reportPath, JSON.stringify(report, null, 2))

console.log(`\n📊 Summary: ${pairs.length} pairs checked, ${failures} failures`)
console.log(`📄 Report written to: ${reportPath}`)

if (failures > 0) {
  console.error(`\n❌ Contrast check failed: ${failures} pair(s) below WCAG 2.1 AA`)
  process.exit(1)
}

console.log('\n✅ All contrast ratios meet WCAG 2.1 AA')
process.exit(0)

