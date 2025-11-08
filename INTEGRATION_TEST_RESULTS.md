# Integration Test Results

**Date**: 2024-11-08  
**Version**: ui-v1.0.1  
**Status**: Ready for Execution

---

## Test Cases

### Test 1: APN Success → 11 Fields Render
**Status**: ⏳ Pending Manual Test  
**Steps**:
1. Navigate to `/search`
2. Enter APN: `0204050712`
3. Submit search
4. Verify 11 fields displayed

**Expected**:
- [ ] HTTP 200 response
- [ ] All 11 fields present:
  - [ ] apn
  - [ ] jurisdiction
  - [ ] zone
  - [ ] setbacks_ft (front, side, rear, street_side)
  - [ ] height_ft
  - [ ] far
  - [ ] lot_coverage_pct
  - [ ] overlays
  - [ ] sources
  - [ ] notes
  - [ ] run_ms
- [ ] Loading states work
- [ ] Map renders (if geometry provided)

---

### Test 2: Lat/Lng Success → 11 Fields Render
**Status**: ⏳ Pending Manual Test  
**Steps**:
1. Navigate to `/search`
2. Switch to Lat/Lng tab
3. Enter coordinates: `30.2672, -97.7431`
4. Submit search
5. Verify 11 fields displayed

**Expected**:
- [ ] HTTP 200 response
- [ ] All 11 fields present
- [ ] Coordinates validated correctly
- [ ] Results render correctly

---

### Test 3: Force 500 → Error UI + Retry Recovers
**Status**: ⏳ Pending Manual Test  
**Steps**:
1. Simulate 500 error (backend or network)
2. Verify error message displayed
3. Verify retry button present
4. Click retry
5. Verify recovery works

**Expected**:
- [ ] Error message displayed
- [ ] Retry button visible
- [ ] Retry button functional
- [ ] Recovery successful
- [ ] ARIA live region announces error

---

### Test 4: Timeout → Skeletons Then Results
**Status**: ⏳ Pending Manual Test  
**Steps**:
1. Simulate network delay (>3s)
2. Verify skeleton components display
3. Verify no layout shift
4. Verify results render after delay

**Expected**:
- [ ] Skeleton components visible
- [ ] No layout shift (CLS <0.1)
- [ ] Results render after delay
- [ ] Loading state announced

---

### Test 5: Invalid Input → Blocked with ARIA Feedback
**Status**: ⏳ Pending Manual Test  
**Steps**:
1. Enter invalid APN (e.g., empty, non-numeric)
2. Verify validation error
3. Verify ARIA feedback present
4. Verify form submission blocked

**Expected**:
- [ ] Validation error displayed
- [ ] ARIA feedback present
- [ ] Form submission blocked
- [ ] Error message accessible

---

## Map Overlays Tests

### Test 6: Map Overlays Functionality
**Status**: ⏳ Pending Manual Test  
**Steps**:
1. Navigate to results page with geometry
2. Verify map renders
3. Toggle parcel overlay
4. Toggle zoning overlay
5. Test keyboard navigation

**Expected**:
- [ ] Map renders correctly
- [ ] Parcel overlay toggle works
- [ ] Zoning overlay toggle works
- [ ] Keyboard navigation works
- [ ] No layout shift (CLS <0.1)
- [ ] ARIA labels present

---

## Print Summary Tests

### Test 7: Print Summary
**Status**: ⏳ Pending Manual Test  
**Steps**:
1. Navigate to results page
2. Click Print button
3. Verify print layout
4. Check page count

**Expected**:
- [ ] Print button works
- [ ] Print layout fits 1 page (Letter/A4)
- [ ] All 11 fields included
- [ ] Sources listed
- [ ] Readable grayscale

---

## A11y Tests

### Test 8: Accessibility Features
**Status**: ⏳ Pending Manual Test  
**Steps**:
1. Test keyboard navigation
2. Test screen reader announcements
3. Test focus trap in flyout
4. Test Esc key in flyout

**Expected**:
- [ ] Live regions announce error/success
- [ ] Escape closes flyout
- [ ] Focus trap works in flyout
- [ ] Keyboard navigation complete
- [ ] Screen reader compatible

---

## Test Execution

### Local Execution
```bash
# Start dev server
cd ui
npm run dev

# In browser, execute test cases manually
# Document results in this file
```

### Production Build
```bash
# Build and preview
cd ui
npm run build
npm run preview

# Execute tests on production build
```

---

## Results Summary

- **Total Tests**: 8
- **Passed**: 0 (pending execution)
- **Failed**: 0
- **Pending**: 8

---

**Status**: Ready for Execution

**Last Updated**: 2024-11-08

