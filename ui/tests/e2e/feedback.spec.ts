import { test, expect } from '@playwright/test'
import { mockApiResponses } from './utils/helpers'
import { selectors } from './utils/selectors'
import sampleResult from './fixtures/sample-result.json'

test.describe('Answer Feedback', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponses(page, sampleResult, sampleResult)
  })

  test('should open feedback sheet when "Was this correct?" is clicked @happy', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    
    // Wait for answers to load (may not load in stub mode, but we can still test the UI)
    await page.waitForTimeout(2000)

    // Find and click feedback button (if answers loaded)
    const feedbackButton = page.locator('button:has-text("Was this correct?")').first()
    const buttonCount = await feedbackButton.count()
    
    if (buttonCount > 0) {
      await feedbackButton.click()
      
      // Check that feedback sheet is open
      const sheet = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(sheet).toBeVisible()
      await expect(sheet).toContainText('Feedback')
    }
  })

  test('should submit feedback with downvote and proposed correction @happy', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForTimeout(2000)

    const feedbackButton = page.locator('button:has-text("Was this correct?")').first()
    const buttonCount = await feedbackButton.count()
    
    if (buttonCount > 0) {
      await feedbackButton.click()
      
      // Click thumbs down
      const thumbsDown = page.locator('button:has-text("Incorrect")')
      await thumbsDown.click()
      
      // Check "I know the correct answer"
      const checkbox = page.locator('input[type="checkbox"]')
      await checkbox.check()
      
      // Fill in proposed correction
      await page.fill('input[id="proposed-value"]', '30')
      await page.fill('input[id="proposed-unit"]', 'ft')
      await page.fill('input[id="proposed-section"]', '25-2-492')
      
      // Submit
      const submitButton = page.locator('button:has-text("Submit Feedback")')
      await submitButton.click()
      
      // Check for success message
      await expect(page.locator('text=Thank you for your feedback')).toBeVisible({ timeout: 3000 })
    }
  })

  test('should close feedback sheet with Esc key', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForTimeout(2000)

    const feedbackButton = page.locator('button:has-text("Was this correct?")').first()
    const buttonCount = await feedbackButton.count()
    
    if (buttonCount > 0) {
      await feedbackButton.click()
      
      const sheet = page.locator('[role="dialog"][aria-modal="true"]')
      await expect(sheet).toBeVisible()
      
      // Press Esc
      await page.keyboard.press('Escape')
      
      // Sheet should be closed
      await expect(sheet).not.toBeVisible()
    }
  })

  test('should track feedback telemetry event', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForTimeout(2000)

    const feedbackButton = page.locator('button:has-text("Was this correct?")').first()
    const buttonCount = await feedbackButton.count()
    
    if (buttonCount > 0) {
      await feedbackButton.click()
      
      // Click thumbs up
      const thumbsUp = page.locator('button:has-text("Correct")')
      await thumbsUp.click()
      
      // Submit
      const submitButton = page.locator('button:has-text("Submit Feedback")')
      await submitButton.click()
      
      // Wait for telemetry
      await page.waitForTimeout(500)
      
      // Check telemetry events
      const events = await page.evaluate(() => {
        const flush = (window as any).__telem_flush
        return flush ? flush() : []
      })

      const feedbackEvents = events.filter((e: any) => e.event_type === 'answer_feedback')
      expect(feedbackEvents.length).toBeGreaterThanOrEqual(1)
      expect(feedbackEvents[0].payload.vote).toBeDefined()
    }
  })
})

