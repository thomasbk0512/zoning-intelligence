# Telemetry Contract

This document defines the pinned telemetry event contract (version 1.0.0).

## Contract Version

**Current Version**: 1.0.0  
**Pinned**: v1.4.0-rc.1

## Event Schema

All events must include:
- `event_type`: Event type identifier
- `timestamp`: Unix timestamp (milliseconds)
- `session_id`: Session identifier
- `build_id`: Build identifier
- `route`: Current route path
- `schema_version`: **Must be "1.0.0"** (pinned)

## Event Types

### page_view

```typescript
{
  event_type: 'page_view',
  referrer_type: 'internal' | 'external' | 'direct',
  // ... base fields
}
```

### search_submit

```typescript
{
  event_type: 'search_submit',
  mode: 'apn' | 'latlng',
  query_len: number,  // Length only (not content)
  valid: boolean,
  // ... base fields
}
```

### validation_error

```typescript
{
  event_type: 'validation_error',
  field: 'apn' | 'lat' | 'lng',
  reason: 'format' | 'range' | 'required',
  // ... base fields
}
```

### results_render

```typescript
{
  event_type: 'results_render',
  result_count: number,
  fetch_ms: number,
  render_ms: number,
  schema_fields: number,  // Should be 11
  // ... base fields
}
```

### error_shown

```typescript
{
  event_type: 'error_shown',
  surface: 'results' | 'search',
  code: string,  // Error code (e.g., 'NETWORK_ERROR')
  // ... base fields
}
```

### web_vitals

```typescript
{
  event_type: 'web_vitals',
  metric: 'FCP' | 'LCP' | 'CLS' | 'INP' | 'TTFB',
  value: number,
  rating: 'good' | 'needs-improvement' | 'poor',
  // ... base fields
}
```

## Change Control

### Version 1.0.0 (Pinned)

**No changes allowed** to:
- Event type definitions
- Required fields
- Field types
- Enum values

**Allowed**:
- Adding new event types (with new schema_version)
- Extending optional fields (with new schema_version)

### Future Versions

To introduce breaking changes:
1. Increment `schema_version` (e.g., "2.0.0")
2. Update contract documentation
3. Update validation script
4. Coordinate with analytics consumers

## Verification

### Verify Contract

```bash
npm run telemetry:verify [path-to-telemetry.ndjson]
```

Validates events against pinned contract version 1.0.0.

### CI Integration

Contract verification runs automatically:
- Validates `telemetry.ndjson` in quality-gates job
- Fails CI if events don't match contract
- Ensures backward compatibility

## Privacy Policy

**PII-Safe**: No raw queries, APNs, addresses, or coordinates are captured.

**Data Minimization**:
- Only query lengths (not content)
- Only counts, enums, timings
- Only error codes (not messages)

## Changelog

### 1.0.0 (v1.4.0-rc.1)
- Initial contract freeze
- 6 event types defined
- PII-safe design enforced

## Related

- `ui/src/telemetry/events.ts` - TypeScript definitions
- `scripts/telemetry/verify-contract.mjs` - Verification script
- `UX_TELEMETRY.md` - User-facing telemetry guide

