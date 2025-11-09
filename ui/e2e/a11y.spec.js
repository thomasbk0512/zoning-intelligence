import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { writeFileSync } from 'fs'
import { join } from 'path'

const routes = [
  { path: '/', name: 'Home' },
  { path: '/search', name: 'Search' },
  { path: '/results?type=apn&apn=0204050712&city=austin', name: 'Results' },
]

test.describe('Accessibility audit', () => {
  for (const route of routes) {
    test(`${route.name} page should have no serious/critical violations`, async ({ page }) => {
      await page.goto(route.path)
      
      // Wait for page to be interactive
      await page.waitForLoadState('networkidle')
      
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()
      
      const seriousOrCritical = accessibilityScanResults.violations.filter(
        v => v.impact === 'serious' || v.impact === 'critical'
      )
      
      // Write detailed report
      const reportDir = join(process.cwd(), 'ui', 'pw-a11y-reports')
      const reportPath = join(reportDir, `${route.name.toLowerCase()}-a11y-report.json`)
      writeFileSync(reportPath, JSON.stringify(accessibilityScanResults, null, 2))
      
      // Take screenshot
      const screenshotPath = join(reportDir, `${route.name.toLowerCase()}-screenshot.png`)
      await page.screenshot({ path: screenshotPath, fullPage: true })
      
      expect(seriousOrCritical).toHaveLength(0)
    })
  }
})

