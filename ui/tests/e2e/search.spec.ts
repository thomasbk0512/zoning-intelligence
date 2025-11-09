import { test, expect } from '@playwright/test'
import { selectors } from './utils/selectors'
import sampleResult from '../fixtures/sample-result.json'
import sampleResultLatLng from '../fixtures/sample-result-lat-lng.json'

test.describe('Search Page', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept API calls and return fixture data
    await page.route('**/zoning?*', async (route) => {
      const url = new URL(route.request().url())
      const apn = url.searchParams.get('apn')
      const lat = url.searchParams.get('latitude')
      const lng = url.searchParams.get('longitude')
      
      // Return appropriate fixture based on query
      if (apn) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(sampleResult),
        })
      } else if (lat && lng) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(sampleResultLatLng),
        })
      } else {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Property not found' }),
        })
      }
    })
  })

  test('valid APN search navigates to results', async ({ page }) => {
    await page.goto('/search')
    
    // Fill in APN
    const apnInput = page.locator(selectors.searchInputApn)
    await apnInput.fill('0204050712')
    
    // Submit form
    const submitButton = page.locator(selectors.searchSubmitButton)
    await submitButton.click()
    
    // Wait for navigation to results
    await expect(page).toHaveURL(/\/results/)
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
    await expect(page.getByText(sampleResult.apn)).toBeVisible()
  })

  test('valid lat/lng search navigates to results', async ({ page }) => {
    await page.goto('/search?type=location')
    
    // Fill in coordinates
    const latInput = page.locator(selectors.searchInputLatitude)
    const lngInput = page.locator(selectors.searchInputLongitude)
    
    await latInput.fill('30.2672')
    await lngInput.fill('-97.7431')
    
    // Submit form
    const submitButton = page.locator(selectors.searchSubmitButton)
    await submitButton.click()
    
    // Wait for navigation to results
    await expect(page).toHaveURL(/\/results/)
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
    await expect(page.getByText(sampleResultLatLng.apn)).toBeVisible()
  })

  test('invalid input shows inline error', async ({ page }) => {
    await page.goto('/search')
    
    // Try to submit empty form
    const submitButton = page.locator(selectors.searchSubmitButton)
    await submitButton.click()
    
    // Check for error message
    const apnInput = page.locator(selectors.searchInputApn)
    await expect(apnInput).toHaveAttribute('aria-invalid', 'true')
    
    // Check for error text
    await expect(page.getByText(/APN is required/i)).toBeVisible()
  })

  test('invalid lat/lng shows error', async ({ page }) => {
    await page.goto('/search?type=location')
    
    // Fill invalid coordinates
    const latInput = page.locator(selectors.searchInputLatitude)
    const lngInput = page.locator(selectors.searchInputLongitude)
    
    await latInput.fill('999') // Invalid latitude
    await lngInput.fill('-97.7431')
    
    // Submit form
    const submitButton = page.locator(selectors.searchSubmitButton)
    await submitButton.click()
    
    // Check for error
    await expect(page.locator(selectors.searchError)).toBeVisible()
    await expect(page.getByText(/Latitude must be between/i)).toBeVisible()
  })

  test('keyboard-only flow completes', async ({ page }) => {
    await page.goto('/search')
    
    // Tab to APN input
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Type APN
    await page.keyboard.type('0204050712')
    
    // Tab to submit button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Press Enter to submit
    await page.keyboard.press('Enter')
    
    // Wait for navigation
    await expect(page).toHaveURL(/\/results/)
    await expect(page.locator(selectors.resultsTitle)).toBeVisible()
  })

  test('retry button works after error', async ({ page }) => {
    await page.goto('/search')
    
    // Intercept and return 500 error
    await page.route('**/zoning?*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Server error' }),
      })
    })
    
    // Submit form
    const apnInput = page.locator(selectors.searchInputApn)
    await apnInput.fill('0204050712')
    const submitButton = page.locator(selectors.searchSubmitButton)
    await submitButton.click()
    
    // Wait for error
    await expect(page.locator(selectors.searchError)).toBeVisible()
    
    // Restore successful response
    await page.route('**/zoning?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(sampleResult),
      })
    })
    
    // Click retry
    const retryButton = page.locator(selectors.searchRetryButton)
    await retryButton.click()
    
    // Should navigate to results
    await expect(page).toHaveURL(/\/results/)
  })
})

