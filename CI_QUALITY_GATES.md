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

**Location**: `ui/tests/e2e/`

**Framework**: Playwright

**Status**: ✅ Active (happy paths implemented)

**Coverage**:
- ✅ Home page: loads, skip-link focus, CTA navigation
- ✅ Search page: APN/lat-lng search, validation, keyboard flow, retry
- ✅ Results page: deep-link load, 11-field rendering, tolerance checks, state transitions, ARIA live

**Running Locally**:
```bash
cd ui
npm install
npx playwright install --with-deps chromium
npm run build
npm run serve &
E2E_STUB=1 npm run test:e2e
```

**CI Configuration**:
- Enabled when `E2E_ENABLE=true`
- Uses stub mode (`E2E_STUB=1`) for deterministic tests
- Retries: 1 (flake-resistant)
- Timeout: 30s per test
- Artifacts: HTML report, traces, videos, screenshots

**See**: `E2E_GUIDE.md` for detailed documentation

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

- [x] E2E tests cover happy paths (APN, Lat/Lng)
- [x] E2E tests cover error states + retry
- [ ] Lighthouse CI passes with ≥90 in all categories
- [x] Both jobs run successfully when enabled
- [x] CI remains green with flags disabled (default)

## E2E Gate Criteria

- ✅ All happy-path specs pass on CI with 0 retries
- ✅ Intercepted requests return fixture data; no live calls
- ✅ Results page renders 11 fields; tolerance checks pass
- ✅ ARIA live updates on load; input errors expose aria-errormessage
- ✅ No console errors during tests
- ✅ CI uploads Playwright HTML report + traces/videos/screenshots
- ✅ App bundle and schema unchanged; CI green

## Related Issues

See v1.1.1 milestone:
- E2E: happy paths (APN, Lat/Lng)
- E2E: error states + retry
- Lighthouse CI: ≥90 perf/a11y/best/SEO

