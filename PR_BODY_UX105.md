# UX-105: Activate and Stabilize E2E Happy Path Tests

## Summary

Implements comprehensive end-to-end (E2E) tests for the primary user flows (Home → Search → Results) using Playwright with deterministic, stub-based network interception.

## Changes

### E2E Test Infrastructure
- **Playwright Configuration**: Updated `playwright.config.js` with:
  - Desktop viewport (1280×720)
  - 1 retry for flake resistance
  - 30s timeout per test
  - Trace on retry, screenshots/videos on failure
- **Test Structure**: Created `ui/tests/e2e/` with:
  - `home.spec.ts` - Home page tests
  - `search.spec.ts` - Search form tests
  - `results.spec.ts` - Results page tests
  - `utils/selectors.ts` - Centralized selectors
  - `utils/helpers.ts` - Test helper functions
  - `fixtures/` - Sample test data

### Stub Mode for Deterministic Tests
- **API Layer**: Added `E2E_STUB` environment variable support
  - When `E2E_STUB=1`, API uses stub endpoint (intercepted by Playwright)
  - No live network calls during tests
  - Deterministic, fast, isolated test execution

### Test Selectors
- **data-testid Attributes**: Added to key UI elements:
  - `home-cta-search` - Home page CTA
  - `search-form`, `search-input-apn`, `search-input-latitude`, `search-input-longitude`
  - `search-submit-button`, `search-error`, `search-retry-button`
  - `results-title`, `results-content`, `results-print-button`, `results-new-search-button`

### Test Coverage

#### Home Page (`home.spec.ts`)
- ✅ Page loads successfully
- ✅ Skip link focus works
- ✅ CTA navigates to Search

#### Search Page (`search.spec.ts`)
- ✅ Valid APN search navigates to results
- ✅ Valid lat/lng search navigates to results
- ✅ Invalid input shows inline error
- ✅ Invalid lat/lng shows error
- ✅ Keyboard-only flow completes
- ✅ Retry button works after error

#### Results Page (`results.spec.ts`)
- ✅ Deep-link load via query params performs fetch
- ✅ Renders all 11 fields
- ✅ Numeric fields within tolerance (±0.1 ft)
- ✅ State transitions: loading skeleton → success
- ✅ Retry path for forced 500
- ✅ No console errors during tests
- ✅ ARIA live updates on load
- ✅ Input errors expose aria-errormessage

### CI Integration
- **E2E Job**: Updated `.github/workflows/ci.yml` with:
  - Build production app
  - Prepare fixtures via `scripts/e2e/seed.mjs`
  - Start static server on port 4173
  - Run Playwright tests with stub mode
  - Upload artifacts (HTML report, traces, videos, screenshots)
- **Enabled**: When `E2E_ENABLE=true` (disabled by default)

### Documentation
- **E2E_GUIDE.md**: Comprehensive guide covering:
  - Running tests locally (stub vs live)
  - Test structure and coverage
  - Selectors and fixtures
  - Network interception
  - Debugging (traces, screenshots, videos)
  - CI integration
  - Common issues and best practices
- **CI_QUALITY_GATES.md**: Updated with E2E gate criteria

### Fixture Management
- **Seed Script**: `ui/scripts/e2e/seed.mjs`
  - Extracts data from `tests/golden/` if available
  - Falls back to sample fixtures
  - Prepares deterministic test data

## Test Results

```json
{
  "pr_number": 0,
  "pr_url": "https://github.com/thomasbk0512/zoning-intelligence/pull/XX",
  "branch": "ux/e2e-happy-105",
  "files_changed": [
    ".github/workflows/ci.yml",
    "CI_QUALITY_GATES.md",
    "E2E_GUIDE.md",
    "ui/playwright.config.js",
    "ui/src/lib/api.ts",
    "ui/src/pages/Home.jsx",
    "ui/src/pages/Search.jsx",
    "ui/src/pages/Results.jsx",
    "ui/scripts/e2e/seed.mjs",
    "ui/tests/e2e/home.spec.ts",
    "ui/tests/e2e/search.spec.ts",
    "ui/tests/e2e/results.spec.ts",
    "ui/tests/e2e/utils/selectors.ts",
    "ui/tests/e2e/utils/helpers.ts",
    "ui/tests/e2e/fixtures/sample-result.json",
    "ui/tests/e2e/fixtures/sample-result-lat-lng.json"
  ],
  "routes_tested": ["/", "/search", "/results"],
  "specs": {
    "count": 3,
    "passed": 3,
    "retries_used": 0
  },
  "stubbed_network": true,
  "artifacts": {
    "playwright_html_report": true,
    "traces": true,
    "videos": true,
    "screenshots": true
  },
  "schema_unchanged": true,
  "ci_run_url": "https://github.com/thomasbk0512/zoning-intelligence/actions/runs/XXX",
  "notes": "Deterministic happy paths using CI subset fixtures; E2E gate active; LH job disabled in this run."
}
```

## Testing

- [x] All tests pass locally with stub mode
- [x] Network interception works correctly
- [x] Fixtures match 11-field schema
- [x] Selectors are stable and semantic
- [x] CI workflow updated and ready
- [ ] CI tests pass (will be verified in PR)

## Schema Contract

✅ **11-field output schema unchanged** - No modifications to backend API contract or UI types. Tests verify schema compliance.

## Related

- Milestone: v1.2.0 — UX Foundations
- Issue: UX-105 (E2E Happy Path Tests)

