import { test, expect } from '@playwright/test'
import { selectors } from './utils/selectors'

test.describe('Home Page', () => {
  test('loads successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/Zoning Intelligence/)
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /Zoning Intelligence/i })).toBeVisible()
    
    // Check description
    await expect(page.getByText(/Get instant zoning information/i)).toBeVisible()
  })

  test('skip link focus works', async ({ page }) => {
    await page.goto('/')
    
    // Press Tab to focus skip link (if present)
    await page.keyboard.press('Tab')
    
    // Check that focus is visible (focus ring)
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('CTA navigates to Search', async ({ page }) => {
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

