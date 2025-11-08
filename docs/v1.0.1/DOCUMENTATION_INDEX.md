# Documentation Index

## Integration & Deployment

### Primary Guides
- **INTEGRATION_GUIDE.md** - Step-by-step integration process
- **INTEGRATION_CONFIRMED.md** - Workflow verification and status
- **DATA_SOURCES.md** - Official Austin data sources
- **V1.0.1_READY.md** - Release preparation checklist

### Workflow Scripts
- `scripts/integrate_real_data.sh` - Complete integration workflow
- `scripts/load_real_data.py` - Data loading and validation
- `scripts/backup_data.sh` - Backup golden tests and data
- `scripts/validate_rules.py` - YAML rules validation
- `scripts/update_golden_tests.py` - Golden test fixture updater

## Project Documentation

### Core Docs
- **README.md** - Project overview and usage
- **RELEASE.md** - Release notes and changelog
- **CHANGELOG.md** - Version history
- **DEPLOYMENT.md** - Deployment guide

### Planning & Roadmap
- **ROADMAP.md** - Post-v1.0.0 roadmap (15 steps)
- **P0_TRANSITION.md** - P0 execution phase transition
- **P0_START.md** - P0 execution start guide
- **P0_PROGRESS.md** - P0 progress tracking
- **EXECUTION_CHECKLIST.md** - Execution step tracking

## Quick Reference

### Integration Workflow
```bash
# Complete workflow
./scripts/integrate_real_data.sh <parcels> <zoning>

# Or step-by-step
./scripts/backup_data.sh
python3 scripts/load_real_data.py <parcels> <zoning>
python3 scripts/validate_rules.py rules/*.yaml
python3 scripts/update_golden_tests.py data/austin/parcels.geojson
make test
```

### Testing
```bash
make test              # Run all tests
make unit              # Unit tests only
make golden            # Golden tests only
```

### Validation
```bash
python3 scripts/validate_rules.py rules/*.yaml
python3 validate.py    # Structure validation
```

### Release
```bash
# See V1.0.1_READY.md for complete process
git tag -a v1.0.1-dev -m "v1.0.1-dev: Real Austin data integrated"
```

---

**Last Updated**: 2024-11-08
