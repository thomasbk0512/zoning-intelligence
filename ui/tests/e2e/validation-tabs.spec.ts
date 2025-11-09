import { test, expect } from '@playwright/test'

test.describe('Validation Scoped to Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search')
  })

  test('No lat/lng errors on NLQ tab', async ({ page }) => {
    // Switch to NLQ tab
    await page.getByRole('tab', { name: /Ask a Question/i }).click()
    
    const nlqInput = page.getByLabel(/Ask a Question/i)
    
    // Type invalid NLQ
    await nlqInput.fill('ab')
    
    // Submit
    await page.getByRole('button', { name: /Search/i }).click()
    
    // Should only show NLQ validation error, not lat/lng
    await expect(page.getByText(/Question must be at least/i)).toBeVisible()
    await expect(page.getByText(/latitude/i)).not.toBeVisible()
    await expect(page.getByText(/longitude/i)).not.toBeVisible()
  })

  test('No lat/lng errors on APN tab', async ({ page }) => {
    // Switch to APN tab
    await page.getByRole('tab', { name: /APN/i }).click()
    
    const apnInput = page.getByLabel(/APN/i)
    
    // Type invalid APN
    await apnInput.fill('123')
    
    // Submit
    await page.getByRole('button', { name: /Search/i }).click()
    
    // Should only show APN validation error, not lat/lng
    await expect(page.getByText(/Invalid APN format|APN is required/i)).toBeVisible()
    await expect(page.getByText(/latitude/i)).not.toBeVisible()
    await expect(page.getByText(/longitude/i)).not.toBeVisible()
  })

  test('No APN/NLQ errors on Location tab', async ({ page }) => {
    // Switch to Location tab
    await page.getByRole('tab', { name: /Location/i }).click()
    
    const latInput = page.getByLabel(/Latitude/i)
    const lngInput = page.getByLabel(/Longitude/i)
    
    // Leave fields empty
    await latInput.fill('')
    await lngInput.fill('')
    
    // Submit
    await page.getByRole('button', { name: /Search/i }).click()
    
    // Should only show location validation errors, not APN/NLQ
    await expect(page.getByText(/latitude/i).or(page.getByText(/longitude/i))).toBeVisible()
    await expect(page.getByText(/APN/i)).not.toBeVisible()
    await expect(page.getByText(/Question/i)).not.toBeVisible()
  })

  test('Validation errors clear when switching tabs', async ({ page }) => {
    // Start on APN tab with error
    await page.getByRole('tab', { name: /APN/i }).click()
    const apnInput = page.getByLabel(/APN/i)
    await apnInput.fill('123')
    await page.getByRole('button', { name: /Search/i }).click()
    
    // Should show error
    await expect(page.getByText(/Invalid|required/i)).toBeVisible()
    
    // Switch to NLQ tab
    await page.getByRole('tab', { name: /Ask a Question/i }).click()
    
    // Error should be cleared
    await expect(page.getByText(/Invalid|required/i)).not.toBeVisible()
  })
})

