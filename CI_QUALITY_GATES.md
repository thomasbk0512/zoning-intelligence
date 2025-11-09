# CI Quality Gates

This document describes the optional quality gates that can be enabled in CI for enhanced testing and validation.

## Overview

The CI pipeline includes optional jobs that can be enabled via repository variables:
- **E2E Tests**: Playwright end-to-end tests
- **Lighthouse CI**: Performance, accessibility, best practices, and SEO audits

These jobs are **disabled by default** to keep CI fast and stable. Enable them when needed for comprehensive quality checks.

## Enabling Quality Gates

### E2E Tests

1. Go to: **Settings → Secrets and variables → Actions → Variables**
2. Add variable: `E2E_ENABLE` = `true`
3. Push a commit or manually trigger CI

The E2E job will run Playwright tests (when implemented) against the built UI.

### Lighthouse CI

1. Go to: **Settings → Secrets and variables → Actions → Variables**
2. Add variable: `LH_ENABLE` = `true`
3. Push a commit or manually trigger CI

The Lighthouse job will:
- Build the UI
- Run Lighthouse audits
- Check thresholds (≥90 for perf/a11y/best/SEO)

## Quick Enable

```bash
# Using GitHub CLI (requires authentication)
gh variable set E2E_ENABLE --body "true" --repo thomasbk0512/zoning-intelligence
gh variable set LH_ENABLE --body "true" --repo thomasbk0512/zoning-intelligence
```

## Route Smoke Checklist

When E2E tests are enabled, the following routes should be tested:

### Home Page (`/`)
- [ ] Page loads without errors
- [ ] "Search Property" button navigates to `/search`
- [ ] Header navigation links work
- [ ] Single `<h1>` present
- [ ] Landmarks present (`header`, `main`, `footer`)

### Search Page (`/search`)
- [ ] Page loads without errors
- [ ] APN tab selected by default
- [ ] Can switch between APN and Location tabs
- [ ] Invalid APN shows inline error
- [ ] Invalid Lat/Lng shows inline errors
- [ ] Submit button disabled when form invalid
- [ ] Valid submission navigates to `/results` with query params
- [ ] URL params persist on tab switch
- [ ] Single `<h1>` present
- [ ] Form accessible via keyboard

### Results Page (`/results`)
- [ ] Page loads without errors
- [ ] Loading state shows skeletons
- [ ] Success state shows 11-field schema
- [ ] Empty state shows "No Results" with "New Search" button
- [ ] Error state shows error message with "Retry Search" button
- [ ] Deep link with query params fetches and displays data
- [ ] "New Search" button navigates to `/search`
- [ ] "Retry Search" button re-fetches data
- [ ] Single `<h1>` present
- [ ] ARIA live region announces status changes
- [ ] Map displays (if geometry present)

### Navigation Flow
- [ ] Home → Search → Results → New Search (keyboard only)
- [ ] Focus order is logical
- [ ] Focus rings visible (2px, not clipped)
- [ ] Active page indicated in nav

## Accessibility Checks

### Text Contrast
- [ ] Body text ≥4.5:1 contrast on white
- [ ] UI chrome ≥3:1 contrast
- [ ] Interactive elements have visible focus states

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Tab order is logical
- [ ] Focus management on route change
- [ ] Focus management on error

### Screen Reader Support
- [ ] One `<h1>` per page
- [ ] Landmarks present (`header`, `main`, `footer`)
- [ ] `aria-live` regions announce status
- [ ] Form errors associated with inputs via `aria-describedby`
- [ ] Current page indicated with `aria-current="page"`

## Performance Thresholds

When Lighthouse CI is enabled, the following thresholds are checked:
- **Performance**: ≥90
- **Accessibility**: ≥90
- **Best Practices**: ≥90
- **SEO**: ≥90

## Schema Contract

The Results page must display exactly **11 fields** from the API response:

1. `apn` (string)
2. `jurisdiction` (string)
3. `zone` (string)
4. `setbacks_ft` (object: front, side, rear, street_side)
5. `height_ft` (number)
6. `far` (number)
7. `lot_coverage_pct` (number)
8. `overlays` (array)
9. `sources` (array)
10. `notes` (string)
11. `run_ms` (number)

**This schema is frozen and must not change.**

## Disabling Quality Gates

To disable quality gates, either:
1. Remove the repository variables (`E2E_ENABLE`, `LH_ENABLE`)
2. Set them to `false`

The jobs will show "SKIPPED (flag=false)" in CI logs.

## CI Job Status

When quality gates are disabled, CI logs will show:
```
SKIPPED (flag=false): E2E_ENABLE is not set to 'true'
To enable: Settings → Secrets and variables → Actions → Variables → Add E2E_ENABLE=true
```

This is expected behavior and does not indicate a failure.
