import { test, expect } from '@playwright/test'

test.describe('APN Sanitization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search')
    // Switch to APN tab
    await page.getByRole('tab', { name: 'APN' }).click()
  })

  test('Paste "0204 050-712" → valid sanitized APN', async ({ page }) => {
    const apnInput = page.getByLabel(/APN/i)
    
    // Paste messy APN
    await apnInput.fill('0204 050-712')
    
    // Trigger paste event
    await apnInput.press('Control+v')
    
    // Wait for sanitization
    await page.waitForTimeout(300)
    
    // Check that value is sanitized (only digits)
    const value = await apnInput.inputValue()
    expect(value).toBe('0204050712')
    
    // Check that submit button is enabled
    const submitButton = page.getByRole('button', { name: 'Search' })
    await expect(submitButton).toBeEnabled()
  })

  test('Sample chip works', async ({ page }) => {
    const apnInput = page.getByLabel(/APN/i)
    const sampleButton = page.getByRole('button', { name: /sample/i })
    
    // Click sample button
    await sampleButton.click()
    
    // Check that APN is filled
    const value = await apnInput.inputValue()
    expect(value).toBeTruthy()
    expect(value).toMatch(/^\d+$/) // Only digits
  })

  test('Help text is present', async ({ page }) => {
    const helpText = page.getByText(/Enter 8-12 digits/i)
    await expect(helpText).toBeVisible()
  })

  test('Invalid format shows error', async ({ page }) => {
    const apnInput = page.getByLabel(/APN/i)
    
    // Enter invalid APN (too short)
    await apnInput.fill('123')
    
    // Check for error message
    await expect(page.getByText(/Invalid format/i)).toBeVisible()
  })
})

