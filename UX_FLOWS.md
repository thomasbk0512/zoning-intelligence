# UX Flows Documentation

## Overview

This document describes the primary user flows in the Zoning Intelligence application, including navigation patterns, state management, and accessibility features.

## Primary Flow: Home → Search → Results

```
┌─────────┐      ┌─────────┐      ┌──────────┐
│  Home   │─────▶│ Search  │─────▶│ Results  │
│    /    │      │ /search │      │ /results │
└─────────┘      └─────────┘      └──────────┘
     │                │                 │
     │                │                 │
     └────────────────┴─────────────────┘
              "New Search" button
```

## Route Structure

### `/` - Home Page
- **Purpose**: Landing page with CTA to search
- **Components**: Hero section, feature cards
- **Navigation**: 
  - "Search Property" button → `/search`
  - Header nav links (Home, Search)

### `/search` - Search Page
- **Purpose**: Input form for property search
- **Search Types**:
  - **APN**: Assessor's Parcel Number (digits only)
  - **Location**: Latitude/Longitude coordinates
- **Validation**:
  - Client-side validation with inline errors
  - APN: Required, digits only
  - Lat: Required, -90 to 90
  - Lng: Required, -180 to 180
- **Navigation**:
  - Submit → `/results?type=apn&apn=...&city=...` or `/results?type=location&lat=...&lng=...&city=...`
  - Header nav links

### `/results` - Results Page
- **Purpose**: Display zoning information
- **States**:
  - **Loading**: Skeleton cards, aria-live announcement
  - **Success**: 11-field panel + map
  - **Empty**: "No parcel found" with hint + "New Search" button
  - **Error**: Error message + "Retry Search" button
- **Navigation**:
  - "New Search" button → `/search`
  - "Retry Search" button → Re-fetches with same params
  - Header nav links

## Deep Linking

Results page supports deep linking via query parameters:

- **APN Search**: `/results?type=apn&apn=0204050712&city=austin`
- **Location Search**: `/results?type=location&lat=30.2672&lng=-97.7431&city=austin`

When accessed directly, the page will:
1. Parse query parameters
2. Fetch data from API
3. Display loading state → success/error/empty state

## State Management

### Search Page States
- **Idle**: Form ready for input
- **Validating**: Client-side validation running
- **Submitting**: API request in progress
- **Error**: API error or validation error displayed

### Results Page States
- **Loading**: Fetching data from API
- **Success**: Data loaded, displaying 11-field schema
- **Empty**: No data found (404 or empty response)
- **Error**: Network error, timeout, or server error

## Accessibility Features

### Page Structure
- **Landmarks**: `<header>`, `<main>`, `<footer>`
- **Page Titles**: Each page has a single `<h1>`
- **ARIA Live Regions**: Status announcements for loading/error/success

### Navigation
- **Keyboard Navigation**: All interactive elements focusable
- **Focus Management**: 
  - Route changes focus to `<main>` (unless user is in form)
  - Errors focus to error container
- **Active States**: Current page indicated in nav with `aria-current="page"`

### Form Validation
- **Inline Errors**: Displayed below inputs with `aria-describedby`
- **Error Announcements**: `aria-live="assertive"` for form errors
- **Status Updates**: `aria-live="polite"` for loading/success states

## Error Handling

### Client-Side Validation
- **APN**: Must be non-empty, digits only
- **Latitude**: Must be number between -90 and 90
- **Longitude**: Must be number between -180 and 180
- Errors clear on input change

### API Errors
- **404**: "Property not found" → Empty state
- **500+**: "Server error" → Error state with retry
- **Network**: "Network error" → Error state with retry
- **Timeout**: "Request timeout" → Error state with retry

## Design Tokens

All UI elements use design tokens (see `ui/src/design/tokens.css`):
- Colors: `text`, `text-muted`, `primary`, `danger`, etc.
- Spacing: `spacing-1` through `spacing-6`
- Radii: `radius-1` through `radius-4`
- Typography: Font family, sizes, weights

## Testing Checklist

### Manual Testing
- [ ] Navigate Home → Search → Results (keyboard only)
- [ ] Enter invalid APN → inline error, submit blocked
- [ ] Enter invalid Lat/Lng → inline errors, submit blocked
- [ ] Submit valid APN → Results loads, skeleton → data
- [ ] Submit valid Lat/Lng → Results loads, skeleton → data
- [ ] Error path shows retry → retry returns to loading → result/empty
- [ ] Deep link to `/results?type=apn&apn=...` → loads data
- [ ] Deep link to `/results?type=location&lat=...&lng=...` → loads data

### Accessibility Testing
- [ ] One `<h1>` per page
- [ ] Landmarks present (`header`, `main`, `footer`)
- [ ] `aria-live` updates announce status
- [ ] Focus order is logical
- [ ] Focus rings visible (2px, not clipped)
- [ ] Text contrast ≥4.5:1 for body text

### Schema Verification
- [ ] Results page shows exactly 11 fields:
  1. `apn` (string)
  2. `jurisdiction` (string)
  3. `zone` (string)
  4. `setbacks_ft` (object: front, side, rear, street_side)
  5. `height_ft` (number)
  6. `far` (number)
  7. `lot_coverage_pct` (number)
  8. `overlays` (array)
  9. `sources` (array)
  10. `notes` (string)
  11. `run_ms` (number)

## Performance Considerations

- **Code Splitting**: Results page lazy-loaded
- **Caching**: API responses cached in memory
- **Debouncing**: URL params update debounced
- **Skeleton Loading**: Provides visual feedback during fetch

## Future Enhancements

- Recent activity on Home page (non-blocking)
- Search history
- Shareable result URLs
- Print-optimized layout (already scaffolded)

