# E2E Testing Guide

This guide covers running and debugging end-to-end (E2E) tests for the Zoning Intelligence UI.

## Overview

E2E tests use Playwright to test the complete user flows:
- **Home → Search → Results** (happy paths)
- Input validation and error handling
- Keyboard navigation and accessibility
- State transitions and loading states

## Prerequisites

```bash
cd ui
npm install
npx playwright install --with-deps chromium
```

## Running Tests Locally

### Quick Start

```bash
cd ui
npm run build
npm run serve &
npm run test:e2e
```

### With Stub Mode (Recommended)

Stub mode uses fixture data instead of live API calls, making tests deterministic:

```bash
cd ui
E2E_STUB=1 npm run build
E2E_STUB=1 npm run serve &
E2E_STUB=1 npm run test:e2e
```

### Without Stub Mode (Live API)

For testing against a real backend:

```bash
cd ui
# Start backend on port 8000
npm run build
npm run serve &
npm run test:e2e
```

## Test Structure

```
ui/tests/e2e/
├── home.spec.ts          # Home page tests
├── search.spec.ts        # Search form tests
├── results.spec.ts       # Results page tests
├── fixtures/             # Test data fixtures
│   ├── sample-result.json
│   └── sample-result-lat-lng.json
└── utils/
    ├── selectors.ts      # Centralized selectors
    └── helpers.ts        # Test helper functions
```

## Test Coverage

### Home Page (`home.spec.ts`)
- ✅ Page loads successfully
- ✅ Skip link focus works
- ✅ CTA navigates to Search

### Search Page (`search.spec.ts`)
- ✅ Valid APN search navigates to results
- ✅ Valid lat/lng search navigates to results
- ✅ Invalid input shows inline error
- ✅ Invalid lat/lng shows error
- ✅ Keyboard-only flow completes
- ✅ Retry button works after error

### Results Page (`results.spec.ts`)
- ✅ Deep-link load via query params performs fetch
- ✅ Renders all 11 fields
- ✅ Numeric fields within tolerance (±0.1 ft)
- ✅ State transitions: loading skeleton → success
- ✅ Retry path for forced 500
- ✅ No console errors during tests
- ✅ ARIA live updates on load
- ✅ Input errors expose aria-errormessage

## Selectors

Tests use `data-testid` attributes for stable, semantic selectors:

- `home-cta-search` - Home page CTA button
- `search-form` - Search form
- `search-input-apn` - APN input field
- `search-input-latitude` - Latitude input field
- `search-input-longitude` - Longitude input field
- `search-submit-button` - Submit button
- `search-error` - Error message container
- `search-retry-button` - Retry button
- `results-title` - Results page title
- `results-content` - Results content region
- `results-print-button` - Print button
- `results-new-search-button` - New search button

## Fixtures

Test fixtures are located in `ui/tests/e2e/fixtures/` and contain sample API responses matching the 11-field schema:

- `sample-result.json` - Sample result for APN search
- `sample-result-lat-lng.json` - Sample result for lat/lng search

### Preparing Fixtures

Fixtures are automatically prepared by the seed script:

```bash
cd ui
node scripts/e2e/seed.mjs
```

The script:
1. Attempts to extract data from `tests/golden/` (if available)
2. Falls back to sample fixtures if golden tests are not found
3. Writes fixtures to `ui/tests/e2e/fixtures/`

## Network Interception

Tests use Playwright's route interception to mock API responses:

```typescript
await page.route('**/zoning?*', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(sampleResult),
  })
})
```

This ensures:
- **Deterministic tests** - No dependency on live API
- **Fast execution** - No network latency
- **Isolated failures** - Backend issues don't affect tests

## Debugging

### View Test Report

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Debug Mode

Run tests in debug mode with Playwright Inspector:

```bash
npx playwright test --debug
```

### Trace Viewer

Traces are captured on retry. View them:

```bash
npx playwright show-trace trace.zip
```

### Screenshots and Videos

Screenshots and videos are captured on failure:
- Screenshots: `ui/test-results/`
- Videos: `ui/test-results/`

### Console Logs

Check browser console logs:

```typescript
page.on('console', (msg) => {
  console.log('Browser console:', msg.text())
})
```

## CI Integration

E2E tests run in CI when `E2E_ENABLE=true`:

1. Builds production app
2. Prepares fixtures via seed script
3. Starts static server on port 4173
4. Runs Playwright tests with stub mode
5. Uploads artifacts (HTML report, traces, videos, screenshots)

### Artifacts

CI uploads the following artifacts:
- `playwright-report/` - HTML test report
- `test-results/` - Screenshots, videos, traces

Access artifacts via GitHub Actions → Artifacts.

## Common Issues

### Tests Timeout

- Increase timeout in `playwright.config.js`
- Check if server is running on port 4173
- Verify fixtures are present

### Network Errors

- Ensure stub mode is enabled (`E2E_STUB=1`)
- Check route interception is working
- Verify fixture JSON is valid

### Selector Not Found

- Check `data-testid` attribute is present
- Verify selector in `utils/selectors.ts`
- Use Playwright Inspector to debug

### Flaky Tests

- Tests have 1 retry configured
- Check for race conditions
- Verify async operations complete

## Best Practices

1. **Use data-testid** - Avoid brittle CSS selectors
2. **Mock network** - Use route interception for deterministic tests
3. **Wait explicitly** - Use `expect().toBeVisible()` instead of `waitForTimeout()`
4. **Test accessibility** - Verify ARIA attributes and keyboard navigation
5. **Keep tests focused** - One assertion per test when possible
6. **Use fixtures** - Centralize test data

## Schema Contract

E2E tests verify the 11-field output schema:

- `apn` - Assessor's Parcel Number
- `jurisdiction` - Jurisdiction name
- `zone` - Zoning designation
- `setbacks_ft` - Setback distances (front, side, rear, street_side)
- `height_ft` - Height limit
- `far` - Floor Area Ratio
- `lot_coverage_pct` - Lot coverage percentage
- `overlays` - Overlay districts
- `sources` - Data sources
- `notes` - Additional notes
- `run_ms` - Query execution time

Tolerance: ±0.1 ft for distance measurements, exact for height.

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Test Selectors Guide](https://playwright.dev/docs/selectors)

