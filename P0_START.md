# P0 Execution Start Guide

## Immediate Actions

### 1. Merge CI Workflow PR
```bash
# Create feature branch
git checkout -b feature/ci-workflow

# Add CI workflow
git add .github/workflows/ci.yml
git commit -m "Add CI workflow for automated testing"

# Push and create PR
git push origin feature/ci-workflow
# Then merge PR via GitHub UI
```

### 2. Verify GitHub Actions
- Go to GitHub repository
- Check "Actions" tab
- Verify workflow runs on merge
- Confirm all jobs pass (green checkmarks)

### 3. Begin Austin Data Integration

**Data Sources** (to be sourced):
- Austin parcel GeoJSON/Shapefile
- Austin zoning districts layer
- Field mappings: APN, zone codes

**Integration Steps**:
1. Download official datasets
2. Validate CRS (should be EPSG:2277 or transform)
3. Verify field names match code expectations
4. Replace `data/austin/parcels.geojson`
5. Replace `data/austin/zoning.geojson`
6. Update `scripts/generate_samples.py` → `scripts/load_real_data.py`
7. Test with real APNs
8. Update golden test fixtures

**Acceptance Criteria**:
- Real APNs return valid zones
- 20 golden tests updated
- All tests passing (36/36)
- Data versioning documented

### 4. Tag v1.0.1-dev
```bash
# After P0 completion
git checkout main
git pull

# Update CHANGELOG.md
# Then tag
git tag -a v1.0.1-dev -m "v1.0.1-dev: P0 complete - Real Austin data integrated"
git push origin v1.0.1-dev
```

---

## P0 Milestones

- [ ] **M1**: CI workflow merged and green
- [ ] **M2**: Real Austin data integrated
- [ ] **M3**: Tests passing with real data
- [ ] **M4**: v1.0.1-dev tagged

---

## Owner Assignments

- **CI Workflow**: DevOps
- **Data Integration**: Data Engineering
- **Test Updates**: QA/Engineering
- **Release**: Product/DevOps

---

**Start Date**: 2024-11-08  
**Target Completion**: Week 2

