# Jurisdictions System

## Overview

The jurisdictions system allows the application to support multiple zoning jurisdictions, each with their own code sources and rules. This enables expansion beyond Austin to include ETJ areas, neighboring cities, and other jurisdictions.

## Architecture

### Registry

Jurisdictions are defined in `engine/juris/registry.json`:

```json
{
  "id": "travis_etj",
  "name": "Travis County ETJ",
  "code_ids": ["travis_etj_ord_2024"],
  "priority": 2
}
```

- **id**: Unique identifier (used in code)
- **name**: Human-readable name (displayed in UI)
- **code_ids**: Array of code identifiers used by this jurisdiction
- **priority**: Resolution priority (lower = higher priority)

### Resolver

The resolver (`engine/juris/resolve.ts`) determines jurisdiction from:

- **APN**: Maps known APNs to jurisdictions (stub mode)
- **Lat/Lng**: Uses bounding boxes to determine jurisdiction (stub mode)
- **Production**: Would query parcel/zoning layers spatially

## Adding a New Jurisdiction

### Step 1: Add to Registry

Add entry to `engine/juris/registry.json`:

```json
{
  "id": "new_jurisdiction",
  "name": "New Jurisdiction",
  "code_ids": ["new_code_2024"],
  "priority": 3
}
```

### Step 2: Add Rules

Extend `engine/answers/rules.ts`:

```typescript
function getNewJurisdictionRules(zone: string, intent: ZoningIntent): RuleResult | null {
  const rules: Record<string, Record<ZoningIntent, RuleResult>> = {
    SF3: {
      front_setback: {
        value: 25,
        unit: 'ft',
        rationale: '...',
        citations: [
          {
            code_id: 'new_code_2024',
            section: 'X.Y.Z',
            anchor: '(A)',
            snippet: '...',
          },
        ],
      },
      // ... other intents
    },
  }
  return rules[zone]?.[intent] || null
}
```

Update `getAnswersForZone` to use new jurisdiction:

```typescript
const rules =
  jurisdictionId === 'new_jurisdiction'
    ? getNewJurisdictionRules(normalizedZone, intent)
    : getAustinRules(normalizedZone, intent)
```

### Step 3: Add Citations

Add anchors to `engine/answers/citations.ts`:

```typescript
new_code_2024: {
  'X.Y.Z': 'Description of section',
  // ... other sections
}
```

### Step 4: Add Golden Fixtures

Create golden test fixtures in `engine/answers/goldens/`:

```json
{
  "zone": "SF-3",
  "jurisdiction": "new_jurisdiction",
  "answers": [...]
}
```

### Step 5: Update Resolver

Add APN/latlng mappings to `resolve.ts`:

```typescript
const stubMappings: Record<string, JurisdictionResult> = {
  'NEW001': { jurisdiction_id: 'new_jurisdiction', district: 'SF-3', resolver: 'stub' },
}
```

### Step 6: Add Tests

- Unit tests: `tests/unit/juris-resolver.spec.ts`
- Unit tests: `tests/unit/answers-new-juris.spec.ts`
- E2E tests: `tests/e2e/juris-new-juris.spec.ts`

### Step 7: Validate

Run validation:

```bash
node scripts/juris/validate-registry.mjs
```

## Current Jurisdictions

### Austin

- **ID**: `austin`
- **Code**: `austin_ldc_2024`
- **Priority**: 1

### Travis County ETJ

- **ID**: `travis_etj`
- **Code**: `travis_etj_ord_2024`
- **Priority**: 2

## UI Integration

- **JurisdictionBadge**: Shows jurisdiction name
- **Results page**: Displays jurisdiction and code source
- **AnswerCard**: Citations use correct code source per jurisdiction

## Telemetry

`jurisdiction_resolved` event tracks:

- `jurisdiction_id`: Resolved jurisdiction
- `resolver`: Method used (apn, latlng, stub)
- `district`: Zoning district

## Related

- `CITATION_SOURCING.md` - How to define and maintain code citations
- `OVERLAYS_README.md` - Overlay system (works across jurisdictions)

