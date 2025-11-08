# UI v1.0.0 MVP QA Issues

**QA Date**: 2024-11-08  
**Status**: In Progress

---

## Critical Issues (P0)

_None found_

---

## High Priority (P1)

### P1-001: API Test Mocking Needs Refinement
**Status**: Open  
**Severity**: P1  
**Component**: `src/lib/api.test.ts`

**Description**:  
API tests have mocking issues that cause some tests to fail. The axios mock needs better setup to handle the module structure.

**Steps to Reproduce**:
```bash
npm run test
```

**Expected**: All tests pass  
**Actual**: 2 tests fail due to mock setup

**Fix**: Refine axios mocking strategy in test setup

---

## Medium Priority (P2)

### P2-001: Missing Loading Skeleton on Results Page
**Status**: Open  
**Severity**: P2  
**Component**: `src/pages/Results.tsx`

**Description**:  
Results page doesn't show a loading skeleton while data is being fetched. Users see blank page during API call.

**Fix**: Add loading skeleton component for better UX

### P2-002: No Retry Button on Error State
**Status**: Open  
**Severity**: P2  
**Component**: `src/pages/Search.tsx`

**Description**:  
When API call fails, error message is shown but there's no explicit retry button. Users must resubmit the form.

**Fix**: Add retry button to error state

### P2-003: Missing ARIA Live Region for Search Results
**Status**: Open  
**Severity**: P2  
**Component**: `src/pages/Results.tsx`

**Description**:  
Results page has `aria-live="polite"` but it's on the container, not a dedicated live region for screen readers.

**Fix**: Add dedicated aria-live region for results announcement

---

## Low Priority / Enhancements

### Enhancement-001: Add Loading Spinner Component
**Status**: Open  
**Severity**: Enhancement  
**Component**: Global

**Description**:  
Create reusable loading spinner component for consistent loading states across the app.

### Enhancement-002: Add Error Boundary
**Status**: Open  
**Severity**: Enhancement  
**Component**: Global

**Description**:  
Add React error boundary to catch and display errors gracefully.

### Enhancement-003: Add Form Validation Feedback
**Status**: Open  
**Severity**: Enhancement  
**Component**: `src/pages/Search.tsx`

**Description**:  
Add real-time validation feedback as user types (e.g., APN format validation).

---

## QA Checklist Status

### Manual QA Paths
- [x] APN search → Results render 11 fields
- [x] Lat/Lng search → Results render 11 fields
- [ ] Network failure → error state visible + retry works (P2-002)
- [x] Empty input → validation messaging

### Accessibility Checks
- [x] Keyboard-only navigation works
- [x] Visible focus rings present
- [x] Labels for all form fields
- [x] Proper aria-invalid usage
- [ ] ARIA live region for results (P2-003)

### Responsive Checks
- [x] Mobile layout (iPhone 13, Pixel 6)
- [x] Tablet layout (iPad)
- [x] Desktop layout (1440×900)
- [x] No horizontal scroll
- [x] Tabs wrap correctly

### Lighthouse Audit
- [ ] Performance: _Pending_
- [ ] Accessibility: _Pending_
- [ ] Best Practices: _Pending_
- [ ] SEO: _Pending_

### Automated Tests
- [ ] All tests passing (P1-001)

---

## v1.0.1-ui Fixes List

### Must Fix (P0)
_None_

### Should Fix (P1)
1. Fix API test mocking (P1-001)

### Nice to Have (P2)
1. Add loading skeleton (P2-001)
2. Add retry button on error (P2-002)
3. Improve ARIA live region (P2-003)

---

**Last Updated**: 2024-11-08

