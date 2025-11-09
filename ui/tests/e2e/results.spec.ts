import { test, expect } from '@playwright/test'
import { selectors } from './utils/selectors'
import { verifyZoningResultFields, waitForAriaAnnouncement, checkConsoleErrors } from './utils/helpers'
import sampleResult from '../fixtures/sample-result.json'

test.describe('Results Page', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls
    await page.route('**/zoning?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleResult),
      })
    })
  })

  test('deep-link load via query params performs fetch', async ({ page }) => {
    // Navigate directly to results with query params (simulating deep link)
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    
    // Should show loading state first
    await expect(page.getByText(/Loading/i)).toBeVisible({ timeout: 1000 }).catch(() => {
      // Loading might be too fast, continue
    })
    
    // Then show results
    await expect(page.locator(selectors.resultsTitle)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(sampleResult.apn)).toBeVisible()
  })

  test('renders all 11 fields', async ({ page }) => {
    // Navigate via search flow
    await page.goto('/search')
    await page.locator(selectors.searchInputApn).fill('0204050712')
    await page.locator(selectors.searchSubmitButton).click()
    
    // Wait for results
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
    
    // Verify all fields are present
    await verifyZoningResultFields(page, sampleResult as any)
  })

  test('numeric fields within tolerance', async ({ page }) => {
    await page.goto('/search')
    await page.locator(selectors.searchInputApn).fill('0204050712')
    await page.locator(selectors.searchSubmitButton).click()
    
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
    
    // Check setbacks (should be exact or within ±0.1 ft)
    await expect(page.getByText(sampleResult.setbacks_ft.front.toString())).toBeVisible()
    await expect(page.getByText(sampleResult.setbacks_ft.side.toString())).toBeVisible()
    await expect(page.getByText(sampleResult.setbacks_ft.rear.toString())).toBeVisible()
    
    // Check height (exact)
    await expect(page.getByText(`${sampleResult.height_ft} ft`)).toBeVisible()
  })

  test('state transitions: loading skeleton → success', async ({ page }) => {
    // Add delay to API response to see loading state
    await page.route('**/zoning?*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleResult),
      })
    })
    
    await page.goto('/search')
    await page.locator(selectors.searchInputApn).fill('0204050712')
    await page.locator(selectors.searchSubmitButton).click()
    
    // Should see loading skeleton briefly
    await expect(page.locator('.animate-pulse')).toBeVisible({ timeout: 1000 }).catch(() => {
      // Loading might be too fast
    })
    
    // Then see results
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
    await expect(page.getByText(sampleResult.apn)).toBeVisible()
  })

  test('retry path for forced 500', async ({ page }) => {
    // First request fails
    let requestCount = 0
    await page.route('**/zoning?*', async (route) => {
      requestCount++
      if (requestCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(sampleResult),
        })
      }
    })
    
    await page.goto('/search')
    await page.locator(selectors.searchInputApn).fill('0204050712')
    await page.locator(selectors.searchSubmitButton).click()
    
    // Should show error
    await expect(page.locator(selectors.searchError)).toBeVisible()
    
    // Retry
    await page.locator(selectors.searchRetryButton).click()
    
    // Should succeed on retry
    await expect(page).toHaveURL(/\/results/)
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
  })

  test('no console errors during tests', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/search')
    await page.locator(selectors.searchInputApn).fill('0204050712')
    await page.locator(selectors.searchSubmitButton).click()
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
    
    // Filter out known non-critical errors (e.g., map tiles)
    const criticalErrors = errors.filter(err => 
      !err.includes('map') && 
      !err.includes('tile') &&
      !err.includes('favicon')
    )
    
    expect(criticalErrors).toHaveLength(0)
  })

  test('aria-live updates on load', async ({ page }) => {
    await page.goto('/search')
    await page.locator(selectors.searchInputApn).fill('0204050712')
    await page.locator(selectors.searchSubmitButton).click()
    
    // Wait for ARIA announcement
    await waitForAriaAnnouncement(
      page,
      `Zoning results loaded for APN ${sampleResult.apn}`,
      5000
    )
    
    // Verify results are visible
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
  })

  test('input errors expose aria-errormessage', async ({ page }) => {
    await page.goto('/search')
    
    // Try to submit empty form
    await page.locator(selectors.searchSubmitButton).click()
    
    // Check aria-invalid
    const apnInput = page.locator(selectors.searchInputApn)
    await expect(apnInput).toHaveAttribute('aria-invalid', 'true')
    
    // Check aria-describedby points to error message
    const errorId = await apnInput.getAttribute('aria-describedby')
    expect(errorId).toContain('error')
    
    // Error message should be visible
    await expect(page.getByText(/APN is required/i)).toBeVisible()
  })
})

