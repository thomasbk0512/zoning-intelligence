# Quality Gates Playbook

This document describes how quality gates work, how to read artifacts, and how to configure branch protection.

## Overview

Quality gates aggregate results from multiple CI jobs (E2E, Lighthouse, Telemetry, A11y) and produce a single pass/fail verdict. All gates are **blocking** on pull requests and releases.

## Thresholds

### E2E Tests
- **Pass:** All `@happy` tagged tests must pass
- **Retries:** 0 retries used (tests must pass on first attempt)
- **Console Errors:** No critical console errors during test execution

### Lighthouse (Mobile Emulation)
- **Performance:** ≥90
- **Accessibility:** ≥95
- **Best Practices:** ≥90
- **SEO:** ≥90

### Core Web Vitals
- **LCP** (Largest Contentful Paint): ≤2.5s
- **CLS** (Cumulative Layout Shift): ≤0.10
- **TBT** (Total Blocking Time): ≤200ms

### Accessibility
- **Serious/Critical Violations:** 0
- **Contrast Failures:** 0

### Telemetry
- **Schema Validation:** Must pass (all events validate against JSON Schema)

### Bundle Size
- **Script Growth:** ≤35KB gzip vs baseline
- **Total Size:** Enforced via Lighthouse budget assertions

## Reading Artifacts

### Quality Gates Summary

The `quality-gates-summary` artifact contains `qg-summary.json`:

```json
{
  "verdict": "PASS" | "FAIL",
  "gates": {
    "e2e_pass": true,
    "e2e_retries_used": 0,
    "lh": {
      "/": {"performance": 90, "accessibility": 95, ...},
      "/search": {...},
      "/results": {...}
    },
    "cwv": {"lcp_s": 2.5, "cls": 0.10, "tbt_ms": 200},
    "a11y_serious_or_higher": 0,
    "contrast_failures": 0,
    "telemetry_schema_validation_pass": true,
    "bundle_growth_gzip_kb": "<=35"
  },
  "errors": ["list of threshold violations"]
}
```

### Individual Job Artifacts

- **playwright-report**: HTML test report + JSON summary
- **lighthouse-reports**: Lighthouse JSON reports for each route
- **telemetry-artifacts**: `telemetry.ndjson` with captured events
- **quality-gates-summary**: Aggregated summary JSON

## Branch Protection Setup

To make quality gates blocking on PRs:

1. Go to **Settings → Branches → Branch protection rules**
2. Add or edit rule for `main` branch
3. Under **Require status checks to pass before merging**:
   - Check **Require branches to be up to date before merging**
   - Add required status check: **quality-gates**
4. Save changes

### Required Status Check Name

The check name is: **quality-gates** (matches the job name in CI workflow)

## Flaky Test Quarantine

If a test is flaky:

1. **Tag the test** with `@flaky`:
   ```typescript
   test('flaky test @flaky', async ({ page }) => {
     // test code
   })
   ```

2. **Create a follow-up issue**:
   - Title: `Fix flaky test: [test name]`
   - Label: `bug`, `testing`
   - Assign to milestone

3. **Exclude from blocking runs**:
   - Tests tagged `@flaky` are automatically excluded in CI (via `grep: /@happy/`)
   - Only `@happy` tagged tests run in blocking quality gates

4. **Fix and re-tag**:
   - Once fixed, remove `@flaky` tag and add `@happy` tag
   - Test will be included in blocking runs

## Failure Triage

### E2E Failures

1. **Check Playwright HTML report**:
   - Download `playwright-report` artifact
   - Open `index.html` in browser
   - Review screenshots/videos for failed tests

2. **Check retries**:
   - If `e2e_retries_used > 0`, test passed on retry (not acceptable)
   - Investigate flakiness and tag with `@flaky` if needed

3. **Check console errors**:
   - Review test logs for console.error messages
   - Fix source of errors

### Lighthouse Failures

1. **Check individual route scores**:
   - Download `lighthouse-reports` artifact
   - Review JSON reports for each route
   - Identify which metric failed

2. **Performance < 90**:
   - Check bundle size (should be ≤35KB gzip growth)
   - Review Core Web Vitals (LCP, CLS, TBT)
   - Optimize JavaScript/CSS loading

3. **Accessibility < 95**:
   - Review a11y violations
   - Fix ARIA attributes, contrast issues
   - Ensure keyboard navigation works

### CWV Failures

1. **LCP > 2.5s**:
   - Optimize largest contentful paint element
   - Preload critical resources
   - Reduce server response time

2. **CLS > 0.10**:
   - Add explicit dimensions to images
   - Reserve space for dynamic content
   - Avoid inserting content above existing content

3. **TBT > 200ms**:
   - Defer non-critical JavaScript
   - Split long tasks
   - Reduce main thread blocking

### A11y Failures

1. **Serious/Critical Violations**:
   - Review `axe-report.json` artifact
   - Fix violations (ARIA, semantic HTML, keyboard navigation)

2. **Contrast Failures**:
   - Review `contrast-report.json` artifact
   - Update color tokens to meet WCAG 2.1 AA (4.5:1 for text, 3:1 for UI)

### Telemetry Failures

1. **Schema Validation Failed**:
   - Review `telemetry.ndjson` artifact
   - Check for missing required fields
   - Verify event structure matches schema

2. **Missing Events**:
   - Ensure telemetry is enabled (`TELEM_ENABLE=true`)
   - Check that events are being tracked in code
   - Verify E2E test captured events

## Local Testing

### Run Quality Gates Locally

```bash
cd ui

# 1. Build and serve
npm run build
npm run serve &

# 2. Run E2E tests
E2E_STUB=1 npm run test:e2e

# 3. Run Lighthouse CI
lhci autorun

# 4. Run telemetry validation
node scripts/telemetry/validate.mjs artifacts/telemetry.ndjson

# 5. Aggregate results
npm run qg:aggregate

# 6. Check thresholds
npm run qg:check
```

### View Summary

```bash
cat ui/artifacts/qg-summary.json | jq
```

## CI Configuration

### Default Flags

All quality gates are **enabled by default** for PRs to `main` and tag builds:

- `E2E_ENABLE=true`
- `LH_ENABLE=true`
- `TELEM_ENABLE=true`

### Disabling Gates (Not Recommended)

To disable a gate temporarily:

1. Go to **Settings → Secrets and variables → Actions → Variables**
2. Set variable to `false`:
   - `E2E_ENABLE=false`
   - `LH_ENABLE=false`
   - `TELEM_ENABLE=false`

**Note:** Disabling gates will cause the quality-gates job to fail (missing artifacts).

## Artifact Structure

```
artifacts/
├── qg-summary.json          # Aggregated summary
├── telemetry.ndjson         # Telemetry events
├── axe-report.json          # A11y violations (optional)
└── contrast-report.json     # Contrast failures (optional)

playwright-report/
├── index.html               # HTML test report
└── report.json              # JSON test report

.lighthouseci/
├── *.json                   # Lighthouse reports per route
```

## Troubleshooting

### Quality Gates Job Fails

1. **Check dependencies**: Ensure all required jobs completed successfully
2. **Check artifacts**: Verify artifacts were uploaded by dependent jobs
3. **Check logs**: Review quality-gates job logs for aggregation errors

### Missing Artifacts

1. **Check job dependencies**: Ensure `e2e-tests`, `lighthouse`, `telemetry-validate` jobs ran
2. **Check artifact uploads**: Verify artifacts were uploaded in dependent jobs
3. **Check artifact names**: Ensure artifact names match expected patterns

### Threshold Not Met

1. **Review error messages**: Check `qg-summary.json` for specific violations
2. **Review individual reports**: Check job-specific artifacts for details
3. **Fix and re-run**: Address issues and push changes

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Web Vitals](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

