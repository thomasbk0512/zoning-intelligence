# Post-v1 Execution Checklist

## P0: Critical Foundation (Weeks 1-2)

### Step 1: Review ROADMAP.md with all owners
- [ ] Data Engineering: Review dataset integration plan
- [ ] DevOps: Review CI setup requirements
- [ ] Product: Confirm priorities and timeline
- [ ] All owners: Sign off on P0 milestones

**Status**: Pending owner review

---

### Step 2: Merge .github/workflows/ci.yml to main
- [x] CI workflow created
- [ ] Test workflow locally (act or manual)
- [ ] Create PR with CI workflow
- [ ] Merge to main branch
- [ ] Verify workflow runs on push

**Status**: Workflow ready, needs merge

---

### Step 3: Run make test in CI pipeline
- [ ] CI workflow triggers on push
- [ ] Dependencies install successfully
- [ ] Unit tests: 16/16 passing
- [ ] Golden tests: 20/20 passing
- [ ] CI badge shows green

**Status**: Pending CI run

---

### Step 4: Begin P0 integration of Austin datasets
- [ ] Source official Austin parcel data
- [ ] Source official zoning districts
- [ ] Validate CRS and field mappings
- [ ] Update data loading scripts
- [ ] Test with real APNs
- [ ] Update golden test fixtures

**Status**: Ready to begin

---

### Step 5: Validate rules with scripts/validate_rules.py
- [x] Validator script created
- [x] Tested: rules/austin.yaml valid
- [ ] Add to CI pipeline
- [ ] Validate all rule files on commit

**Status**: Validator working, needs CI integration

---

### Step 6: Back up tests/golden and data/austin
- [ ] Create backup script
- [ ] Archive golden test files
- [ ] Archive data files
- [ ] Document backup location
- [ ] Test restore process

**Status**: Backup script needed

---

### Step 7: Confirm reproducible build on CI runner
- [ ] CI installs from requirements-lock.txt
- [ ] Tests pass on clean environment
- [ ] Output matches local results
- [ ] Runtime within acceptable range

**Status**: Pending CI verification

---

### Step 8: Tag v1.0.1-dev once P0 completes
- [ ] All P0 milestones complete
- [ ] CI green
- [ ] Tests passing with real data
- [ ] Create v1.0.1-dev tag
- [ ] Update CHANGELOG.md

**Status**: Pending P0 completion

---

## Verification Commands

```bash
# Test CI workflow locally
act -l  # List workflows (requires act tool)

# Validate rules
python scripts/validate_rules.py rules/*.yaml

# Run tests
make test

# Backup data
./scripts/backup_data.sh

# Check CI status
gh workflow view ci  # If using GitHub CLI
```

---

**Last Updated**: 2024-11-08
**Next Review**: After CI merge
