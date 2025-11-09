import { Page } from '@playwright/test'

/**
 * Playwright helper to retrieve telemetry events from the browser
 */
export async function getTelemetryEvents(page: Page): Promise<any[]> {
  return await page.evaluate(() => {
    // Call the exposed flush function to get all events
    if (typeof (window as any).__telem_flush === 'function') {
      return (window as any).__telem_flush()
    }
    // Fallback: get queue directly
    if (typeof (window as any).__telem_get_queue === 'function') {
      return (window as any).__telem_get_queue()
    }
    return []
  })
}

/**
 * Wait for a specific event type to be recorded
 */
export async function waitForEvent(
  page: Page,
  eventType: string,
  timeout = 5000
): Promise<any> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const events = await getTelemetryEvents(page)
    const event = events.find((e: any) => e.event_type === eventType)
    if (event) {
      return event
    }
    await page.waitForTimeout(100)
  }
  
  throw new Error(`Event type "${eventType}" not found within ${timeout}ms`)
}

