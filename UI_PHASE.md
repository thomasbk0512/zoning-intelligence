# UI Development Phase

**Status**: 🚀 INITIATED

---

## Backend Status

✅ **Backend Release Stable**
- v1.0.1-dev release ready
- API stable and documented
- CI pipeline configured
- Remote push pending (can proceed in parallel)

---

## UI Workspace

✅ **Initialized**
- Location: `ui/`
- Framework: React 18 + Vite
- Styling: Tailwind CSS
- Routing: React Router

---

## Architecture

### Tech Stack
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Project Structure
```
ui/
├── src/
│   ├── components/    # Reusable components (Layout, etc.)
│   ├── pages/         # Page components (Home, Search, Results)
│   ├── services/      # API services
│   ├── styles/        # Global styles (Tailwind)
│   └── utils/         # Utility functions
├── public/            # Static assets
└── docs/              # Documentation
```

---

## Design Goals

### Screens
1. **Home** - Landing page with search CTA
2. **Search** - APN or location search form
3. **Results** - Zoning information display

### User Flow
1. Landing → Home page
2. Search → Enter APN or coordinates
3. Results → View zoning information
4. Return → Back to search

### Design Principles
- Simplicity: Clean, uncluttered interface
- Clarity: Clear presentation of zoning data
- Speed: Fast search and results
- Responsive: Mobile and desktop
- Accessible: WCAG 2.1 AA compliance

---

## API Integration

### Backend CLI Contract
```bash
python3 zoning.py --apn <APN> --city <city> --out out.json
python3 zoning.py --lat <lat> --lng <lng> --city <city> --out out.json
```

### API Service
- Location: `ui/src/services/api.js`
- Methods: `searchByAPN()`, `searchByLocation()`
- TODO: Implement API wrapper or direct CLI calls

---

## Next Steps

### Immediate
- [ ] Install dependencies: `cd ui && npm install`
- [ ] Start dev server: `npm run dev`
- [ ] Verify initial layout

### Short-term
- [ ] Implement API integration
- [ ] Connect search forms to backend
- [ ] Display real results
- [ ] Add error handling
- [ ] Improve styling

### v1.0.0 UI Milestone
- [ ] Complete search functionality
- [ ] Results display with all fields
- [ ] Responsive design
- [ ] Basic accessibility
- [ ] Production build

---

**Status**: ✅ UI v1.0.0 MVP DELIVERED - READY FOR QA

---

## UI-API Integration Summary

### API Contract

The UI integrates with the backend CLI via HTTP API:

**Endpoint**: `GET /zoning`

**Query Parameters**:
- APN search: `?apn=<APN>&city=<city>`
- Location search: `?latitude=<lat>&longitude=<lng>&city=<city>`

**Response Schema** (frozen):
```typescript
{
  apn: string
  jurisdiction: string
  zone: string
  setbacks_ft: { front, side, rear, street_side }
  height_ft: number
  far: number
  lot_coverage_pct: number
  overlays: string[]
  sources: Array<{ type: string, cite: string }>
  notes: string
  run_ms: number
}
```

### Implementation Details

**API Service** (`src/lib/api.ts`):
- Axios instance with 60s timeout
- Error handling for network, timeout, 4xx/5xx
- Response validation against frozen schema
- TypeScript types matching backend output

**Error Handling**:
- Network errors: "Network error. Please check your connection."
- Timeouts: "Request timeout. Please try again."
- 404: "Property not found. Please check the APN."
- 5xx: "Server error (XXX). Please try again later."
- Invalid schema: "Invalid response schema from API"

**State Management**:
- URL query params persist search state
- React Router state for results navigation
- Loading and error states in components

### Testing

**Unit Tests**:
- API service mocking (`src/lib/api.test.ts`)
- Schema validation (`src/lib/validate.test.ts`)
- Error handling scenarios

**CI Integration**:
- `.github/workflows/ui.yml` runs on UI changes
- Tests, lint, typecheck, and build verification

### Quality Metrics

**Targets**:
- Lighthouse Performance: ≥90
- Lighthouse Accessibility: ≥90
- TypeScript: Strict mode, no errors
- ESLint: No warnings
- Tests: All passing

**Last Updated**: 2024-11-08

