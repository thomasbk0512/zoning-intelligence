# UI v1.0.1 Release Notes

**Release Date**: 2024-11-08  
**Version**: ui-v1.0.1  
**Type**: Feature Release (UX Polish Milestone)

---

## Overview

UI v1.0.1 completes the UX polish milestone with 5 major enhancements: Map Overlays, Sources Flyout, Print Summary, Accessibility upgrades, and Performance optimizations.

---

## Features

### 🗺️ Map Overlays (UX-001)
- **MapLibre GL JS integration** for interactive map visualization
- **Parcel boundary overlay** with customizable visibility
- **Zoning district overlay** with color-coding by zone type
- **Keyboard-accessible toggle controls** for overlay management
- **ARIA labels and descriptions** for screen reader support
- **No layout shift** - maintains CLS <0.1

### 📋 Sources Flyout (UX-002)
- **Expandable source details** showing all citations
- **Focus trap** for keyboard-only navigation
- **Esc key support** to close flyout
- **Accessible dialog** with proper ARIA roles
- **Linkable section anchors** for code references

### 🖨️ Print Summary (UX-003)
- **Print-optimized layout** for A4/Letter paper
- **One-page format** with all 11 fields included
- **Clean grayscale styling** for readability
- **Print button** in Results page
- **No UI chrome** in print view

### ♿ Accessibility Upgrades (UX-004)
- **Polite aria-live regions** for result announcements
- **Assertive aria-live regions** for error messages
- **State transition announcements** (idle→loading→done)
- **Enhanced screen reader support** throughout
- **Keyboard navigation** improvements

### ⚡ Performance Optimizations (UX-005)
- **Code-split Results component** via React.lazy
- **Response caching** with 5-minute TTL
- **Lazy loading** with Suspense fallbacks
- **Reduced bundle size** for faster initial load
- **Maintained Lighthouse ≥90** performance target

---

## Technical Details

### Dependencies Added
- `maplibre-gl`: ^4.0.0 (Map visualization)
- `@types/geojson`: ^7946.0.13 (TypeScript support)

### Build Output
- Main bundle: ~213 KB (gzipped: ~72 KB)
- Results chunk: ~5 KB (gzipped: ~1.5 KB)
- Print chunk: ~3 KB (gzipped: ~0.8 KB)

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features required
- MapLibre GL requires WebGL support

---

## Breaking Changes

**None** - This is a backward-compatible feature release.

---

## Migration Guide

No migration required. All changes are additive and backward-compatible.

---

## Testing

### Integration Tests
- ✅ APN search → 11 fields render
- ✅ Lat/Lng search → 11 fields render
- ✅ Error handling → Retry button works
- ✅ Timeout handling → Skeletons display
- ✅ Input validation → ARIA feedback present

### Accessibility Tests
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ Focus trap functional
- ✅ ARIA live regions announce correctly

### Performance Tests
- ✅ Lighthouse Performance ≥90
- ✅ Lighthouse Accessibility ≥90
- ✅ Lighthouse Best Practices ≥90
- ✅ Lighthouse SEO ≥90

---

## Known Issues

None at this time.

---

## Contributors

- UX-001: Map Overlays implementation
- UX-002: Sources Flyout implementation
- UX-003: Print Summary implementation
- UX-004: Accessibility upgrades
- UX-005: Performance optimizations

---

## Next Steps

- E2E regression testing phase
- Additional map features (if needed)
- Enhanced print templates
- Further performance optimizations

---

**Full Changelog**: See `CHANGELOG.md` for detailed commit history.

