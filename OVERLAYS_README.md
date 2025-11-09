# Overlays & Exceptions System

## Overview

The overlays and exceptions system adjusts district-based zoning answers when a parcel is subject to overlay districts or lot-specific exceptions. This system provides deterministic conflict resolution and maintains full citation traceability.

## Architecture

### Precedence Chain

1. **Parcel-scoped overrides** (highest priority)
2. **Parcel exceptions** (corner lot, flag lot, etc.)
3. **Overlay replace operations**
4. **Overlay min/max/add operations**
5. **District rules** (default)

### Components

- **Overlays** (`engine/answers/overlays.ts`): Applies overlay district adjustments
- **Exceptions** (`engine/answers/conditions.ts`): Evaluates lot-specific exceptions
- **Conflicts** (`engine/answers/conflicts.ts`): Resolves conflicts deterministically
- **Merge** (`engine/answers/merge.ts`): Orchestrates all adjustments

## Overlay Adjustments

### Configuration

Overlays are defined in `config/overlays.json`:

```json
{
  "id": "HD",
  "name": "Historic District",
  "applies_to": ["front_setback", "max_height"],
  "op": "min",
  "value": 30,
  "unit": "ft",
  "citations": [...]
}
```

### Operations

- **`replace`**: Replace base value entirely
- **`add`**: Add offset to base value
- **`max`**: Constrain to maximum (value must be ≤ adjustment)
- **`min`**: Constrain to minimum (value must be ≥ adjustment)

### Example

SF-3 base front setback: 25 ft
Historic District overlay (min: 30 ft)
→ Final answer: 30 ft (overlay constraint applied)

## Exception Rules

### Configuration

Exceptions are defined in `config/exceptions.json`:

```json
{
  "id": "corner_lot",
  "predicate": "corner_lot",
  "adjustments": [
    {
      "intent": "front_setback",
      "op": "replace",
      "value": 20,
      "unit": "ft"
    }
  ],
  "citations": [...]
}
```

### Predicates

- **`corner_lot`**: Lot is on a corner
- **`flag_lot`**: Lot has flag/pole configuration
- **`min_frontage`**: Lot frontage below threshold
- **`steep_slope`**: Lot slope exceeds threshold

### Example

SF-3 base front setback: 25 ft
Corner lot exception (replace: 20 ft)
→ Final answer: 20 ft (exception applied)

## Conflict Resolution

When multiple sources produce incompatible values, the system escalates to `needs_review` status with:

- List of conflicting sources
- Values from each source
- Citations for each source
- Human-readable conflict message

### Example Conflict

Overlay (NP): max lot_coverage = 35%
Exception (steep_slope): max lot_coverage = 25%
→ Status: `needs_review` (conflicting constraints)

## Adding a New Overlay

1. Add entry to `config/overlays.json`:
   ```json
   {
     "id": "NEW_OVERLAY",
     "name": "New Overlay Name",
     "applies_to": ["front_setback"],
     "op": "min",
     "value": 30,
     "unit": "ft",
     "citations": [
       {
         "code_id": "austin_ldc_2024",
         "section": "25-2-XXX",
         "anchor": "(A)"
       }
     ]
   }
   ```

2. Validate: `node scripts/answers/validate-overlays.mjs`
3. Add golden test fixture if needed
4. Update documentation

## Adding a New Exception

1. Add predicate function to `conditions.ts`:
   ```typescript
   export function isNewException(context: LotContext): boolean {
     return context.newCondition === true
   }
   ```

2. Add to `evaluatePredicate` switch
3. Add entry to `config/exceptions.json`
4. Validate and test

## Golden Fixtures

Golden fixtures in `goldens/` provide test cases:

- `overlay_hd.json`: Historic District overlay
- `exception_corner.json`: Corner lot exception
- `overlay_exception_conflict.json`: Conflict case

## UI Integration

- **Badges**: Show provenance (Overridden > Overlay > Exception)
- **ConflictNotice**: Accessible summary of conflicts
- **Citations**: All sources cited with links

## Testing

- Unit tests: `tests/unit/overlays.spec.ts`, `exceptions.spec.ts`, `conflicts.spec.ts`
- E2E tests: `tests/e2e/answers-overlays.spec.ts`
- Validation: `scripts/answers/validate-overlays.mjs`

## Related

- `NEEDS_REVIEW_GUIDE.md` - When and how to escalate conflicts
- `ANSWERS_REVIEW.md` - Feedback and override workflow
- `CI_QUALITY_GATES.md` - Quality gate criteria
