# CI Quality Gates (v1.3.0)

## Overview

Quality gates aggregate results from multiple CI jobs and produce a **single blocking verdict** for pull requests and releases.

**Status**: ✅ **BLOCKING** - All gates must pass for PRs to merge

### Quality Gate Jobs

1. **E2E Tests** - Playwright-based end-to-end tests (`@happy` tagged)
2. **Lighthouse CI** - Performance, accessibility, best practices, and SEO audits
3. **Telemetry Validation** - Schema validation for telemetry events
4. **Answers** - Rules engine and golden fixture validation
5. **Quality Gates Aggregator** - Produces single pass/fail verdict

All gates are **enabled by default** for PRs to `main` and tag builds.

## Thresholds Table

| Gate | Threshold | Status |
|------|-----------|--------|
| **E2E Tests** | All `@happy` tests pass, 0 retries | ✅ Blocking |
| **Lighthouse Performance** | ≥90 (mobile) | ✅ Blocking |
| **Lighthouse Accessibility** | ≥95 (mobile) | ✅ Blocking |
| **Lighthouse Best Practices** | ≥90 (mobile) | ✅ Blocking |
| **Lighthouse SEO** | ≥90 (mobile) | ✅ Blocking |
| **LCP** | ≤2.5s | ✅ Blocking |
| **CLS** | ≤0.10 | ✅ Blocking |
| **TBT** | ≤200ms | ✅ Blocking |
| **A11y Violations** | 0 serious/critical | ✅ Blocking |
| **Contrast Failures** | 0 | ✅ Blocking |
| **Telemetry Schema** | Validation passes | ✅ Blocking |
| **Answers** | All golden zones have answers (no missing) | ✅ Blocking |
| **Overrides** | Schema valid, no expired, applied to goldens | ✅ Blocking |
| **Overlays & Exceptions** | Configs valid, unit tests pass, conflicts resolved | ✅ Blocking |
| **Jurisdictions** | Registry valid, resolver tests pass, ETJ answers correct | ✅ Blocking |
| **Citations Integrity** | Manifests valid, anchors valid, hash matches, all citations resolved | ✅ Blocking |
| **Bundle Growth** | ≤35KB gzip | ✅ Blocking |

## Enabling Quality Gates

**Default**: All gates are **enabled by default** for PRs to `main` and tag builds.

### Disabling Gates (Not Recommended)

To temporarily disable a gate:

1. Go to **Settings → Secrets and variables → Actions → Variables**
2. Set variable to `false`:
   - `E2E_ENABLE=false`
   - `LH_ENABLE=false`
   - `TELEM_ENABLE=false`

**Note**: Disabling gates will cause the quality-gates aggregator to fail (missing artifacts).

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

## Telemetry Validation

**Location**: `ui/scripts/telemetry/validate.mjs`

**Status**: ✅ Active

**Coverage**:
- ✅ Event schema validation (JSON Schema via ajv)
- ✅ PII safety checks (no raw queries, APNs, coordinates)
- ✅ Event counts verification (minimum thresholds)
- ✅ Web Vitals capture (LCP, CLS, INP, FCP, TTFB)

**Running Locally**:
```bash
cd ui
npm run build
npm run serve &
npm run test:e2e tests/e2e/telemetry.spec.ts
node scripts/telemetry/validate.mjs artifacts/telemetry.ndjson
```

**CI Configuration**:
- Enabled by default (`TELEM_ENABLE=true`)
- Uses console transport (no outbound network)
- Validates events against JSON Schema
- Uploads `telemetry.ndjson` as artifact

**Event Types**:
- `page_view` - Page navigation events
- `search_submit` - Search form submissions
- `validation_error` - Form validation errors
- `results_render` - Results page renders
- `error_shown` - Error states
- `web_vitals` - Core Web Vitals metrics

**See**: `UX_TELEMETRY.md` for detailed documentation

## Acceptance Criteria

- [x] E2E tests cover happy paths (APN, Lat/Lng)
- [x] E2E tests cover error states + retry
- [ ] Lighthouse CI passes with ≥90 in all categories
- [x] Both jobs run successfully when enabled
- [x] CI remains green with flags disabled (default)
- [x] Telemetry validation passes (schema + PII checks)

## E2E Gate Criteria

- ✅ All happy-path specs pass on CI with 0 retries
- ✅ Intercepted requests return fixture data; no live calls
- ✅ Results page renders 11 fields; tolerance checks pass
- ✅ ARIA live updates on load; input errors expose aria-errormessage
- ✅ No console errors during tests
- ✅ CI uploads Playwright HTML report + traces/videos/screenshots
- ✅ App bundle and schema unchanged; CI green

## Quality Gates Aggregator

**Job Name**: `quality-gates`

**Status**: ✅ **BLOCKING** - Must pass for PRs to merge

**Dependencies**: `e2e-tests`, `lighthouse`, `telemetry-validate`

**Output**: 
- `qg-summary.json` - Aggregated summary with pass/fail verdict
- GitHub Step Summary - Markdown summary in CI logs
- PR Comment - Summary posted to PR (if in PR context)

**Verdict**: Single pass/fail based on all threshold checks

### Branch Protection

To make quality gates blocking:

1. Go to **Settings → Branches → Branch protection rules**
2. Add/edit rule for `main` branch
3. Under **Require status checks to pass before merging**:
   - Check **Require branches to be up to date before merging**
   - Add required status check: **quality-gates**
4. Save changes

**See**: `QG_PLAYBOOK.md` for detailed setup instructions

## Failure Triage Flow

1. **Check Quality Gates Summary**:
   - Download `quality-gates-summary` artifact
   - Review `qg-summary.json` for specific violations
   - Check `errors` array for threshold failures

2. **Review Individual Job Artifacts**:
   - `playwright-report` - E2E test failures
   - `lighthouse-reports` - Lighthouse score details
   - `telemetry-artifacts` - Telemetry validation errors

3. **Fix and Re-run**:
   - Address threshold violations
   - Push changes
   - Verify quality-gates job passes

**See**: `QG_PLAYBOOK.md` for detailed triage instructions

## Telemetry Gate Criteria

- ✅ All events validate against JSON Schema (0 errors)
- ✅ PII safety: no raw queries, APNs, or coordinates in payloads
- ✅ Minimum event counts: ≥1 page_view, ≥1 search_submit, ≥1 results_render, ≥2 web_vitals
- ✅ Event structure: all required fields present, types correct
- ✅ CI uploads telemetry.ndjson artifact
- ✅ No performance regression (Lighthouse budgets maintained)
- ✅ Feedback events (`answer_feedback`) validated if present
- ✅ Citation events (`citation_opened`) include version and jurisdiction_id fields

## Citations Integrity Gate Criteria

- ✅ All manifest files validate against schema (AJV)
- ✅ All anchor files validate against schema (AJV)
- ✅ Manifest hash matches computed hash of anchors file
- ✅ All citations referenced in rules/overlays/exceptions exist in anchors
- ✅ Stale anchor detection works (simulated in CI)
- ✅ Version info attached to citations correctly

## Related Issues

See v1.1.1 milestone:
- E2E: happy paths (APN, Lat/Lng)
- E2E: error states + retry
- Lighthouse CI: ≥90 perf/a11y/best/SEO

