#!/usr/bin/env node
/**
 * Preview Deep Links Generator
 * 
 * Prints deep links for testing v1.6.x features and copies the first to clipboard.
 */

const DEFAULT_PORT = 5173
const BASE_URL = `http://localhost:${DEFAULT_PORT}`

const deepLinks = [
  {
    name: 'Austin SF-3 (Standard)',
    url: `${BASE_URL}/results?type=apn&apn=0204050712&city=austin`,
    description: 'Standard SF-3 parcel with Answer Cards, citations, and Explain button',
  },
  {
    name: 'Travis County ETJ',
    url: `${BASE_URL}/results?type=apn&apn=ETJ_DEMO_SF3&city=austin`,
    description: 'ETJ jurisdiction with ETJ-specific rules and citations',
  },
  {
    name: 'NLQ Router (High Confidence)',
    url: `${BASE_URL}/search?type=nlq&q=${encodeURIComponent('How tall can I build in SF-3 APN 0204050712')}`,
    description: 'Natural language query that routes directly to Results',
  },
  {
    name: 'Overlay Conflict Demo',
    url: `${BASE_URL}/results?type=apn&apn=OVERLAY_CONFLICT_DEMO&city=austin`,
    description: 'Parcel with overlay adjustments and conflict resolution',
  },
]

function printDeepLinks() {
  console.log('\n🔗 Deep Links for v1.6.x Preview\n')
  console.log('=' .repeat(60))
  
  deepLinks.forEach((link, index) => {
    console.log(`\n${index + 1}. ${link.name}`)
    console.log(`   ${link.url}`)
    console.log(`   ${link.description}`)
  })
  
  console.log('\n' + '='.repeat(60))
  console.log('\n📋 Testing Checklist:\n')
  console.log('  ☐ Open View Code modal (click citation)')
  console.log('  ☐ Click Explain button → Trace modal opens')
  console.log('  ☐ Copy trace as JSON/Markdown')
  console.log('  ☐ Test Share → Print (print dialog)')
  console.log('  ☐ Verify NLQ routing (query → Results)')
  console.log('  ☐ Check telemetry in console (no PII)')
  console.log('  ☐ Verify Answer Cards show badges (Overlay/Exception/Overridden)')
  console.log('  ☐ Test keyboard navigation (Tab, Esc)')
  console.log('\n')
}

async function copyToClipboard(text) {
  try {
    const { execSync } = await import('child_process')
    const platform = process.platform
    
    if (platform === 'darwin') {
      execSync(`echo "${text}" | pbcopy`)
      return true
    } else if (platform === 'linux') {
      execSync(`echo "${text}" | xclip -selection clipboard`)
      return true
    } else if (platform === 'win32') {
      execSync(`echo ${text} | clip`)
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

async function main() {
  printDeepLinks()
  
  // Copy first link to clipboard
  const firstLink = deepLinks[0].url
  const copied = await copyToClipboard(firstLink)
  
  if (copied) {
    console.log(`✅ Copied to clipboard: ${firstLink}\n`)
  } else {
    console.log(`📋 First link: ${firstLink}\n`)
  }
  
  console.log('💡 Tip: Open the first link in your browser to start testing!\n')
}

main().catch(console.error)

