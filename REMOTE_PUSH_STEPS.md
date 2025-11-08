# Remote Push Steps

**Status**: Ready for Execution  
**Date**: 2024-11-08

---

## Step 1: Connect Remote & Push Tags/Branch

### Commands
```bash
# Configure remote (replace <repo-url> with actual URL)
git remote add origin <repo-url>
git remote -v  # Verify

# Push all tags
git push origin --tags
# Pushes: v1.0.1-dev, ui-v1.0.0

# Push UI branch
git push origin ui/v1.0.1
```

### Verification
- [ ] Remote configured successfully
- [ ] Tags pushed (v1.0.1-dev, ui-v1.0.0)
- [ ] Branch pushed (ui/v1.0.1)

---

## Step 2: Create PR & Monitor CI

### Commands
```bash
# Create UI PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX fixes" \
  -b "Implements UX polish milestone:
- UX-002: Sources Flyout (focus trap, Esc key)
- UX-003: Print Summary (print-optimized layout)
- UX-004: A11y Upgrades (polite/assertive aria-live)
- UX-005: Performance (code-split, caching)
- UX-001: Map Overlays (MapLibre, parcel/zoning layers)"

# Monitor CI
gh pr checks --watch
```

### Verification
- [ ] PR created successfully
- [ ] CI triggered
- [ ] All checks passing

---

## Step 3: Post-Merge Checklist

### Must Pass
- [ ] CI ✅ (all checks green)
- [ ] 5 integration cases pass
- [ ] Lighthouse ≥90 (perf/a11y/best/SEO)
- [ ] UX-001 implemented + verified
- [ ] 11-field contract unchanged

### Integration Test Cases
1. APN success → 11 fields render
2. Lat/Lng success → 11 fields render
3. Force 500 → error UI + Retry recovers
4. Timeout → skeletons then results
5. Invalid input → blocked with ARIA feedback

### Lighthouse Audit
```bash
cd ui
npm run build
npm run preview
# In another terminal:
npx lighthouse http://localhost:4173 \
  --only-categories=performance,accessibility,best-practices,seo
```

---

## Step 4: Tag Release

### After PR Merge
```bash
# Tag UI v1.0.1
git checkout main
git pull origin main
git tag ui-v1.0.1 -m "UI v1.0.1: UX polish milestone complete"
git push origin ui-v1.0.1

# Optional: Create GitHub release
gh release create ui-v1.0.1 \
  -t "UI v1.0.1: UX Polish Milestone" \
  -F ui/RELEASE_NOTES.md
```

---

**Status**: Ready for Execution (Pending Remote)

**Last Updated**: 2024-11-08

