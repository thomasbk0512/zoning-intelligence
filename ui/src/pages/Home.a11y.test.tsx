import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Home from './Home'

expect.extend(toHaveNoViolations)

describe('Home page accessibility', () => {
  it('should have no serious or critical accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    )
    
    const results = await axe(container, {
      rules: {
        // Only check for serious/critical violations
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'focus-order-semantics': { enabled: true },
        'landmark-one-main': { enabled: true },
        'page-has-heading-one': { enabled: true },
      },
    })
    
    const seriousOrCritical = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    )
    
    expect(seriousOrCritical).toHaveLength(0)
  })
})

