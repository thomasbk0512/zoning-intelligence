/**
 * Trace Formatting
 * 
 * Converts trace objects to JSON and Markdown formats.
 */

import type { AnswerTrace } from '../engine/answers/trace'

/**
 * Format trace as JSON
 */
export function formatTraceAsJSON(trace: AnswerTrace): string {
  return JSON.stringify(trace, null, 2)
}

/**
 * Format trace as Markdown
 */
export function formatTraceAsMarkdown(trace: AnswerTrace): string {
  const lines: string[] = []
  
  // Header
  lines.push(`# Answer Trace: ${trace.intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`)
  lines.push('')
  lines.push(`**District:** ${trace.district}`)
  lines.push(`**Jurisdiction:** ${trace.jurisdiction_id}`)
  lines.push(`**Final Value:** ${trace.final_value !== null ? `${trace.final_value} ${trace.units}` : 'Conflict (needs review)'}`)
  lines.push(`**Provenance:** ${trace.provenance}`)
  lines.push('')
  
  // Steps
  lines.push('## Computation Steps')
  lines.push('')
  
  trace.steps.forEach((step, index) => {
    const stepNum = index + 1
    lines.push(`### Step ${stepNum}: ${step.type.charAt(0).toUpperCase() + step.type.slice(1)}`)
    lines.push('')
    lines.push(`**ID:** \`${step.id}\``)
    if (step.op) {
      lines.push(`**Operation:** \`${step.op}\``)
    }
    lines.push(`**Expression:** \`${step.expr}\``)
    lines.push(`**Value:** ${step.value} ${trace.units}`)
    lines.push('')
    
    if (step.citations.length > 0) {
      lines.push('**Citations:**')
      step.citations.forEach(citation => {
        const version = 'version' in citation ? citation.version : undefined
        const versionStr = version ? ` (v${version})` : ''
        lines.push(`- ${citation.code_id}, Section ${citation.section}${citation.anchor ? ` ${citation.anchor}` : ''}${versionStr}`)
        if (citation.snippet) {
          lines.push(`  > ${citation.snippet}`)
        }
      })
      lines.push('')
    }
  })
  
  // Footer
  if (trace.conflict) {
    lines.push('')
    lines.push('⚠️ **Conflict Detected:** This answer requires manual review due to conflicting constraints.')
  }
  
  return lines.join('\n')
}

