# UX Flows - Zoning Intelligence

## Overview

This document describes the user experience flows for the Zoning Intelligence application, focusing on the NLQ-first approach and search functionality.

## Primary Flow: NLQ Home → Results

### 1. Home Page (NLQ-First)

```
User lands on Home
  ↓
NLQ input is primary, auto-focused
  ↓
User types query (e.g., "front setback for APN 0204050712")
  ↓
Parse preview appears inline with:
  - Intent chip (aria-live announced)
  - Confidence indicator
  - Location detected (if any)
  - "Missing APN?" affordance (if no locator)
  ↓
User clicks "Search" or presses Enter
  ↓
High confidence + locator → Direct to Results
Low confidence or no locator → Advanced Search page
```

### 2. Advanced Search Page

```
User clicks "Advanced Search" or low confidence redirect
  ↓
Default tab: "Ask a Question" (NLQ)
  ↓
User can switch to:
  - APN tab (with sanitizer)
  - Location tab (Lat/Lng)
  ↓
City field is optional (defaults to Austin)
  ↓
Single primary "Search" button
  ↓
Results page
```

### 3. APN Input Flow

```
User pastes messy APN: "0204 050-712"
  ↓
Sanitizer removes non-digits → "0204050712"
  ↓
Telemetry tracks sanitization count
  ↓
Validation checks format (8-12 digits)
  ↓
Sample chip available for quick fill
  ↓
Submit enabled when valid
```

### 4. Recent Searches

```
After successful search
  ↓
Query saved to localStorage (max 3)
  ↓
Home page shows recent searches
  ↓
User clicks recent → Pre-fills NLQ input
  ↓
Parse preview appears automatically
```

## Accessibility Features

- **Aria-live announcements**: Intent detection announced to screen readers
- **Focus management**: NLQ input auto-focused on Home
- **Keyboard navigation**: Full keyboard support throughout
- **Error announcements**: Validation errors announced via aria-live
- **Semantic HTML**: Proper labels, roles, and landmarks

## Telemetry Events

- `intent_detected`: When NLQ parser detects intent
- `apn_sanitized`: When APN input is sanitized
- `recents_viewed`: When recent searches are displayed
- `search_submit`: When search is submitted

## Component Interactions

### Home.jsx
- Primary: NLQ input (large, auto-focused)
- Secondary: Advanced Search link
- Recent searches list (if available)

### Search.jsx
- Default tab: "Ask a Question"
- Unified primary button: "Search"
- Optional city field
- APN sanitizer integration

### ParsePreview.jsx
- Inline confidence hints
- "Missing APN?" affordance
- Intent selection (if ambiguous)

### ApnInput.jsx
- Paste sanitization
- Format validation
- Sample chip
- Help text

## Error Handling

- **Validation errors**: Shown inline with aria-live
- **Network errors**: Retry button provided
- **Parse errors**: Fallback to Advanced Search
- **Invalid APN**: Format error with help text

