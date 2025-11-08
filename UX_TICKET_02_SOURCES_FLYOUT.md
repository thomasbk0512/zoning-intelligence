# UX Ticket 2: Sources Flyout

**Ticket**: UX-002  
**Priority**: Medium  
**Status**: Ready  
**Effort**: 4-6 hours

---

## Description

Expandable source details component showing `sources[].cite` with linkable section anchors and proper accessibility.

---

## Requirements

### Functional
- Display all sources from `sources[]` array
- Show source type and citation
- Linkable anchors (e.g., §25-2-492)
- Expandable/collapsible list
- PDF links where applicable

### Technical
- **Files**: 
  - `ui/src/components/SourcesFlyout.tsx` (new component)
  - `ui/src/pages/Results.tsx` (integrate flyout)
- **Features**: Focus trap, Esc key to close

### Accessibility
- Keyboard-only usable
- Focus trap when open
- Esc key closes flyout
- Tab order correct
- ARIA labels and roles

---

## Implementation

### Flyout Component
```typescript
// ui/src/components/SourcesFlyout.tsx
interface SourcesFlyoutProps {
  sources: Array<{ type: string; cite: string }>
  isOpen: boolean
  onClose: () => void
}
```

### Features
- Collapsible source list
- Links to code sections
- PDF document links
- Focus management
- Keyboard shortcuts

---

## Acceptance Criteria

- [ ] Flyout accessible (Esc, focus trap)
- [ ] Keyboard-only usable
- [ ] Tab order correct
- [ ] Sources expandable
- [ ] Links to code sections work
- [ ] PDF links functional
- [ ] Screen reader compatible
- [ ] No layout shift when opening

---

## Testing

### Unit Tests
- [ ] Flyout opens/closes
- [ ] Focus trap works
- [ ] Esc key closes
- [ ] Links render correctly

### Integration Tests
- [ ] Flyout integrates with Results page
- [ ] Keyboard navigation works
- [ ] Screen reader announces

### Accessibility Tests
- [ ] Keyboard-only navigation
- [ ] Focus trap verified
- [ ] ARIA labels correct

---

## Dependencies

- Source data from backend
- Code section URLs (if available)
- PDF document URLs (if available)

---

**Status**: Ready for Implementation

