// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Flake-resistant: 1 retry
  workers: process.env.CI ? 1 : undefined,
  timeout: 30000, // 30s per test
  reporter: [
    ['html'],
    ['list'],
  ],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry', // Trace on retry for debugging
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Desktop viewport only (no mobile emulation for E2E)
        viewport: { width: 1280, height: 720 },
      },
    },
  ],
  // Note: webServer is handled by CI workflow (serve command)
  // For local runs, start server manually: npm run serve
});

