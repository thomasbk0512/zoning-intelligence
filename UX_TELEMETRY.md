# Telemetry Guide

This document describes the privacy-safe, token-light telemetry system for the Zoning Intelligence UI.

## Overview

Telemetry captures key user events and Web Vitals metrics to understand usage patterns and performance. All events are **PII-safe** - no raw queries, APNs, addresses, or coordinates are captured.

## Privacy Policy

### What We Collect

- **Event types**: page views, search submissions, validation errors, results renders, errors shown
- **Metadata**: route paths, query lengths (not content), timings, counts, enums
- **Web Vitals**: Core Web Vitals metrics (LCP, CLS, INP, FCP, TTFB)

### What We Don't Collect

- ❌ Raw APN values
- ❌ Raw latitude/longitude coordinates
- ❌ Addresses or property identifiers
- ❌ User IP addresses
- ❌ Browser fingerprints
- ❌ Third-party analytics IDs

### Data Minimization

- Only query **lengths** are captured (e.g., `query_len: 10`)
- Only **counts** and **enums** are used (e.g., `mode: "apn"`, `result_count: 1`)
- Only **timings** in milliseconds (e.g., `fetch_ms: 1234`)
- Only **error codes** (e.g., `code: "NETWORK_ERROR"`)

## Event Taxonomy

### page_view

Tracks page navigation events.

```typescript
{
  event_type: 'page_view',
  route: '/search',
  referrer_type: 'internal' | 'external' | 'direct',
  timestamp: number,
  session_id: string,
  build_id: string,
  schema_version: '1.0.0'
}
```

### search_submit

Tracks search form submissions.

```typescript
{
  event_type: 'search_submit',
  mode: 'apn' | 'latlng',
  query_len: number,  // Length of query string (not the query itself)
  valid: boolean,
  route: '/search',
  timestamp: number,
  session_id: string,
  build_id: string,
  schema_version: '1.0.0'
}
```

### validation_error

Tracks form validation errors.

```typescript
{
  event_type: 'validation_error',
  field: 'apn' | 'lat' | 'lng',
  reason: 'format' | 'range' | 'required',
  route: '/search',
  timestamp: number,
  session_id: string,
  build_id: string,
  schema_version: '1.0.0'
}
```

### results_render

Tracks successful results page renders.

```typescript
{
  event_type: 'results_render',
  result_count: number,  // Always 1 for single-parcel results
  fetch_ms: number,
  render_ms: number,
  schema_fields: number,  // Count of fields rendered (should be 11)
  route: '/results',
  timestamp: number,
  session_id: string,
  build_id: string,
  schema_version: '1.0.0'
}
```

### error_shown

Tracks error states shown to users.

```typescript
{
  event_type: 'error_shown',
  surface: 'results' | 'search',
  code: string,  // Error code (e.g., 'NETWORK_ERROR', 'NOT_FOUND')
  route: string,
  timestamp: number,
  session_id: string,
  build_id: string,
  schema_version: '1.0.0'
}
```

### web_vitals

Tracks Core Web Vitals metrics.

```typescript
{
  event_type: 'web_vitals',
  metric: 'FCP' | 'LCP' | 'CLS' | 'INP' | 'TTFB',
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor',
  route: string,
  timestamp: number,
  session_id: string,
  build_id: string,
  schema_version: '1.0.0'
}
```

## Configuration

### Environment Variables

- `VITE_TELEM_ENABLE` (default: `true`) - Enable/disable telemetry
- `VITE_TELEM_TRANSPORT` (default: `console` in dev, `console` in CI) - Transport method:
  - `console` - Log to console (NDJSON format)
  - `beacon` - Send via `navigator.sendBeacon` to `/telemetry` endpoint
  - `noop` - Disable telemetry
- `VITE_TELEM_SAMPLING_RATE` (default: `1.0`) - Sampling rate (0.0 to 1.0)
- `VITE_TELEM_ENDPOINT` (default: `/telemetry`) - Endpoint for beacon transport
- `VITE_BUILD_ID` (default: `dev`) - Build identifier

### Local Development

Telemetry is enabled by default and logs to console:

```bash
cd ui
npm run dev
# Events will appear in browser console as [TELEMETRY] {...}
```

### Testing

Disable telemetry in tests:

```bash
VITE_TELEM_ENABLE=false npm run test
```

Or use `noop` transport:

```bash
VITE_TELEM_TRANSPORT=noop npm run test
```

## Transports

### Console (Default)

Events are logged to the browser console in NDJSON format:

```
[TELEMETRY] {"event_type":"page_view","route":"/","timestamp":1234567890,...}
[TELEMETRY] {"event_type":"search_submit","mode":"apn","query_len":10,...}
```

### Beacon

Events are sent via `navigator.sendBeacon` to a configured endpoint:

```typescript
// Configure endpoint
VITE_TELEM_ENDPOINT=/api/telemetry
VITE_TELEM_TRANSPORT=beacon
```

### Noop

Telemetry is disabled (no events are captured or sent).

## Sampling

Sampling is applied per-event using `TELEM_SAMPLING_RATE`:

- `1.0` - All events captured (100%)
- `0.5` - Half of events captured (50%)
- `0.1` - One in ten events captured (10%)

Sampling is applied before queuing, so rejected events are never processed.

## Flush Behavior

Events are flushed:

1. **Periodically**: Every 30 seconds (configurable via `FLUSH_INTERVAL_MS`)
2. **On page unload**: `beforeunload` event
3. **On visibility change**: When page becomes hidden
4. **On queue size**: When queue reaches 100 events (configurable via `MAX_QUEUE_SIZE`)

## Local Testing

### View Events in Console

1. Open browser DevTools
2. Navigate through the app
3. Check console for `[TELEMETRY]` logs

### Export Events for Validation

Use the E2E test to capture events:

```bash
cd ui
npm run build
npm run serve &
npm run test:e2e tests/e2e/telemetry.spec.ts
# Events saved to artifacts/telemetry.ndjson
```

### Validate Events

```bash
cd ui
node scripts/telemetry/validate.mjs artifacts/telemetry.ndjson
```

## Extending Telemetry

### Adding a New Event Type

1. **Define event type** in `ui/src/telemetry/events.ts`:

```typescript
export interface MyNewEvent extends BaseEvent {
  event_type: 'my_new_event'
  my_field: string
  my_count: number
}
```

2. **Add to schema** in `TELEMETRY_SCHEMA`:

```typescript
myNewEvent: {
  allOf: [
    { $ref: '#/definitions/baseEvent' },
    {
      type: 'object',
      required: ['event_type', 'my_field', 'my_count'],
      properties: {
        event_type: { const: 'my_new_event' },
        my_field: { type: 'string' },
        my_count: { type: 'number' },
      },
    },
  ],
}
```

3. **Add to oneOf** in schema:

```typescript
oneOf: [
  // ... existing events
  { $ref: '#/definitions/myNewEvent' },
]
```

4. **Create tracking function** in `ui/src/hooks/useTelemetry.ts`:

```typescript
export function trackMyNewEvent(myField: string, myCount: number) {
  track({
    event_type: 'my_new_event',
    my_field: myField,
    my_count: myCount,
  })
}
```

5. **Use in components**:

```typescript
import { trackMyNewEvent } from '../hooks/useTelemetry'

// In component
trackMyNewEvent('value', 42)
```

6. **Update validation script** if needed (schema is already updated)

7. **Update E2E tests** to verify new event type

## CI Integration

Telemetry validation runs in CI via the `telemetry-validate` job:

1. Builds production app
2. Runs E2E test to capture events
3. Validates events against JSON Schema
4. Uploads artifacts (NDJSON file)

### Viewing CI Artifacts

1. Go to GitHub Actions → Workflow run
2. Download `telemetry-artifacts` artifact
3. Extract `telemetry.ndjson`
4. Validate locally: `node scripts/telemetry/validate.mjs telemetry.ndjson`

## Performance Impact

Telemetry has **negligible overhead**:

- In-memory queue (no disk I/O)
- Batched flushing (reduces transport calls)
- Sampling support (reduces event volume)
- No blocking operations
- No measurable regression to Lighthouse budgets

## Schema Validation

All events are validated against a JSON Schema using `ajv`:

- **Location**: `ui/src/telemetry/events.ts` (inline schema)
- **Validator**: `ui/scripts/telemetry/validate.mjs`
- **CI**: Automatic validation on every PR

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [JSON Schema](https://json-schema.org/)
- [Ajv Validator](https://ajv.js.org/)

