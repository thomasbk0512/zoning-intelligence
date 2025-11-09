# v1.1.0 — Data Integration

## What Changed

- **Data Integration Pipeline**: Added automated CI pipeline for downloading/stubbing Austin datasets, deriving ≤5 MB subset, and regenerating golden tests
- **CI-Safe Workflow**: Pipeline works with or without dataset URLs (auto-stubs when unset)

## CI Pipeline Steps

The CI workflow now includes:

1. **Download or stub datasets** - Uses repository variables or generates stubs
2. **Derive CI subset** - Creates ≤5 MB derived dataset for CI
3. **Validate rules** - Validates YAML rule files
4. **Regenerate golden tests** - Updates 20 golden test files from CLI output
5. **Run tests** - Executes full test suite
6. **Verify derived data size** - Ensures ≤5 MB limit
7. **Verify schema contract** - Validates 11-field schema

## Schema Contract

**✅ 11 fields — unchanged**

All outputs maintain the 11-field schema:
- apn, jurisdiction, zone
- setbacks_ft (front, side, rear, street_side)
- height_ft, far, lot_coverage_pct
- overlays, sources, notes, run_ms

**Tolerance**: ±0.1 ft (maintained)

## Configuration

### Repository Variables (Optional)

To use official Austin datasets instead of stubs, configure in:
**Settings → Secrets and variables → Actions → Variables**

- `AUSTIN_PARCELS_URL` - Parcels dataset URL
- `AUSTIN_ZONING_URL` - Zoning dataset URL

If not set, CI automatically generates stub datasets.

## Files Changed

- `.github/workflows/ci.yml` - Added data integration pipeline
- `scripts/download_austin_data.py` - Download/stub script
- `scripts/derive_ci_subset.py` - Derive subset script
- `scripts/update_golden_tests.py` - Golden test updater
- `.gitignore` - Added data/raw/ and build artifacts
- `data/austin/derived/.gitkeep` - Directory placeholder

## Commits Since ui-v1.0.1

```
1b006e2 v1.1.0: data integration (derived subset, CI-stable) (#6)
1358c88 chore: add release workflow (#5)
2e6c074 Create pull_request_template.md (#4)
95fee90 Update ci.yml
599f12a Create ui-only.yml
ee1a1bd Create ci.yml
4147719 Create .gitignore
36352a0 Update repo-bootstrap.yml
6050110 Update repo-bootstrap.yml
f37b783 Update repo-bootstrap.yml
b6ecf5b Update repo-bootstrap.yml
73c6da0 Create repo-bootstrap.yml
8775b7f Delete .DS_Store
```

---

**Tag**: v1.1.0  
**Commit**: 1b006e2 (1b006e2a76ed47bbec61fa7f1ad8f87a13c6dfdf)
