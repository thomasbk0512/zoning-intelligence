# Final Release Execution Guide

**Version**: ui-v1.0.1  
**Date**: 2024-11-08  
**Status**: ✅ READY TO EXECUTE

---

## Quick Execution

### Option 1: Automated Script (Recommended)
```bash
./EXECUTE_REMOTE_RELEASE.sh <repo-url>
```

### Option 2: Manual Execution
Follow the steps below.

---

## Manual Execution Steps

### Step 1: Configure Remote
```bash
# Remove existing remote if present
git remote remove origin 2>/dev/null || true

# Add new remote
git remote add origin <repo-url>

# Verify
git remote -v
```

### Step 2: Push Tags and Branch
```bash
# Push all tags
git push origin --tags

# Push branch with upstream tracking
git push -u origin ui/v1.0.1
```

### Step 3: Create PR and Monitor CI
```bash
# Create PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -b "$(cat ui/RELEASE_NOTES_v1.0.1.md)"

# Monitor CI (press Ctrl+C to stop watching)
gh pr checks --watch
```

### Step 4: Merge PR (After CI Passes)
```bash
# Merge PR with squash
gh pr merge ui/v1.0.1 --squash

# Switch to main and pull
git checkout main
git pull origin main
```

### Step 5: Tag and Push Release
```bash
# Create tag
git tag ui-v1.0.1 -m "UI v1.0.1: UX Polish Milestone Complete

Features:
- Map Overlays (MapLibre GL)
- Sources Flyout
- Print Summary
- A11y Upgrades
- Performance Optimizations

All 5 UX tickets complete, Lighthouse ≥90, schema contract maintained."

# Push tag
git push origin ui-v1.0.1
```

### Step 6: Create GitHub Release
```bash
gh release create ui-v1.0.1 \
  -t "UI v1.0.1" \
  -F ui/RELEASE_NOTES_v1.0.1.md
```

---

## Post-Merge Validation

### Integration Tests (5 cases)
1. **APN Success** → 11 fields render
2. **Lat/Lng Success** → 11 fields render
3. **500 Error** → Retry recovers
4. **Timeout** → Skeletons then results
5. **Invalid Input** → ARIA feedback works

### Lighthouse Audit
```bash
cd ui
npm run build
npm run preview
# In another terminal:
npx lighthouse http://localhost:4173 \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=./lighthouse-report.html
```

**Target**: ≥90 in all categories

---

## Verification Checklist

After execution, verify:
- [ ] Tags visible on remote: `git ls-remote --tags origin | grep ui-v1.0.1`
- [ ] PR created and visible
- [ ] CI checks passing (all green)
- [ ] PR merged successfully
- [ ] Tag pushed: `git ls-remote --tags origin | grep ui-v1.0.1`
- [ ] Release published on GitHub
- [ ] 5/5 integration tests pass
- [ ] Lighthouse ≥90 (all categories)

---

## Rollback Plan

If issues are found after release:

```bash
# Delete tag
git push origin :refs/tags/ui-v1.0.1

# Delete release
gh release delete ui-v1.0.1 --yes

# Revert merge (if needed)
gh pr revert <merge-sha> -t "Revert UI v1.0.1" -b "Rollback due to CI/e2e failure"
```

---

## Troubleshooting

### PR Blocked on Out-of-Date Branch
```bash
git fetch origin main
git rebase origin/main ui/v1.0.1
git push -f origin ui/v1.0.1
```

### Tag Push Denied
```bash
git fetch --tags origin
git push origin refs/tags/ui-v1.0.1:refs/tags/ui-v1.0.1
```

### CI Fails
```bash
# View CI status
gh pr checks

# Re-run failed job
gh run rerun <run-id>
```

---

## Ready Gate

**Execute when**:
- [x] Local verification complete ✅
- [x] Build passing ✅
- [x] Tests passing ✅
- [x] Schema contract maintained ✅
- [x] Release notes prepared ✅
- [x] Scripts ready ✅
- [ ] Repository URL provided ⏳

**After execution, verify**:
- [ ] Remote configured
- [ ] Tags pushed
- [ ] Branch pushed
- [ ] PR created
- [ ] CI passing
- [ ] PR merged
- [ ] Tag created and pushed
- [ ] Release published
- [ ] Integration tests pass
- [ ] Lighthouse ≥90

---

**Status**: ✅ READY TO EXECUTE (Requires Repository URL)

**Last Updated**: 2024-11-08

