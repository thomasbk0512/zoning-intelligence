# Maintainer Guide

Guidelines for maintaining the zoning-intelligence repository.

## Branch Protection Overrides

### Temporarily Override Only When CI False-Positive

Branch protection rules are in place to ensure code quality. However, there may be rare cases where CI fails due to false positives (e.g., flaky tests, transient network issues).

**When to Override**:
- CI failure is clearly a false positive (not a real regression)
- All required checks have passed in previous runs
- The change is minimal and low-risk
- You have reviewed the failure and confirmed it's not related to your changes

**How to Override**:
1. Review the CI failure logs carefully
2. Confirm it's a false positive (not a real issue)
3. Use `gh pr merge --admin` to merge with administrator privileges
4. Document the override reason in the PR comment

**When NOT to Override**:
- Real test failures
- Linting errors
- Build failures
- Any failure that indicates a real problem with the code

**Best Practice**: If CI is consistently failing, fix the root cause rather than overriding repeatedly.

## Release Process

See individual release notes and health reports for release-specific information.

## CI Configuration

- Quality gates (E2E, Lighthouse) are disabled by default
- Enable via repository variables: `E2E_ENABLE=true`, `LH_ENABLE=true`
- See `CI_QUALITY_GATES.md` for details

## Observability

- Metrics are collected automatically in CI
- Logs are available in CI artifacts
- See `OBSERVABILITY.md` for full documentation

