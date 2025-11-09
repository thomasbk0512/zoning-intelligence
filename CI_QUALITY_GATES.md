# CI Quality Gates (v1.1.1)

## Overview

Two optional CI jobs have been added for quality assurance:

1. **E2E Tests** - Playwright-based end-to-end tests
2. **Lighthouse CI** - Performance, accessibility, best practices, and SEO audits

Both jobs are **disabled by default** and can be enabled via repository variables.

## Enabling Quality Gates

### Via Repository Variables

1. Go to **Settings → Secrets and variables → Actions → Variables**
2. Add variables:
   - `E2E_ENABLE` = `true` (to enable E2E tests)
   - `LH_ENABLE` = `true` (to enable Lighthouse CI)

**Quick Enable**:
- Settings → Secrets and variables → Actions → Variables → New repository variable
- Name: `E2E_ENABLE`, Value: `true` (repeat for `LH_ENABLE`)
- CI will show "SKIPPED (flag=false)" when disabled

### Via Workflow Dispatch (Future)

Workflows can be triggered manually with these flags set.

## E2E Tests

**Location**: `ui/e2e/`

**Framework**: Playwright

**Current Status**: Scaffolded (placeholder test only)

**Planned Tests** (see v1.1.1 milestone issues):
- Happy paths: APN search, Lat/Lng search
- Error states: network failures, retry functionality
- Validation: input validation, error messages

**Running Locally**:
```bash
cd ui
npm install
npx playwright install
npm run test:e2e
```

## Lighthouse CI

**Config**: `ui/lighthouserc.json`

**Targets** (Mobile Emulation):
- **Performance**: ≥90
- **Accessibility**: ≥95 (from UX-103)
- **Best Practices**: ≥90
- **SEO**: ≥90

**Core Web Vitals**:
- **LCP** (Largest Contentful Paint): ≤2.5s
- **CLS** (Cumulative Layout Shift): ≤0.10
- **TBT** (Total Blocking Time): ≤200ms
- **FCP** (First Contentful Paint): ≤2.0s
- **Speed Index**: ≤3.4s
- **TTI** (Time to Interactive): ≤3.8s

**Pages Tested**:
- `/` (Home)
- `/search` (Search)
- `/results` (Results with sample query)

**Running Locally**:
```bash
cd ui
npm install
npm install -g @lhci/cli
npm run build
npm run serve &
# Wait for "Serving!" message
lhci autorun
```

**Artifacts**:
- Reports saved to `ui/.lighthouseci/`
- Uploaded as `lighthouse-reports` artifact in CI
- Retention: 7 days

## Acceptance Criteria

- [ ] E2E tests cover happy paths (APN, Lat/Lng)
- [ ] E2E tests cover error states + retry
- [ ] Lighthouse CI passes with ≥90 in all categories
- [ ] Both jobs run successfully when enabled
- [ ] CI remains green with flags disabled (default)

## Related Issues

See v1.1.1 milestone:
- E2E: happy paths (APN, Lat/Lng)
- E2E: error states + retry
- Lighthouse CI: ≥90 perf/a11y/best/SEO

