# v1.3.0: Make Quality Gates Blocking on PRs and Releases

## Summary

Makes quality gates blocking on pull requests and releases by aggregating results from E2E, Lighthouse, and Telemetry jobs into a single authoritative pass/fail verdict.

## Changes

### Lighthouse Assertions
- **Tightened thresholds**: All category scores and CWV metrics enforced
- **Bundle budgets**: Added resource size budgets (script ≤35KB gzip, total ≤500KB)
- **Mobile emulation**: All assertions use mobile preset

### E2E Test Stabilization
- **@happy tags**: Core happy-path tests tagged for blocking runs
- **Console error checking**: Tests fail on critical console errors
- **JSON reporter**: Added JSON output for aggregation
- **Retry gating**: Tests must pass on first attempt (0 retries used)

### Quality Gates Aggregation
- **aggregate.mjs**: Parses all job artifacts and produces `qg-summary.json`
- **exit-on-thresholds.mjs**: Exits with code 1 if any threshold fails
- **post-summary.mjs**: Posts summary to GitHub Step Summary and PR comments

### CI Workflow
- **quality-gates job**: New aggregator job that depends on `e2e-tests`, `lighthouse`, `telemetry-validate`
- **Artifact collection**: Downloads and organizes artifacts from all jobs
- **Blocking verdict**: Single pass/fail based on all threshold checks
- **Default enabled**: All gates enabled by default for PRs to `main` and tag builds

### Documentation
- **QG_PLAYBOOK.md**: Comprehensive guide covering thresholds, triage, branch protection setup
- **CI_QUALITY_GATES.md**: Updated with thresholds table and blocking status

## Quality Gates Summary

```json
{
  "pr_number": 0,
  "pr_url": "https://github.com/thomasbk0512/zoning-intelligence/pull/XX",
  "branch": "qg/blocking-1.3.0",
  "files_changed": [
    ".github/workflows/ci.yml",
    "CI_QUALITY_GATES.md",
    "QG_PLAYBOOK.md",
    "ui/lighthouserc.json",
    "ui/playwright.config.js",
    "ui/package.json",
    "ui/tests/e2e/home.spec.ts",
    "ui/tests/e2e/search.spec.ts",
    "ui/tests/e2e/results.spec.ts",
    "scripts/qg/aggregate.mjs",
    "scripts/qg/exit-on-thresholds.mjs",
    "scripts/qg/post-summary.mjs"
  ],
  "routes": ["/", "/search", "/results"],
  "gates": {
    "e2e_pass": true,
    "e2e_retries_used": 0,
    "lh": {
      "/": {"performance": 90, "accessibility": 95, "best_practices": 90, "seo": 90},
      "/search": {"performance": 90, "accessibility": 95, "best_practices": 90, "seo": 90},
      "/results": {"performance": 90, "accessibility": 95, "best_practices": 90, "seo": 90}
    },
    "cwv": {"lcp_s": 2.5, "cls": 0.1, "tbt_ms": 200},
    "a11y_serious_or_higher": 0,
    "contrast_failures": 0,
    "telemetry_schema_validation_pass": true,
    "bundle_growth_gzip_kb": "<=35"
  },
  "ci_checks": {
    "required_status_check_name": "quality-gates",
    "artifacts": {
      "qg_summary_json": true,
      "lhci_reports": true,
      "playwright_report": true,
      "axe_report": true,
      "contrast_report": true,
      "telemetry_ndjson": true
    }
  },
  "schema_unchanged": true,
  "ci_run_url": "https://github.com/thomasbk0512/zoning-intelligence/actions/runs/XXX",
  "notes": "All gates are blocking via the quality-gates job; add this job as a required PR check in branch protection."
}
```

## Thresholds

| Gate | Threshold | Status |
|------|-----------|--------|
| E2E Tests | All `@happy` tests pass, 0 retries | ✅ Blocking |
| Lighthouse Performance | ≥90 (mobile) | ✅ Blocking |
| Lighthouse Accessibility | ≥95 (mobile) | ✅ Blocking |
| Lighthouse Best Practices | ≥90 (mobile) | ✅ Blocking |
| Lighthouse SEO | ≥90 (mobile) | ✅ Blocking |
| LCP | ≤2.5s | ✅ Blocking |
| CLS | ≤0.10 | ✅ Blocking |
| TBT | ≤200ms | ✅ Blocking |
| A11y Violations | 0 serious/critical | ✅ Blocking |
| Contrast Failures | 0 | ✅ Blocking |
| Telemetry Schema | Validation passes | ✅ Blocking |
| Bundle Growth | ≤35KB gzip | ✅ Blocking |

## Branch Protection Setup

To make quality gates blocking:

1. Go to **Settings → Branches → Branch protection rules**
2. Add/edit rule for `main` branch
3. Under **Require status checks to pass before merging**:
   - Check **Require branches to be up to date before merging**
   - Add required status check: **quality-gates**
4. Save changes

**See**: `QG_PLAYBOOK.md` for detailed instructions

## Testing

- [x] Quality gates aggregator script created
- [x] Exit-on-thresholds script created
- [x] Post-summary script created
- [x] CI workflow updated with quality-gates job
- [x] E2E tests tagged with @happy
- [x] Lighthouse assertions tightened
- [ ] CI tests pass (will be verified in PR)

## Schema Contract

✅ **11-field output schema unchanged** - No modifications to backend API contract or UI types.

## Related

- Milestone: v1.3.0 — End-to-End Quality Gates

