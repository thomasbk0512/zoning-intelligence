# Integration Test Suite Execution

**Date**: 2024-11-08  
**Status**: Ready for Execution

---

## Pre-Execution Checklist

### ✅ Local Validation
- [x] Backend smoke test passes
- [x] UI build succeeds
- [x] Schema contract verified (11 fields)
- [x] HTTP status mapping verified

### ⏳ Remote Setup (Pending)
- [ ] Remote configured
- [ ] Tags pushed
- [ ] Branch pushed
- [ ] CI triggered

---

## Execution Steps

### Step 1: Configure Remote & Push

```bash
# Configure remote
git remote add origin <repo-url>
git remote -v  # Verify

# Push all tags
git push origin --tags
# Pushes: v1.0.1-dev, ui-v1.0.0

# Push UI branch
git push origin ui/v1.0.1
```

### Step 2: Trigger CI & Monitor

```bash
# Create UI PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: QA fixes" \
  -b "Fixes from QA review:
- Add retry button on network error
- Improve ARIA live region announcements
- Add loading skeleton components
- Refine API test mocking"

# Monitor CI
gh pr checks --watch

# Verify workflows
gh workflow run ci.yml
gh run watch
```

### Step 3: Run Integration Tests

#### Test 1: APN Success → 11 Fields Render
**Status**: Ready

**Steps**:
1. Navigate to `/search`
2. Enter APN `0204050712`
3. Select city `austin`
4. Click "Search"
5. Verify all 11 fields display

**Expected**:
- ✅ HTTP 200
- ✅ All 11 fields visible
- ✅ Loading skeleton shown
- ✅ Results render correctly

**Validation**:
```bash
# Backend verification
python3 zoning.py --apn 0204050712 --city austin --out out.json
jq 'keys | length' out.json  # Should be 11
```

---

#### Test 2: Lat/Lng Success → 11 Fields Render
**Status**: Ready

**Steps**:
1. Navigate to `/search`
2. Switch to "Location (Lat/Lng)" tab
3. Enter `30.2672, -97.7431`
4. Select city `austin`
5. Click "Search"
6. Verify all 11 fields display

**Expected**:
- ✅ HTTP 200
- ✅ All 11 fields visible
- ✅ Loading skeleton shown
- ✅ Results render correctly

---

#### Test 3: Force 500 → Error UI + Retry Recovers
**Status**: Ready

**Steps**:
1. Simulate backend 500 error
2. Verify error message displays
3. Verify retry button appears
4. Click retry
5. Verify success state restored

**Expected**:
- ✅ Error message displayed
- ✅ Retry button visible
- ✅ Retry restores to success
- ✅ ARIA error announcement

---

#### Test 4: Simulated Timeout → Skeletons Show, Then Results
**Status**: Ready

**Steps**:
1. Simulate network delay (>60s)
2. Verify loading skeleton shows
3. Verify no layout shift
4. Verify results render after completion

**Expected**:
- ✅ Loading skeleton visible
- ✅ Low CLS
- ✅ Results render correctly
- ✅ Performance maintained

---

#### Test 5: Empty/Invalid Input → Validation Blocks with ARIA Copy
**Status**: Ready

**Steps**:
1. Submit empty form
2. Verify validation error
3. Enter invalid coordinates
4. Verify validation error
5. Verify ARIA feedback

**Expected**:
- ✅ Empty inputs blocked
- ✅ Clear validation messages
- ✅ ARIA feedback present
- ✅ Form not submitted

---

## Gate to UX Polish

**Proceed only when**:
- [ ] CI ✅ (all checks green)
- [ ] All 5 integration cases ✅
- [ ] Lighthouse ≥90 (all categories)
- [ ] Schema contract maintained (11 fields)
- [ ] No breaking changes

---

## CI Status Tracking

### Backend CI
- **Workflow**: `.github/workflows/ci.yml`
- **Status**: Pending remote
- **Checks**: Lint, test (36/36), rules validation

### UI CI
- **Workflow**: `.github/workflows/ui.yml`
- **Status**: Pending remote
- **Checks**: Lint, typecheck, test, build

### PR CI
- **Status**: Pending PR creation
- **Checks**: All UI checks + merge validation

---

## Test Results

### Integration Test Results
- [ ] Test 1: APN Success
- [ ] Test 2: Lat/Lng Success
- [ ] Test 3: Error Handling
- [ ] Test 4: Timeout Handling
- [ ] Test 5: Input Validation

### Performance Results
- [ ] Lighthouse Performance: _Pending_
- [ ] Lighthouse Accessibility: _Pending_
- [ ] Lighthouse Best Practices: _Pending_
- [ ] Lighthouse SEO: _Pending_

---

**Status**: Ready for Execution (Pending Remote)

**Last Updated**: 2024-11-08

