import { Page, expect } from '@playwright/test'
import type { ZoningResult } from '../../../src/types'

/**
 * Helper functions for E2E tests
 */

/**
 * Wait for ARIA live region to announce text
 */
export async function waitForAriaAnnouncement(
  page: Page,
  expectedText: string,
  timeout = 5000
): Promise<void> {
  await expect(
    page.locator('[role="status"][aria-live]')
  ).toContainText(expectedText, { timeout })
}

/**
 * Check that all 11 fields are present in the results
 */
export async function verifyZoningResultFields(page: Page, result: ZoningResult): Promise<void> {
  // Required fields
  await expect(page.getByText(result.apn)).toBeVisible()
  await expect(page.getByText(result.jurisdiction)).toBeVisible()
  await expect(page.getByText(result.zone)).toBeVisible()
  
  // Setbacks
  await expect(page.getByText(result.setbacks_ft.front.toString())).toBeVisible()
  await expect(page.getByText(result.setbacks_ft.side.toString())).toBeVisible()
  await expect(page.getByText(result.setbacks_ft.rear.toString())).toBeVisible()
  
  // Limits
  await expect(page.getByText(result.height_ft.toString())).toBeVisible()
  await expect(page.getByText(result.far.toString())).toBeVisible()
  await expect(page.getByText(result.lot_coverage_pct.toString())).toBeVisible()
  
  // Sources (at least one)
  expect(result.sources.length).toBeGreaterThan(0)
  await expect(page.getByText(result.sources[0].type)).toBeVisible()
  
  // Run time
  await expect(page.getByText(result.run_ms.toString())).toBeVisible()
}

/**
 * Verify numeric fields are within tolerance (±0.1 ft)
 */
export function verifyTolerance(actual: number, expected: number, tolerance = 0.1): boolean {
  return Math.abs(actual - expected) <= tolerance
}

/**
 * Check for console errors
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  
  return errors
}

