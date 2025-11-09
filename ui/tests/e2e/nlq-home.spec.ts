import { test, expect } from '@playwright/test'

test.describe('NLQ Home Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('NLQ input is primary and focused', async ({ page }) => {
    // Check that NLQ input is visible and focused
    const nlqInput = page.getByLabel('Ask a zoning question')
    await expect(nlqInput).toBeVisible()
    await expect(nlqInput).toBeFocused()
    
    // Check that input has large text
    const fontSize = await nlqInput.evaluate((el) => 
      window.getComputedStyle(el).fontSize
    )
    expect(parseFloat(fontSize)).toBeGreaterThan(16) // text-lg
  })

  test('Example queries are present', async ({ page }) => {
    const exampleQueries = [
      'how tall can I build in SF-3 APN 0204050712',
      'front setback for parcel 0204050712',
      'lot coverage at 30.25, -97.75',
    ]
    
    for (const query of exampleQueries) {
      await expect(page.getByText(query, { exact: false })).toBeVisible()
    }
  })

  test('Typing triggers parse preview with aria-live announcement', async ({ page }) => {
    const nlqInput = page.getByLabel('Ask a zoning question')
    
    // Type a query
    await nlqInput.fill('front setback for APN 0204050712')
    
    // Wait for parse to complete
    await page.waitForTimeout(500)
    
    // Check for intent chip
    await expect(page.getByText('Front Setback', { exact: false })).toBeVisible()
    
    // Check for aria-live announcement
    const ariaLiveRegion = page.locator('[role="status"][aria-live="polite"]')
    await expect(ariaLiveRegion).toContainText('Intent detected', { timeout: 1000 })
  })

  test('NLQ → Results flow', async ({ page }) => {
    const nlqInput = page.getByLabel('Ask a zoning question')
    
    // Type a complete query with APN
    await nlqInput.fill('front setback for APN 0204050712')
    await page.waitForTimeout(500)
    
    // Submit
    await page.getByRole('button', { name: 'Search' }).click()
    
    // Should navigate to results
    await expect(page).toHaveURL(/\/results/, { timeout: 5000 })
  })

  test('Advanced search link is present', async ({ page }) => {
    const advancedLink = page.getByRole('link', { name: 'Advanced Search' })
    await expect(advancedLink).toBeVisible()
    await expect(advancedLink).toHaveAttribute('href', '/search')
  })
})

