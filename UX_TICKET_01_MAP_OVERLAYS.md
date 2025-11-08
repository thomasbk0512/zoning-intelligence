# UX Ticket 1: Map Overlays

**Ticket**: UX-001  
**Priority**: High  
**Status**: Ready  
**Effort**: 8-12 hours

---

## Description

Add interactive map visualization showing parcel boundaries and zoning districts with toggleable overlay controls.

---

## Requirements

### Functional
- Display parcel geometry on map
- Show zoning district boundaries
- Color-code zones
- Toggle overlay visibility
- Interactive map controls (zoom/pan)

### Technical
- **Library**: MapLibre GL JS or Leaflet
- **Files**: 
  - `ui/src/pages/Results.tsx` (integrate map)
  - `ui/src/components/Map.tsx` (new component)
  - `ui/src/components/ParcelLayer.tsx` (new component)
  - `ui/src/components/ZoningLayer.tsx` (new component)
- **Data**: Use parcel geometry from backend response

### Accessibility
- Map has accessible name and description
- Keyboard navigation for controls
- ARIA labels for toggles
- Screen reader announcements

---

## Implementation

### Map Component
```typescript
// ui/src/components/Map.tsx
interface MapProps {
  parcelGeometry: GeoJSON
  zoningGeometry?: GeoJSON
  center: [number, number]
  zoom?: number
}
```

### Overlay Toggles
- Parcel boundary toggle
- Zoning district toggle
- Base map toggle

### Styling
- Color-code zones (e.g., SF-3 = blue, MF-1 = green)
- Highlight selected parcel
- Responsive map container

---

## Acceptance Criteria

- [ ] Map renders without blocking core flow
- [ ] Parcel boundaries visible
- [ ] Zones color-coded correctly
- [ ] Toggle controls work
- [ ] No layout shift (CLS <0.1)
- [ ] Accessible name/description present
- [ ] Keyboard navigation works
- [ ] Performance maintained (Lighthouse ≥90)
- [ ] Responsive on mobile/tablet/desktop

---

## Testing

### Unit Tests
- [ ] Map component renders
- [ ] Overlay toggles work
- [ ] Geometry displays correctly

### Integration Tests
- [ ] Map loads with results
- [ ] Toggles don't break flow
- [ ] Performance maintained

### Accessibility Tests
- [ ] Screen reader compatible
- [ ] Keyboard navigation works
- [ ] ARIA labels correct

---

## Dependencies

- Map library (MapLibre or Leaflet)
- GeoJSON data from backend
- Parcel geometry in response

---

**Status**: Ready for Implementation

