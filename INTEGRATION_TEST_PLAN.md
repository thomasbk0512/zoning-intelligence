# End-to-End Integration Test Plan

**Date**: 2024-11-08  
**Status**: Ready for Execution

---

## Overview

This plan covers end-to-end integration testing between the backend CLI and UI, ensuring seamless data flow and error handling.

---

## Pre-Push Local Validation

### 1. Backend Smoke Test

```bash
# Run backend CLI
python3 zoning.py --apn 0204050712 --city austin --out out.json

# Validate output
jq -e '.apn and .zone and .jurisdiction' out.json >/dev/null
```

**Expected**: Valid JSON with all 11 schema fields

### 2. UI Smoke Test

```bash
cd ui
npm run build
npm run preview
```

**Browser Tests**:
- Navigate to `/search`
- Test APN search flow
- Test lat/lng search flow
- Verify 11 fields render correctly

### 3. Contract Check

**Schema Validation**:
- [x] UI types match backend output schema (11 fields)
- [x] Field names match exactly
- [x] Data types match

**HTTP Status Mapping**:
- [x] 200 → Success (display results)
- [x] 4xx → Error UI (show error message)
- [x] 5xx → Error UI (show error message)
- [x] Network error → Error UI with retry

---

## Integration Test Cases

### Test Case 1: APN Success Flow
**Description**: Valid APN search returns complete results

**Steps**:
1. UI: Navigate to `/search`
2. UI: Enter APN `0204050712`
3. UI: Select city `austin`
4. UI: Click "Search"
5. Backend: Process request
6. UI: Display results

**Expected**:
- ✅ HTTP 200 response
- ✅ All 11 fields displayed
- ✅ Loading skeleton shown during fetch
- ✅ Results render correctly
- ✅ ARIA announcement made

**Validation**:
```bash
# Backend
python3 zoning.py --apn 0204050712 --city austin --out out.json
jq '.apn, .zone, .jurisdiction' out.json

# UI (manual)
# Verify all 11 fields visible in results page
```

---

### Test Case 2: Lat/Lng Success Flow
**Description**: Valid coordinate search returns complete results

**Steps**:
1. UI: Navigate to `/search`
2. UI: Switch to "Location (Lat/Lng)" tab
3. UI: Enter latitude `30.2672`
4. UI: Enter longitude `-97.7431`
5. UI: Select city `austin`
6. UI: Click "Search"
7. Backend: Process request
8. UI: Display results

**Expected**:
- ✅ HTTP 200 response
- ✅ All 11 fields displayed
- ✅ Loading skeleton shown during fetch
- ✅ Results render correctly

**Validation**:
```bash
# Backend
python3 zoning.py --lat 30.2672 --lng -97.7431 --city austin --out out.json
jq '.apn, .zone, .jurisdiction' out.json
```

---

### Test Case 3: Backend Error Handling
**Description**: Backend error (500) shows error UI with retry

**Steps**:
1. Simulate backend error (500)
2. UI: Display error message
3. UI: Show retry button
4. UI: Click retry
5. Backend: Process retry
6. UI: Display results

**Expected**:
- ✅ Error message displayed
- ✅ Retry button visible
- ✅ Retry restores to success state
- ✅ ARIA error announcement

**Validation**:
- Manual: Simulate network error or invalid APN
- Verify error UI appears
- Verify retry button works

---

### Test Case 4: Timeout Handling
**Description**: Network timeout shows skeleton, then result

**Steps**:
1. Simulate network delay (>60s)
2. UI: Show loading skeleton
3. Backend: Complete request
4. UI: Display results

**Expected**:
- ✅ Loading skeleton visible
- ✅ No layout shift (CLS low)
- ✅ Results render after timeout
- ✅ Performance maintained

---

### Test Case 5: Input Validation
**Description**: Empty/invalid inputs blocked with feedback

**Steps**:
1. UI: Submit empty form
2. UI: Display validation error
3. UI: Submit invalid coordinates
4. UI: Display validation error

**Expected**:
- ✅ Empty inputs blocked
- ✅ Validation messages clear
- ✅ ARIA feedback present
- ✅ Form not submitted

---

## Post-Remote Steps

### 1. Configure and Push

```bash
# Configure remote
git remote add origin <repo-url>

# Push tags
git push origin --tags  # pushes v1.0.1-dev, ui-v1.0.0

# Push UI branch
git push origin ui/v1.0.1
```

### 2. CI & Releases

```bash
# Create UI release
gh release create ui-v1.0.0 \
  -t "UI v1.0.0" \
  -F ui/QA_REPORT.md

# Create PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: QA Fixes" \
  -b "Retry, ARIA live, skeletons, test mocks"

# Watch CI
gh pr checks --watch
```

### 3. Artifacts (Optional)

```bash
# Upload backend artifacts
gh release upload v1.0.1-dev \
  docs/v1.0.1/CHECKSUMS.txt \
  docs/v1.0.1/MANIFEST.txt
```

---

## Ready-Gate Checklist

### Pre-Deployment
- [x] Backend smoke test passes
- [x] UI build succeeds
- [x] Schema contract verified
- [x] Local integration tests pass

### Deployment
- [ ] Remote configured
- [ ] Tags pushed
- [ ] Branch pushed
- [ ] Releases created
- [ ] PR created

### Post-Deployment
- [ ] CI green for backend
- [ ] CI green for UI
- [ ] CI green for PR
- [ ] E2E smoke tests pass
- [ ] Release pages published

---

## Test Execution

### Local Validation (Pre-Push)

```bash
# 1. Backend smoke
python3 zoning.py --apn 0204050712 --city austin --out out.json
jq -e '.apn and .zone and .jurisdiction' out.json >/dev/null

# 2. UI build
cd ui && npm run build && npm run preview

# 3. Schema check
jq 'keys | length' out.json  # Should be 11
```

### Integration Tests (Post-Deployment)

1. **APN Success**: Manual browser test
2. **Lat/Lng Success**: Manual browser test
3. **Error Handling**: Simulate errors
4. **Timeout**: Test with delays
5. **Validation**: Test form validation

---

## Success Criteria

### Must Pass
- ✅ All 11 schema fields match
- ✅ HTTP status codes handled correctly
- ✅ Error states display properly
- ✅ Retry functionality works
- ✅ Loading states show correctly
- ✅ ARIA announcements work

### Performance
- ✅ Response time <60s
- ✅ UI render <2s
- ✅ Lighthouse ≥90

### Accessibility
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ ARIA labels correct

---

## Next Phase

After ready-gate passes:

1. **Promote UI PR**: Merge `ui/v1.0.1` → `main`
2. **Tag UI**: Create `ui-v1.0.1` tag if needed
3. **UX Polish Milestone**:
   - Maps overlay
   - Sources flyout
   - Print-friendly summary

---

**Status**: Ready for Execution

**Last Updated**: 2024-11-08

