# Answers Review Workflow

## Overview

The Answers Review system allows users to flag incorrect answers and propose corrections. Maintainers can then create verified overrides that take precedence over the rules engine.

## Workflow

### 1. User Feedback

Users can provide feedback on any answer card:

1. Click "Was this correct?" on an answer card
2. Select thumbs up (correct) or thumbs down (incorrect)
3. Optionally provide a reason (max 120 characters)
4. If incorrect, optionally propose a correction:
   - Value
   - Unit
   - Code section
   - Code anchor (optional)

**Privacy**: Feedback is telemetry-only. No addresses, APNs, or full queries are stored.

### 2. Feedback Collection

Feedback is collected via telemetry events (`answer_feedback`):

- Stored in CI artifacts as `telemetry.ndjson`
- Validated against `feedback.schema.json`
- No external services required

### 3. Triage

Maintainers review feedback:

1. Access admin interface: `/admin/overrides?admin=1`
2. Compare rules vs overrides for each zone/intent
3. Review proposed corrections from feedback
4. Verify citations and rationale

### 4. Creating Overrides

When feedback is verified, create an override:

1. Copy override JSON from admin interface (or create manually)
2. Add to `ui/src/engine/answers/overrides.json`
3. Follow override schema:
   ```json
   {
     "district": "SF-3",
     "intent": "front_setback",
     "value": 30,
     "unit": "ft",
     "citation": {
       "code_id": "austin_ldc_2024",
       "section": "25-2-492",
       "anchor": "(B)(1)(a)"
     },
     "rationale": "Updated per code amendment 2024-01-15",
     "scope": "district"
   }
   ```

### 5. Override Precedence

Overrides are applied with the following precedence:

1. **Parcel-scoped overrides** (highest priority)
   - Applies to specific APN
   - Requires `scope: "parcel"` and `apn` field

2. **District-scoped overrides**
   - Applies to all parcels in district
   - Default scope

3. **Rules** (lowest priority)
   - Default answers from rules engine

### 6. Versioning

Overrides are versioned via Git:

- Each change to `overrides.json` is a new version
- CI validates schema and applies to goldens
- Hash is computed for traceability

### 7. Sunset Policy

Overrides can include an `expires` field:

```json
{
  "expires": "2025-12-31"
}
```

Expired overrides are automatically ignored. Use this for:
- Temporary corrections pending code updates
- Time-limited exceptions
- Seasonal variations

## Admin Interface

Access: `/admin/overrides?admin=1`

Features:
- View all overrides by zone
- Compare rules vs overrides side-by-side
- Copy override JSON for verified corrections
- See rationale and expiration dates

## CI Validation

The `answers-review` CI job:

1. Validates `overrides.json` against schema
2. Checks for expired overrides
3. Applies overrides to golden vectors
4. Verifies no missing answers
5. Generates report with hash

## Rollback

To rollback an override:

1. Remove entry from `overrides.json`
2. Commit and push
3. CI will validate and regenerate goldens

## Best Practices

- **Citation required**: Every override must cite a code section
- **Rationale ≤160 chars**: Keep explanations concise
- **Verify before override**: Confirm correction with official sources
- **Use expiration**: Set expiry for temporary corrections
- **Parcel vs district**: Use parcel scope only when necessary

## Related

- `OVERRIDES_GOVERNANCE.md` - Approval process and policies
- `engine/answers/overrides.schema.json` - Schema definition
- `scripts/answers/validate-overrides.mjs` - Validation script

