import { test, expect } from '@playwright/test'
import { mockApiResponses } from './utils/helpers'
import { selectors } from './utils/selectors'
import sampleResult from './fixtures/sample-result.json'

test.describe('Answer Cards', () => {
  test.beforeEach(async ({ page }) => {
    await mockApiResponses(page, sampleResult, sampleResult)
    
    // Enable answers via environment (stub mode)
    // Note: In CI, ANSWERS_STUB=1 is set via env var
  })

  test('should render answer cards on results page @happy', async ({ page }) => {
    await page.goto('/search')
    await page.fill(selectors.searchInputApn, '0204050712')
    await page.click(selectors.searchSubmitButton)
    await page.waitForURL('/results')

    // Wait for answers to load
    await page.waitForSelector('text=Zoning Answers (Beta)', { timeout: 5000 })

    // Check that answer cards are rendered
    const answerCards = page.locator('[data-testid^="answer-card-"]')
    await expect(answerCards.first()).toBeVisible()

    // Check that at least one card has a value
    const valueElement = page.locator('text=/\\d+\\s*(ft|percent|sqft)/').first()
    await expect(valueElement).toBeVisible()
  })

  test('should open code modal when View Code is clicked @happy', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForSelector('text=Zoning Answers (Beta)', { timeout: 5000 })

    // Click first "View Code" button
    const viewCodeButton = page.locator('button:has-text("View Code")').first()
    await viewCodeButton.click()

    // Check that modal is open
    const modal = page.locator('[role="dialog"][aria-modal="true"]')
    await expect(modal).toBeVisible()

    // Check that modal has code content
    const codeContent = modal.locator('pre code')
    await expect(codeContent.first()).toBeVisible()
  })

  test('should close code modal with Esc key', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForSelector('text=Zoning Answers (Beta)', { timeout: 5000 })

    // Open modal
    const viewCodeButton = page.locator('button:has-text("View Code")').first()
    await viewCodeButton.click()

    const modal = page.locator('[role="dialog"][aria-modal="true"]')
    await expect(modal).toBeVisible()

    // Press Esc
    await page.keyboard.press('Escape')

    // Modal should be closed
    await expect(modal).not.toBeVisible()
  })

  test('should track answer_render telemetry event', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForSelector('text=Zoning Answers (Beta)', { timeout: 5000 })

    // Wait for telemetry
    await page.waitForTimeout(1000)

    // Check telemetry events
    const events = await page.evaluate(() => {
      const flush = (window as any).__telem_flush
      return flush ? flush() : []
    })

    const answerRenderEvents = events.filter((e: any) => e.event_type === 'answer_render')
    expect(answerRenderEvents.length).toBeGreaterThanOrEqual(1)
    expect(answerRenderEvents[0].payload.intents_count).toBeGreaterThan(0)
  })

  test('should track citation_opened telemetry event', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForSelector('text=Zoning Answers (Beta)', { timeout: 5000 })

    // Open code modal
    const viewCodeButton = page.locator('button:has-text("View Code")').first()
    await viewCodeButton.click()

    // Wait for telemetry
    await page.waitForTimeout(500)

    // Check telemetry events
    const events = await page.evaluate(() => {
      const flush = (window as any).__telem_flush
      return flush ? flush() : []
    })

    const citationEvents = events.filter((e: any) => e.event_type === 'citation_opened')
    expect(citationEvents.length).toBeGreaterThanOrEqual(1)
    expect(citationEvents[0].payload.code_id).toBeDefined()
  })
})

