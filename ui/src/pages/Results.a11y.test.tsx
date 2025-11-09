import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Results from './Results'
import type { ZoningResult } from '../types'

expect.extend(toHaveNoViolations)

const mockResult: ZoningResult = {
  apn: '0204050712',
  jurisdiction: 'Austin, TX',
  zone: 'SF-3',
  setbacks_ft: { front: 25, side: 5, rear: 10, street_side: 15 },
  height_ft: 35,
  far: 0.4,
  lot_coverage_pct: 40,
  overlays: ['Floodplain'],
  sources: [{ type: 'code', cite: '§25-2-492' }],
  notes: 'Corner lot',
  run_ms: 1234,
}

describe('Results page accessibility', () => {
  it('should have no serious or critical accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Results />
      </BrowserRouter>
    )
    
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
        'aria-live-region': { enabled: true },
      },
    })
    
    const seriousOrCritical = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    )
    
    expect(seriousOrCritical).toHaveLength(0)
  })
})

