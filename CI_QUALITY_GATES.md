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

**Config**: `ui/.lighthouserc.json`

**Targets**: ≥90 in all categories
- Performance
- Accessibility
- Best Practices
- SEO

**Pages Tested**:
- `/` (Home)
- `/search` (Search)
- `/results` (Results)

**Running Locally**:
```bash
cd ui
npm install
npm install -g @lhci/cli
npm run build
npm run preview &
lhci autorun
```

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

