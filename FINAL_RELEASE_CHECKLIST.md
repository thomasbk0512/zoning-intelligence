# Final Release Checklist

**Version**: ui-v1.0.1  
**Date**: 2024-11-08  
**Status**: Ready for Execution

---

## Step 1: Connect Remote & Push

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
- [ ] Tags visible on host: `git ls-remote --tags origin | grep -E "(v1.0.1-dev|ui-v1.0.0)"`

---

## Step 2: Open PR & Watch CI

### Commands
```bash
# Create UI PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -b "Adds Map Overlays, Sources Flyout, Print Summary, ARIA upgrades, code-split + cache

Features:
- UX-001: Map Overlays (MapLibre GL, parcel/zoning layers, keyboard-accessible toggles)
- UX-002: Sources Flyout (focus trap, Esc key, accessible dialog)
- UX-003: Print Summary (print-optimized layout, one-page format)
- UX-004: A11y Upgrades (polite/assertive aria-live, state announcements)
- UX-005: Performance (code-split Results, response caching 5min TTL)

All features verified, build passing, schema contract maintained (11 fields)."

# Monitor CI
gh pr checks --watch
```

### Verification
- [ ] PR created successfully
- [ ] CI triggered
- [ ] All checks passing (lint, typecheck, test, build)
- [ ] PR status: Ready for review

---

## Step 3: Manual Integration Tests

### Test Cases
1. **APN Success → 11 Fields Render**
   - [ ] Navigate to /search
   - [ ] Enter APN: 0204050712
   - [ ] Submit search
   - [ ] Verify 11 fields displayed
   - [ ] Verify HTTP 200 response
   - [ ] Verify loading states work

2. **Lat/Lng Success → 11 Fields Render**
   - [ ] Navigate to /search
   - [ ] Switch to Lat/Lng tab
   - [ ] Enter coordinates: 30.2672, -97.7431
   - [ ] Submit search
   - [ ] Verify 11 fields displayed
   - [ ] Verify HTTP 200 response

3. **500 → Error UI + Retry Recovers**
   - [ ] Simulate 500 error (backend or network)
   - [ ] Verify error message displayed
   - [ ] Verify retry button present
   - [ ] Click retry
   - [ ] Verify recovery works

4. **Timeout → Skeletons Then Results**
   - [ ] Simulate network delay
   - [ ] Verify skeleton components display
   - [ ] Verify no layout shift
   - [ ] Verify results render after delay

5. **Invalid Input → Blocked with ARIA Feedback**
   - [ ] Enter invalid APN
   - [ ] Verify validation error
   - [ ] Verify ARIA feedback present
   - [ ] Verify form submission blocked

---

## Step 4: Lighthouse Targets

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

### Verification
- [ ] All categories meet targets
- [ ] Report saved for reference
- [ ] No regressions from baseline

---

## Step 5: Merge & Tag

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

# Optional: Create GitHub release
gh release create ui-v1.0.1 \
  -t "UI v1.0.1: UX Polish Milestone" \
  -F ui/RELEASE_NOTES_v1.0.1.md
```

### Verification
- [ ] PR merged successfully
- [ ] Tag created: `git tag -l ui-v1.0.1`
- [ ] Tag pushed: `git ls-remote --tags origin | grep ui-v1.0.1`
- [ ] GitHub release created (if applicable)

---

## Step 6: E2E Regression (Post-Merge)

### Test Cases
1. **5 Integration Cases on Production Build**
   - [ ] APN success
   - [ ] Lat/Lng success
   - [ ] Error handling
   - [ ] Timeout handling
   - [ ] Input validation

2. **Map Overlays**
   - [ ] Map renders correctly
   - [ ] Parcel overlay toggle works
   - [ ] Zoning overlay toggle works
   - [ ] Keyboard navigation works
   - [ ] No layout shift (CLS <0.1)
   - [ ] ARIA labels present

3. **Print Summary**
   - [ ] Print button works
   - [ ] Print layout fits 1 page (Letter/A4)
   - [ ] All 11 fields included
   - [ ] Sources listed
   - [ ] Readable grayscale

4. **A11y Features**
   - [ ] Live regions announce error/success
   - [ ] Escape closes flyout
   - [ ] Focus trap works in flyout
   - [ ] Keyboard navigation complete

---

## Ready Gate

**Proceed to release when all are ✅**:
- [ ] CI green on PR
- [ ] 5/5 integration cases pass
- [ ] Lighthouse ≥90 (perf/a11y/SEO/best)
- [ ] Contract unchanged (11 fields)
- [ ] ui-v1.0.1 tag pushed
- [ ] E2E regression tests pass

---

## Notes

- **Map**: Uses MapLibre GL; parcel/zoning layers with keyboard-accessible toggles
- **Cache**: Response cache TTL: 5 minutes
- **Code Splitting**: Results component code-split via React.lazy
- **Schema**: 11-field contract maintained throughout

---

**Status**: Ready for Execution (Pending Remote)

**Last Updated**: 2024-11-08

