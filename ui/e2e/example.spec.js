// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Zoning Intelligence E2E', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Zoning Intelligence/i);
  });

  // TODO: Add E2E tests for:
  // - APN search happy path
  // - Lat/Lng search happy path
  // - Error states + retry
  // See issues in v1.1.1 milestone
});

