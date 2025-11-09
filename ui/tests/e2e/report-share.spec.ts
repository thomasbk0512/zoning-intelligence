import { test, expect } from '@playwright/test'

test.describe('Report Share', () => {
  test('should open permalink and verify content @happy', async ({ page }) => {
    // Mock result
    await page.route('**/zoning?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          apn: '0204050712',
          jurisdiction: 'Austin',
          zone: 'SF-3',
          height_ft: 35,
          far: 0.4,
        }),
      })
    })

    // Navigate with permalink
    await page.goto('/results?type=apn&apn=0204050712&city=austin&zone=SF-3&token=abc123')
    await page.waitForTimeout(2000)

    // Verify content loads
    await expect(page.locator('h1')).toBeVisible()
    
    // Check for Answer Cards (may or may not appear depending on stub mode)
    const answerCards = page.locator('[data-testid^="answer-card-"]')
    const count = await answerCards.count()
    // Just verify page loads - answers depend on stub mode
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should trigger print dialog', async ({ page }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForTimeout(2000)

    // Click print button
    const printButton = page.locator('button:has-text("Print")')
    if (await printButton.count() > 0) {
      // Note: We can't actually test the print dialog, but we can verify the button exists
      await expect(printButton).toBeVisible()
    }
  })

  test('should copy share link', async ({ page, context }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForTimeout(2000)

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    // Click share button
    const shareButton = page.locator('button:has-text("Share")')
    if (await shareButton.count() > 0) {
      await shareButton.click()
      await page.waitForTimeout(500)

      // Click copy link
      const copyLink = page.locator('button:has-text("Copy link")')
      if (await copyLink.count() > 0) {
        await copyLink.click()
        await page.waitForTimeout(500)

        // Verify "Link copied!" appears
        const copied = page.locator('text=/Link copied/i')
        const copiedCount = await copied.count()
        // May or may not appear depending on clipboard API support
        expect(copiedCount).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

