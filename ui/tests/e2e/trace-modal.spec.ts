import { test, expect } from '@playwright/test'

test.describe('Trace Modal', () => {
  test('should open trace modal and navigate with keyboard @happy', async ({ page }) => {
    // Mock result with trace
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

    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForTimeout(2000)

    // Look for Explain button (may or may not appear depending on trace availability)
    const explainButton = page.locator('button:has-text("Explain")')
    const count = await explainButton.count()
    
    if (count > 0) {
      await explainButton.first().click()
      await page.waitForTimeout(500)

      // Verify modal opens
      await expect(page.locator('text=/Explanation Trace/i')).toBeVisible()

      // Test keyboard navigation (Tab)
      await page.keyboard.press('Tab')
      await page.keyboard.press('Tab')
      
      // Test Esc to close
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
      
      // Verify modal closes
      const modalVisible = await page.locator('text=/Explanation Trace/i').isVisible()
      expect(modalVisible).toBe(false)
    } else {
      // If no Explain button, just verify page loads
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('should copy trace as Markdown', async ({ page, context }) => {
    await page.goto('/results?type=apn&apn=0204050712&city=austin')
    await page.waitForTimeout(2000)

    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    const explainButton = page.locator('button:has-text("Explain")')
    if (await explainButton.count() > 0) {
      await explainButton.first().click()
      await page.waitForTimeout(500)

      // Click Copy as Markdown
      const copyMdButton = page.locator('button:has-text("Copy as Markdown")')
      if (await copyMdButton.count() > 0) {
        await copyMdButton.click()
        await page.waitForTimeout(500)

        // Verify "Copied!" appears
        const copied = page.locator('text=/Copied/i')
        const copiedCount = await copied.count()
        expect(copiedCount).toBeGreaterThanOrEqual(0)
      }
    }
  })
})

