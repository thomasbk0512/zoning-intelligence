import { test, expect } from '@playwright/test'
import { selectors } from './utils/selectors'

test.describe('Home Page', () => {
  test('loads successfully @happy', async ({ page }) => {
    // Track console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/Zoning Intelligence/)
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Zoning Intelligence/i })).toBeVisible()
    
    // Check description
    await expect(page.getByText(/Get instant zoning information/i)).toBeVisible()
    
    // Fail on console errors (excluding known non-critical)
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('map') && 
      !err.includes('tile') &&
      !err.includes('favicon')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('skip link focus works @happy', async ({ page }) => {
    await page.goto('/')
    
    // Press Tab to focus skip link (if present)
    await page.keyboard.press('Tab')
    
    // Check that focus is visible (focus ring)
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('CTA navigates to Search @happy', async ({ page }) => {
    await page.goto('/')
    
    // Click the Search Property button
    const ctaLink = page.locator(selectors.homeCtaSearch)
    await expect(ctaLink).toBeVisible()
    await ctaLink.click()
    
    // Verify navigation to search page
    await expect(page).toHaveURL(/\/search/)
    await expect(page.getByRole('heading', { name: /Search Property/i })).toBeVisible()
  })
})

