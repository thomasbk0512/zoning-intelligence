# UX Ticket 4: A11y Upgrades

**Ticket**: UX-004  
**Priority**: High  
**Status**: Ready  
**Effort**: 3-5 hours

---

## Description

Enhanced accessibility with assertive aria-live for errors and state transition announcements (idle→loading→done).

---

## Requirements

### Functional
- Assertive aria-live for errors
- Polite aria-live for results
- State transition announcements
- Enhanced screen reader support

### Technical
- **Files**: 
  - `ui/src/pages/Search.tsx` (update ARIA)
  - `ui/src/pages/Results.tsx` (update ARIA)
- **Features**: Status roles, live regions

### Accessibility
- Screen reader announces idle→loading→done
- Errors announced assertively
- State changes announced
- Proper ARIA roles

---

## Implementation

### ARIA Live Regions
```typescript
// Assertive for errors
<div role="alert" aria-live="assertive">
  {error}
</div>

// Polite for results
<div role="status" aria-live="polite">
  {announcement}
</div>
```

### State Announcements
- Idle: "Ready to search"
- Loading: "Searching for property..."
- Done: "Results loaded for APN {apn}"
- Error: "Error: {message}"

---

## Acceptance Criteria

- [ ] Assertive aria-live for errors
- [ ] Polite aria-live for results
- [ ] Screen reader announces idle→loading→done
- [ ] Errors announced assertively
- [ ] State transitions announced
- [ ] Lighthouse Accessibility ≥90
- [ ] Screen reader compatible

---

## Testing

### Unit Tests
- [ ] ARIA attributes present
- [ ] Live regions configured
- [ ] Announcements trigger

### Integration Tests
- [ ] Screen reader announces states
- [ ] Errors announced correctly
- [ ] Results announced correctly

### Accessibility Tests
- [ ] Screen reader testing
- [ ] Lighthouse audit
- [ ] Keyboard navigation

---

## Dependencies

- Existing error handling
- Loading states
- Result display

---

**Status**: Ready for Implementation

