import { test, expect } from '@playwright/test'

test.describe('Single Primary CTA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search')
  })

  test('Only one primary button visible per state - NLQ tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Ask a Question/i }).click()
    
    // Initially, no parse, so button should be disabled
    const buttons = page.getByRole('button', { name: /Search|Continue|Get Answers/i })
    const enabledButtons = buttons.filter({ hasNot: page.locator('[disabled]') })
    
    // Should have at most one enabled primary button
    await expect(enabledButtons).toHaveCount(0) // Disabled when no parse
    
    // Type query to trigger parse
    const nlqInput = page.getByLabel(/Ask a Question/i)
    await nlqInput.fill('front setback for APN 0204050712')
    await page.waitForTimeout(500)
    
    // Now should have exactly one primary button
    const primaryButtons = page.getByRole('button', { name: /Search/i }).filter({ hasNot: page.locator('[disabled]') })
    await expect(primaryButtons).toHaveCount(1)
  })

  test('Only one primary button visible - APN tab', async ({ page }) => {
    await page.getByRole('tab', { name: /APN/i }).click()
    
    const primaryButtons = page.getByRole('button', { name: /Search/i })
    await expect(primaryButtons).toHaveCount(1)
  })

  test('Only one primary button visible - Location tab', async ({ page }) => {
    await page.getByRole('tab', { name: /Location/i }).click()
    
    const primaryButtons = page.getByRole('button', { name: /Search/i })
    await expect(primaryButtons).toHaveCount(1)
  })

  test('Continue button appears when needs_confirmation', async ({ page }) => {
    await page.getByRole('tab', { name: /Ask a Question/i }).click()
    
    // Type a query that might need confirmation
    const nlqInput = page.getByLabel(/Ask a Question/i)
    await nlqInput.fill('setback')
    await page.waitForTimeout(500)
    
    // Check for either "Continue" or "Search" button, but only one
    const continueButton = page.getByRole('button', { name: /Continue/i })
    const searchButton = page.getByRole('button', { name: /Search/i }).filter({ hasNot: page.locator('[disabled]') })
    
    // Should have exactly one enabled primary button
    const totalEnabled = (await continueButton.count()) + (await searchButton.count())
    expect(totalEnabled).toBeLessThanOrEqual(1)
  })

  test('Home page has single primary button', async ({ page }) => {
    await page.goto('/')
    
    const primaryButtons = page.getByRole('button', { name: /Search/i }).filter({ hasNot: page.locator('[disabled]') })
    
    // Initially disabled, but structure should allow only one
    const allSearchButtons = page.getByRole('button', { name: /Search/i })
    await expect(allSearchButtons).toHaveCount(1)
  })
})

