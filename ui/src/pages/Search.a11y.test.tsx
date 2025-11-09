import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'
import Search from './Search'

expect.extend(toHaveNoViolations)

describe('Search page accessibility', () => {
  it('should have no serious or critical accessibility violations', async () => {
    const { container } = render(
      <BrowserRouter>
        <Search />
      </BrowserRouter>
    )
    
    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
        'keyboard-navigation': { enabled: true },
        'label': { enabled: true },
        'form-field-multiple-labels': { enabled: true },
        'aria-required-attr': { enabled: true },
        'aria-valid-attr-value': { enabled: true },
      },
    })
    
    const seriousOrCritical = results.violations.filter(
      v => v.impact === 'serious' || v.impact === 'critical'
    )
    
    expect(seriousOrCritical).toHaveLength(0)
  })
})

