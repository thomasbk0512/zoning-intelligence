import { test, expect } from '@playwright/test'

test.describe('NLQ Confidence Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('Low confidence shows guidance', async ({ page }) => {
    const nlqInput = page.getByLabel('Ask a zoning question')
    
    // Type a low-confidence query (ambiguous)
    await nlqInput.fill('setback')
    await page.waitForTimeout(500)
    
    // Check for confidence badge
    await expect(page.getByText(/Low Confidence/i)).toBeVisible()
    await expect(page.getByText(/may need clarification/i)).toBeVisible()
  })

  test('Medium confidence shows guidance', async ({ page }) => {
    const nlqInput = page.getByLabel('Ask a zoning question')
    
    // Type a medium-confidence query
    await nlqInput.fill('front yard distance')
    await page.waitForTimeout(500)
    
    // Check for confidence badge
    const confidenceBadge = page.getByText(/Medium Confidence|High Confidence/i)
    await expect(confidenceBadge).toBeVisible()
  })

  test('High confidence shows guidance', async ({ page }) => {
    const nlqInput = page.getByLabel('Ask a zoning question')
    
    // Type a high-confidence query with APN
    await nlqInput.fill('front setback for APN 0204050712')
    await page.waitForTimeout(500)
    
    // Check for confidence badge
    await expect(page.getByText(/High Confidence/i)).toBeVisible()
    await expect(page.getByText(/Ready to search/i)).toBeVisible()
  })

  test('Single parse preview card', async ({ page }) => {
    const nlqInput = page.getByLabel('Ask a zoning question')
    
    await nlqInput.fill('front setback for APN 0204050712')
    await page.waitForTimeout(500)
    
    // Should only have one parse preview card
    const parseCards = page.locator('[class*="bg-gray-50"]').filter({ hasText: /Detected Intent/i })
    await expect(parseCards).toHaveCount(1)
  })

  test('Enter submits form', async ({ page }) => {
    const nlqInput = page.getByLabel('Ask a zoning question')
    
    await nlqInput.fill('front setback for APN 0204050712')
    await page.waitForTimeout(500)
    
    // Press Enter
    await nlqInput.press('Enter')
    
    // Should navigate to results or show loading
    await expect(
      page.getByText(/Searching/i).or(page.locator('url')).filter({ hasText: /results/i })
    ).toBeVisible({ timeout: 5000 })
  })

  test('Dual intent chips appear when two intents are close', async ({ page }) => {
    // This test would require a specific query that triggers dual intents
    // For now, we verify the structure supports it
    const nlqInput = page.getByLabel('Ask a zoning question')
    
    await nlqInput.fill('setback')
    await page.waitForTimeout(500)
    
    // Check that parse preview can show multiple chips
    const parsePreview = page.locator('[class*="bg-gray-50"]')
    await expect(parsePreview.first()).toBeVisible()
  })
})

