# Release Execution Log

**Version**: ui-v1.0.1  
**Date**: 2024-11-08  
**Status**: Ready for Execution

---

## Execution Steps

### Step 1: Connect Remote & Push

**Status**: ⏳ Pending Repository URL

**Commands**:
```bash
# Check if remote exists
git remote -v

# If no remote, add it:
git remote add origin <repo-url>

# If remote exists, update it:
git remote set-url origin <repo-url>

# Push tags
git push origin --tags

# Push branch
git push origin ui/v1.0.1
```

**Verification**:
- [ ] Remote configured
- [ ] Tags pushed (v1.0.1-dev, ui-v1.0.0)
- [ ] Branch pushed (ui/v1.0.1)
- [ ] Tags visible: `git ls-remote --tags origin | grep -E "(v1.0.1-dev|ui-v1.0.0)"`

---

### Step 2: Create PR & Monitor CI

**Status**: ⏳ Pending Remote Push

**Commands**:
```bash
# Create PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -b "$(cat ui/RELEASE_NOTES_v1.0.1.md)"

# Monitor CI
gh pr checks --watch
```

**Verification**:
- [ ] PR created
- [ ] CI triggered
- [ ] All checks passing:
  - [ ] Lint
  - [ ] Typecheck
  - [ ] Test
  - [ ] Build

---

### Step 3: Merge & Tag Release

**Status**: ⏳ Pending CI Pass

**Commands**:
```bash
# Merge PR
gh pr merge ui/v1.0.1 --squash

# Switch to main and pull
git checkout main
git pull origin main

# Tag release
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

**Verification**:
- [ ] PR merged
- [ ] Tag created
- [ ] Tag pushed
- [ ] Tag visible: `git ls-remote --tags origin | grep ui-v1.0.1`

---

### Step 4: Create GitHub Release

**Status**: ⏳ Pending Tag Push

**Commands**:
```bash
# Create release
gh release create ui-v1.0.1 \
  -t "UI v1.0.1: UX Polish Milestone" \
  -F ui/RELEASE_NOTES_v1.0.1.md
```

**Verification**:
- [ ] Release created
- [ ] Release notes visible
- [ ] Release artifacts attached (if any)

---

### Step 5: Post-Merge Validation

**Status**: ⏳ Pending Release

**Integration Tests** (5 cases):
1. [ ] APN success → 11 fields render
2. [ ] Lat/Lng success → 11 fields render
3. [ ] Force 500 → error UI + Retry recovers
4. [ ] Timeout → skeletons then results
5. [ ] Invalid input → blocked with ARIA feedback

**Lighthouse Audit**:
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

**Targets**:
- [ ] Performance ≥90
- [ ] Accessibility ≥90
- [ ] Best Practices ≥90
- [ ] SEO ≥90

---

## Troubleshooting

### CI Fails
```bash
# View CI logs
gh pr checks

# Re-run failed job
gh run rerun <run-id>
```

### Tag Push Denied
```bash
# Fetch tags first
git fetch --tags

# Retry push
git push origin ui-v1.0.1
```

### PR Blocked
```bash
# Check what's blocking
gh pr checks

# Fix issues, update branch
git checkout ui/v1.0.1
# ... make fixes ...
git push origin ui/v1.0.1

# Re-run checks
gh pr checks --watch
```

---

## Execution Log

**2024-11-08**: Release execution prepared
- [x] Local verification complete
- [x] Scripts ready
- [x] Documentation complete
- [ ] Remote configured
- [ ] Tags pushed
- [ ] PR created
- [ ] CI passed
- [ ] PR merged
- [ ] Tag created and pushed
- [ ] Release published
- [ ] Post-merge validation complete

---

**Status**: Ready for Execution (Pending Repository URL)

**Last Updated**: 2024-11-08

