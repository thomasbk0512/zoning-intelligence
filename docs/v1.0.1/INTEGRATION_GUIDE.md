# Real Data Integration Guide

## Prerequisites

- [x] CI workflow merged to main
- [x] Data loading script ready
- [x] Backup system operational
- [x] Validator working

## Step-by-Step Integration

### Step 1: Acquire Official Datasets

See `DATA_SOURCES.md` for official Austin data sources.

**Required Files**:
- Parcel GeoJSON/Shapefile (with APN field)
- Zoning GeoJSON/Shapefile (with zone field)

### Step 2: Load Real Data

**Option A: Complete workflow (recommended)**
```bash
./scripts/integrate_real_data.sh \
  /path/to/austin_parcels.geojson \
  /path/to/austin_zoning.geojson
```

**Option B: Manual step-by-step**
```bash
python3 scripts/load_real_data.py \
  /path/to/austin_parcels.geojson \
  /path/to/austin_zoning.geojson
```

### Step 3: Validate Rules

```bash
python3 scripts/validate_rules.py rules/*.yaml
```

### Step 4: Test with Real Data

```bash
# Test with a real APN
python3 zoning.py --apn <REAL_APN> --city austin --out test_output.json

# Verify output
cat test_output.json | python3 -m json.tool
```

### Step 5: Run Full Test Suite

```bash
make test
```

Expected: 36/36 tests passing (may need golden test updates)

### Step 6: Update Golden Tests

```bash
# Generate new golden tests from real APNs
python3 scripts/update_golden_tests.py data/austin/parcels.geojson

# Then run CLI for each APN to get actual expected outputs
# This replaces placeholder values with real results
for i in {1..20}; do
  APN=$(jq -r '.apn' tests/golden/$(printf "%03d" $i).apn.json)
  python3 zoning.py --apn "$APN" --city austin --out "tests/golden/$(printf "%03d" $i).apn.json"
done
```

### Step 7: Verify All Tests Pass

```bash
make test
```

### Step 8: Tag v1.0.1-dev

```bash
# Update CHANGELOG.md
# Then tag
git tag -a v1.0.1-dev -m "v1.0.1-dev: Real Austin data integrated"
git push origin v1.0.1-dev
```

## Verification Checklist

- [ ] Real data loaded successfully
- [ ] Metadata file created
- [ ] Rules validated
- [ ] Sample APN test passes
- [ ] All tests passing (36/36)
- [ ] Golden tests updated
- [ ] CHANGELOG.md updated
- [ ] v1.0.1-dev tagged

## Troubleshooting

**Issue**: APN field not found
- Check field names in parcel data
- Update `scripts/load_real_data.py` to handle different field names

**Issue**: Zone field not found
- Check field names in zoning data
- Verify zone codes match rule definitions

**Issue**: CRS mismatch
- Data will be transformed automatically
- Check `data/austin/metadata.json` for CRS info

