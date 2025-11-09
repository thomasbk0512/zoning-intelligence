#!/usr/bin/env node
/**
 * Render PDF Report
 * 
 * Uses headless Chromium to generate PDF from permalink.
 * CI-only: requires built app and server running.
 */

import { chromium } from 'playwright'
import { writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const OUTPUT_DIR = join(__dirname, '../../artifacts')
const PDF_PATH = join(OUTPUT_DIR, 'report.pdf')

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  const { mkdirSync } = await import('fs')
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

// Golden parcel for CI testing
const GOLDEN_APN = '0204050712'
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const PERMALINK = `${BASE_URL}/results?type=apn&apn=${GOLDEN_APN}&city=austin&zone=SF-3&token=test123`

console.log(`Rendering PDF from: ${PERMALINK}`)

try {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  // Navigate to permalink
  await page.goto(PERMALINK, { waitUntil: 'networkidle' })
  
  // Wait for content to load
  await page.waitForTimeout(3000)
  
  // Generate PDF
  await page.pdf({
    path: PDF_PATH,
    format: 'Letter',
    margin: {
      top: '0.75in',
      right: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
    },
    printBackground: true,
  })
  
  await browser.close()
  
  if (existsSync(PDF_PATH)) {
    console.log(`✅ PDF generated: ${PDF_PATH}`)
    process.exit(0)
  } else {
    console.error('❌ PDF file not created')
    process.exit(1)
  }
} catch (error) {
  console.error('❌ Error generating PDF:', error.message)
  process.exit(1)
}

