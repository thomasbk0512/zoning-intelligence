# Release Execution Status

**Version**: ui-v1.0.1  
**Date**: 2024-11-08  
**Status**: Ready for Remote Push

---

## Step 1: Connect Remote & Push Tags/Branch

### Status
⏳ **Pending Remote Configuration**

### Commands
```bash
# Configure remote (replace <repo-url> with actual URL)
git remote add origin <repo-url>
# OR if remote exists:
git remote set-url origin <repo-url>

# Verify remote
git remote -v

# Push all tags
git push origin --tags
# Pushes: v1.0.1-dev, ui-v1.0.0

# Push UI branch
git push origin ui/v1.0.1
```

### Verification
- [ ] Remote configured
- [ ] Tags pushed successfully
- [ ] Branch pushed successfully
- [ ] Tags visible: `git ls-remote --tags origin | grep -E "(v1.0.1-dev|ui-v1.0.0)"`

### Alternative: Use Script
```bash
./PUSH_AND_RELEASE_COMMANDS.sh <repo-url>
```

---

## Step 2: Create PR & Monitor CI

### Status
⏳ **Pending PR Creation**

### Commands
```bash
# Create PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -F ui/RELEASE_NOTES_v1.0.1.md

# Monitor CI
gh pr checks --watch
```

### Verification
- [ ] PR created successfully
- [ ] CI triggered
- [ ] All checks passing:
  - [ ] Lint
  - [ ] Typecheck
  - [ ] Test
  - [ ] Build

---

## Step 3: Run Local Integration Tests

### Status
✅ **Ready for Execution**

### Test Cases
1. [ ] APN success → 11 fields render
2. [ ] Lat/Lng success → 11 fields render
3. [ ] Force 500 → error UI + Retry recovers
4. [ ] Timeout → skeletons then results
5. [ ] Invalid input → blocked with ARIA feedback

### Execution
```bash
# Start dev server
cd ui
npm run dev

# Execute tests manually in browser
# Document results in INTEGRATION_TEST_RESULTS.md
```

---

## Step 4: Lighthouse Audit

### Status
✅ **Ready for Execution**

### Commands
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

### Targets
- [ ] Performance ≥90
- [ ] Accessibility ≥90
- [ ] Best Practices ≥90
- [ ] SEO ≥90

---

## Step 5: Merge & Tag Release

### Status
⏳ **Pending PR Merge**

### Commands
```bash
# Merge PR (squash merge)
gh pr merge ui/v1.0.1 --squash

# Pull latest main
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

### Verification
- [ ] PR merged successfully
- [ ] Tag created: `git tag -l ui-v1.0.1`
- [ ] Tag pushed: `git ls-remote --tags origin | grep ui-v1.0.1`

---

## Step 6: Publish Release (Optional)

### Status
⏳ **Pending Tag Push**

### Commands
```bash
# Create GitHub release
gh release create ui-v1.0.1 \
  -t "UI v1.0.1: UX Polish Milestone" \
  -F ui/RELEASE_NOTES_v1.0.1.md
```

### Verification
- [ ] Release created
- [ ] Release notes visible
- [ ] Release artifacts attached (if any)

---

## Step 7: E2E Regression (Post-Merge)

### Status
⏳ **Pending Merge**

### Test Cases
1. [ ] Re-run 5 integration cases on production build
2. [ ] Map overlays: toggles accessible; no layout shift
3. [ ] Print summary: single-page Letter/A4; all 11 fields + sources
4. [ ] A11y: live regions announce; Esc closes flyout; focus trap correct

### Execution
```bash
# Build production
cd ui
npm run build
npm run preview

# Execute regression tests
# Document results
```

---

## Ready Gate

**Proceed to release when all are ✅**:
- [ ] Remote connected; tags/branch pushed
- [ ] CI green on PR
- [ ] 5 integration cases pass
- [ ] Lighthouse ≥90 all categories
- [ ] 11-field schema intact
- [ ] ui-v1.0.1 tag pushed

---

## Rollback Plan

If issues are found after release:

```bash
# Delete tag
git push origin :refs/tags/ui-v1.0.1

# Delete release
gh release delete ui-v1.0.1 --yes

# Revert merge (if needed)
gh pr revert <merge-sha> --title "Revert UI v1.0.1" --body "Rollback due to CI/e2e failure"
```

---

## Current Status

- **Remote**: ⏳ Not configured
- **Tags**: ✅ Ready (v1.0.1-dev, ui-v1.0.0)
- **Branch**: ✅ Ready (ui/v1.0.1)
- **PR**: ⏳ Pending remote
- **CI**: ⏳ Pending PR
- **Tests**: ✅ Ready for execution
- **Lighthouse**: ✅ Ready for execution
- **Release**: ⏳ Pending merge

---

**Status**: Ready for Remote Push

**Last Updated**: 2024-11-08

