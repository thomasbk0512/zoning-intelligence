# Complete Real Data Integration Guide

## Enhanced Integration Workflow

### Prerequisites
- Official Austin parcel GeoJSON (with APN field)
- Official Austin zoning GeoJSON (with zone_code field)
- Backup system ready
- All scripts tested

### Complete Integration Process

#### Step 1: Backup Current Data
```bash
./scripts/backup_data.sh
```
**Expected**: Backup created in `backups/YYYYMMDD_HHMMSS/`

#### Step 2: Integrate Real Datasets
```bash
./scripts/integrate_real_data.sh \
  /path/to/austin_parcels.geojson \
  /path/to/austin_zoning.geojson
```

**Enhanced Features**:
- Field mapping: Handles APN, PARCEL_ID, zone_code, ZONE_CODE variants
- CRS auto-detection: Detects and transforms to EPSG:2277
- Geometry fixing: Automatically fixes invalid geometries (buffer(0))
- Fallback zone: Returns "UNKNOWN" if no zone intersection

**Expected Output**:
- Data processed and saved to `data/austin/`
- Metadata file created: `data/austin/metadata.json`
- Field names normalized (APN, zone)

#### Step 3: Validate Rules
```bash
python3 scripts/validate_rules.py rules/austin.yaml
```
**Expected**: `✓ rules/austin.yaml: Valid`

#### Step 4: Update Golden Tests
```bash
python3 scripts/update_golden_tests.py data/austin/parcels.geojson

# Then generate actual expected outputs
for i in {1..20}; do
  APN=$(jq -r '.apn' tests/golden/$(printf "%03d" $i).apn.json)
  python3 zoning.py --apn "$APN" --city austin --out "tests/golden/$(printf "%03d" $i).apn.json"
done
```

#### Step 5: Run Full Test Suite
```bash
make test
```
**Expected**: 36/36 tests passing

#### Step 6: Smoke Test CLI
```bash
# Get a real APN from the data
REAL_APN=$(python3 -c "import json; print(json.load(open('data/austin/parcels.geojson'))['features'][0]['properties']['APN'])")

python3 zoning.py --apn "$REAL_APN" --city austin --out out.json

# Verify output
cat out.json | python3 -m json.tool
python3 -c "import json; d=json.load(open('out.json')); print(f'Fields: {len(d)}/11, Runtime: {d[\"run_ms\"]:.1f}ms')"
```

**Expected**:
- Valid JSON (11/11 fields)
- Runtime <60s
- Zone code matches expected

#### Step 7: Tag v1.0.1-dev
```bash
# Update CHANGELOG.md if needed
git add CHANGELOG.md data/austin/ tests/golden/

git commit -m "Integrate official Austin datasets

- Real parcel and zoning data integrated
- Field mapping and CRS transformation applied
- Geometry fixes applied
- Golden tests updated with real APNs
- All tests passing (36/36)"

git tag -a v1.0.1-dev -m "v1.0.1-dev: Real Austin data integration

- Integrated official Austin parcel and zoning datasets
- Enhanced field mapping and CRS handling
- Geometry validation and fixing
- Updated golden tests with real APNs
- All tests passing (36/36)
- Runtime verified (<60s per parcel)

See INTEGRATION_CONFIRMED.md for details."

git push origin v1.0.1-dev
```

## Risk Mitigations Implemented

### Field Name Mismatch
- **Mitigation**: Field mapping in `load_real_data.py`
- **Supported**: APN, PARCEL_ID, zone_code, ZONE_CODE variants
- **Action**: Automatically maps to standard names (APN, zone)

### CRS Misalignment
- **Mitigation**: Auto-detect and transform CRS
- **Process**: Detects source CRS, transforms to EPSG:2277
- **Fallback**: Assumes EPSG:4326 if no CRS detected

### Incomplete Zoning Coverage
- **Mitigation**: Fallback zone "UNKNOWN"
- **Implementation**: `engine/geom.py` returns "UNKNOWN" if no intersection
- **Result**: CLI continues without error

### Corrupt Geometries
- **Mitigation**: Geometry fixing with buffer(0)
- **Process**: Detects invalid geometries, applies buffer(0) fix
- **Result**: All geometries validated before saving

## Rollback Procedure

If issues occur after integration:

```bash
# 1. Restore from backup
./scripts/rollback_integration.sh

# 2. If tag already pushed, remove it
git tag -d v1.0.1-dev
git push origin :refs/tags/v1.0.1-dev

# 3. Verify restoration
make test
```

## Verification Checklist

- [ ] Backup created before integration
- [ ] Real data loaded successfully
- [ ] Field mapping applied correctly
- [ ] CRS transformation successful
- [ ] Geometry fixes applied (if needed)
- [ ] Metadata file created
- [ ] Rules validated
- [ ] Golden tests updated
- [ ] All tests passing (36/36)
- [ ] CLI smoke test successful
- [ ] Runtime <60s verified
- [ ] CHANGELOG.md updated
- [ ] v1.0.1-dev tagged
- [ ] Tag pushed to remote

---

**Status**: Enhanced integration workflow ready for official datasets

