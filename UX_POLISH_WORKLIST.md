# UX Polish Worklist

**Status**: Ready (After Integration Testing)  
**Target**: Post v1.0.1-ui

---

## Overview

Enhancements to improve user experience, add visual features, and optimize performance while maintaining the 11-field schema contract.

---

## Feature 1: Map Overlays

### Description
Visual zoning map display with parcel and zoning layers, toggleable overlays.

### Requirements
- Parcel boundaries visualization
- Zoning district highlighting
- Toggle overlay controls
- Interactive map (zoom/pan)

### Implementation
- **Library**: Leaflet or Mapbox
- **Components**: `MapView.tsx`, `ParcelLayer.tsx`, `ZoningLayer.tsx`
- **Data**: Use parcel geometry from backend
- **Styling**: Color-code zones, highlight selected parcel

### Acceptance Criteria
- [ ] Map renders without blocking core flow
- [ ] Parcel boundaries visible
- [ ] Zones color-coded
- [ ] Toggle controls work
- [ ] Performance maintained (Lighthouse ≥90)
- [ ] Accessible (keyboard navigation, ARIA labels)

### Effort
**Estimate**: 8-12 hours

---

## Feature 2: Sources Flyout

### Description
Expandable source details showing `sources[].cite` with section anchors.

### Requirements
- Collapsible source list
- Code citations with links
- PDF document links
- Section anchors (e.g., §25-2-492)

### Implementation
- **Component**: `SourcesFlyout.tsx`
- **Features**: Expand/collapse, links to code sections
- **Accessibility**: Focus trap, Esc key to close

### Acceptance Criteria
- [ ] Flyout accessible (Esc, focus trap)
- [ ] Sources expandable
- [ ] Links to code sections work
- [ ] PDF links functional
- [ ] Keyboard navigation works

### Effort
**Estimate**: 4-6 hours

---

## Feature 3: Print-Friendly Summary

### Description
One-page optimized print layout with all 11 fields + sources.

### Requirements
- Print-optimized CSS
- All 11 fields included
- Sources listed
- Clean formatting
- Print button

### Implementation
- **CSS**: `@media print` styles
- **Layout**: Single page optimized
- **Component**: Print button, print view
- **Format**: A4/Letter compatible

### Acceptance Criteria
- [ ] Print view ≤1 page @ A4/Letter
- [ ] All 11 fields included
- [ ] Sources listed
- [ ] Clean formatting
- [ ] Print button works

### Effort
**Estimate**: 2-4 hours

---

## Feature 4: A11y Upgrades

### Description
Enhanced accessibility with assertive aria-live for errors and state announcements.

### Requirements
- Assertive aria-live for errors
- Idle→loading→done announcements
- Enhanced screen reader support
- Keyboard navigation improvements

### Implementation
- **Components**: Update `Search.tsx`, `Results.tsx`
- **ARIA**: Add assertive live regions
- **Announcements**: State transitions
- **Testing**: Screen reader testing

### Acceptance Criteria
- [ ] Assertive aria-live for errors
- [ ] State announcements work
- [ ] Screen reader compatible
- [ ] Keyboard navigation enhanced
- [ ] Lighthouse Accessibility ≥90

### Effort
**Estimate**: 3-5 hours

---

## Feature 5: Performance Optimizations

### Description
Code-split Results component and cache last response in memory.

### Requirements
- Code splitting for Results page
- Memory cache for last response
- Lazy loading where appropriate
- Performance maintained

### Implementation
- **Code Splitting**: React.lazy for Results
- **Caching**: In-memory cache for API responses
- **Optimization**: Reduce bundle size
- **Monitoring**: Performance metrics

### Acceptance Criteria
- [ ] Results component code-split
- [ ] Last response cached
- [ ] Performance maintained (Lighthouse ≥90)
- [ ] Bundle size optimized
- [ ] No regressions

### Effort
**Estimate**: 4-6 hours

---

## Implementation Order

1. **A11y Upgrades** (Foundation)
   - Establishes accessibility baseline
   - Required for other features

2. **Performance Optimizations** (Foundation)
   - Ensures performance maintained
   - Required before adding features

3. **Print-Friendly Summary** (Quick Win)
   - Low effort, high value
   - Independent feature

4. **Sources Flyout** (Medium)
   - Enhances existing sources display
   - Moderate complexity

5. **Map Overlays** (Complex)
   - Most complex feature
   - Requires external library
   - Do last to ensure foundation is solid

---

## Acceptance Criteria (Overall)

### Must Pass
- [ ] Map renders without blocking core flow
- [ ] Flyout accessible (Esc, focus trap)
- [ ] Print view ≤1 page @ A4/Letter
- [ ] Lighthouse ≥90 (perf/a11y/SEO/best)
- [ ] E2E smoke (APN/LatLng) still pass
- [ ] Schema contract maintained (11 fields)
- [ ] No breaking changes

### Performance
- [ ] Lighthouse Performance ≥90
- [ ] Lighthouse Accessibility ≥90
- [ ] Lighthouse Best Practices ≥90
- [ ] Lighthouse SEO ≥90
- [ ] Bundle size maintained or reduced

### Accessibility
- [ ] WCAG 2.1 AA compliant
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] ARIA labels correct

---

## Testing Requirements

### Unit Tests
- [ ] Map component tests
- [ ] Flyout component tests
- [ ] Print view tests
- [ ] Cache tests

### Integration Tests
- [ ] E2E smoke tests still pass
- [ ] Map integration test
- [ ] Flyout integration test
- [ ] Print integration test

### Performance Tests
- [ ] Lighthouse audit
- [ ] Bundle size check
- [ ] Load time check

---

## Total Effort Estimate

- A11y Upgrades: 3-5 hours
- Performance Optimizations: 4-6 hours
- Print-Friendly Summary: 2-4 hours
- Sources Flyout: 4-6 hours
- Map Overlays: 8-12 hours

**Total**: 21-33 hours

---

## Dependencies

- Integration testing complete
- CI green
- v1.0.1-ui merged
- Performance baseline established

---

**Status**: Ready for Implementation (After Integration Testing)

**Last Updated**: 2024-11-08

