import { test, expect } from '@playwright/test'
import { selectors } from './utils/selectors'
import { getTelemetryEvents, waitForEvent } from './utils/telem'
import sampleResult from '../fixtures/sample-result.json'
import { writeFileSync } from 'fs'
import { join } from 'path'

test.describe('Telemetry', () => {
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

  test('captures events for Home → Search → Results flow', async ({ page }) => {
    // Navigate to home
    await page.goto('/')
    
    // Wait for page_view event
    await waitForEvent(page, 'page_view', 3000)
    
    // Navigate to search
    await page.locator(selectors.homeCtaSearch).click()
    await expect(page).toHaveURL(/\/search/)
    
    // Wait for search page_view
    await waitForEvent(page, 'page_view', 3000)
    
    // Submit search
    await page.locator(selectors.searchInputApn).fill('0204050712')
    await page.locator(selectors.searchSubmitButton).click()
    
    // Wait for search_submit event
    await waitForEvent(page, 'search_submit', 3000)
    
    // Wait for results page
    await expect(page).toHaveURL(/\/results/)
    
    // Wait for results_render event
    await waitForEvent(page, 'results_render', 5000)
    
    // Wait for web_vitals events (at least LCP and CLS)
    await page.waitForTimeout(2000) // Give time for Web Vitals to report
    
    // Flush and get all events
    const events = await getTelemetryEvents(page)
    
    // Verify event counts
    const eventCounts = {
      page_view: events.filter((e: any) => e.event_type === 'page_view').length,
      search_submit: events.filter((e: any) => e.event_type === 'search_submit').length,
      results_render: events.filter((e: any) => e.event_type === 'results_render').length,
      web_vitals: events.filter((e: any) => e.event_type === 'web_vitals').length,
    }
    
    expect(eventCounts.page_view).toBeGreaterThanOrEqual(1)
    expect(eventCounts.search_submit).toBeGreaterThanOrEqual(1)
    expect(eventCounts.results_render).toBeGreaterThanOrEqual(1)
    expect(eventCounts.web_vitals).toBeGreaterThanOrEqual(2) // At least LCP and CLS
    
    // Verify event structure
    const pageView = events.find((e: any) => e.event_type === 'page_view')
    expect(pageView).toHaveProperty('timestamp')
    expect(pageView).toHaveProperty('session_id')
    expect(pageView).toHaveProperty('route')
    expect(pageView).toHaveProperty('referrer_type')
    
    const searchSubmit = events.find((e: any) => e.event_type === 'search_submit')
    expect(searchSubmit).toHaveProperty('mode')
    expect(searchSubmit).toHaveProperty('query_len')
    expect(searchSubmit).toHaveProperty('valid')
    expect(searchSubmit.mode).toBe('apn')
    expect(searchSubmit.valid).toBe(true)
    
    const resultsRender = events.find((e: any) => e.event_type === 'results_render')
    expect(resultsRender).toHaveProperty('result_count')
    expect(resultsRender).toHaveProperty('fetch_ms')
    expect(resultsRender).toHaveProperty('render_ms')
    expect(resultsRender).toHaveProperty('schema_fields')
    expect(resultsRender.schema_fields).toBe(11) // All 11 fields should be present
    
    // Verify Web Vitals
    const webVitals = events.filter((e: any) => e.event_type === 'web_vitals')
    const lcp = webVitals.find((e: any) => e.metric === 'LCP')
    const cls = webVitals.find((e: any) => e.metric === 'CLS')
    
    if (lcp) {
      expect(lcp).toHaveProperty('value')
      expect(lcp).toHaveProperty('rating')
    }
    if (cls) {
      expect(cls).toHaveProperty('value')
      expect(cls).toHaveProperty('rating')
    }
    
    // Save events to NDJSON file for validation
    const outputPath = join(process.cwd(), 'artifacts', 'telemetry.ndjson')
    const ndjson = events.map((e: any) => JSON.stringify(e)).join('\n')
    writeFileSync(outputPath, ndjson, 'utf-8')
    
    console.log(`✅ Captured ${events.length} telemetry events`)
    console.log(`   - page_view: ${eventCounts.page_view}`)
    console.log(`   - search_submit: ${eventCounts.search_submit}`)
    console.log(`   - results_render: ${eventCounts.results_render}`)
    console.log(`   - web_vitals: ${eventCounts.web_vitals}`)
  })

  test('captures validation error events', async ({ page }) => {
    await page.goto('/search')
    
    // Submit empty form
    await page.locator(selectors.searchSubmitButton).click()
    
    // Wait for validation_error event
    await waitForEvent(page, 'validation_error', 3000)
    
    const events = await getTelemetryEvents(page)
    const validationError = events.find((e: any) => e.event_type === 'validation_error')
    
    expect(validationError).toBeDefined()
    expect(validationError.field).toBe('apn')
    expect(validationError.reason).toBe('required')
  })
})

