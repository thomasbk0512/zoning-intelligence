# Zoning Answers

Authoritative answers to common zoning questions with inline code citations.

## Overview

The Answers feature provides quick, authoritative answers to the most common zoning questions, with direct citations to the relevant code sections. This helps users quickly understand key zoning requirements without having to parse through full code documents.

## Supported Intents (v1.6.0)

1. **front_setback** - Minimum front yard setback
2. **side_setback** - Minimum interior side yard setback
3. **rear_setback** - Minimum rear yard setback
4. **max_height** - Maximum building height
5. **lot_coverage** - Maximum lot coverage percentage
6. **min_lot_size** - Minimum lot size

## Coverage

### Austin, TX

**Supported Zones:**
- SF-1 (Single Family Residential - Large Lot)
- SF-2 (Single Family Residential - Small Lot)
- SF-3 (Single Family Residential - Standard Lot)

**Status:**
- ✅ All 6 intents answered for SF-1, SF-2, SF-3
- ✅ Code citations included for all answers
- ⚠️ Other zones return `needs_review` status

## How It Works

### Rules Engine

The rules engine (`engine/answers/rules.ts`) maps `{zone, intent}` pairs to authoritative answers:

```typescript
const answer = getAnswerForIntent('SF-3', 'front_setback')
// Returns: { status: 'answered', value: 25, unit: 'ft', citations: [...] }
```

### Citations

Each answer includes one or more code citations with:
- **code_id**: Identifier for the code (e.g., `austin_ldc_2024`)
- **section**: Code section number (e.g., `25-2-492`)
- **anchor**: Subsection anchor (e.g., `(B)(1)`)
- **snippet**: Relevant code snippet

### Stub Mode (CI)

In CI and testing, answers are loaded from golden fixtures (`engine/answers/goldens/*.json`) to ensure deterministic results without network calls.

## Usage

### In UI

Answers are automatically displayed on the Results page when:
- A property is found
- The zone is supported
- Answers are enabled (`ANSWERS_ENABLE=true`)

### Programmatic

```typescript
import { getAnswers } from './lib/answers'

const response = await getAnswers({
  apn: '0204050712',
  city: 'austin',
  zone: 'SF-3',
})

console.log(response.answers) // Array of ZoningAnswer objects
```

## Configuration

### Environment Variables

- **`VITE_ANSWERS_ENABLE`**: Enable/disable answers feature (default: `true`)
- **`VITE_ANSWERS_STUB`**: Use stub mode (load from fixtures) (default: `false`, `true` in CI)

### Stub Mode

When `ANSWERS_STUB=1`, answers are loaded from golden fixtures instead of the rules engine. This ensures:
- Deterministic CI runs
- No network dependencies
- Fast test execution

## Testing

### Unit Tests

```bash
npm test -- tests/unit/answers.spec.ts
```

Tests verify:
- All intents return answers for supported zones
- Citations are present for all answers
- Values and units are correct
- Unknown zones return `needs_review` status

### E2E Tests

```bash
npm run test:e2e -- tests/e2e/answers.spec.ts
```

Tests verify:
- Answer cards render on Results page
- Code modal opens and closes correctly
- Telemetry events are tracked

## Extending

### Adding a New Intent

1. Add intent to `ZoningIntent` type in `rules.ts`
2. Add rule mapping in `getAustinRules()`
3. Update `intentLabels` in `AnswerCard.jsx`
4. Add golden fixture entry
5. Update unit tests

### Adding a New Zone

1. Add zone rules in `getAustinRules()`
2. Create golden fixture: `goldens/{zone}.json`
3. Update unit tests
4. Update coverage table in this README

### Adding a New Jurisdiction

1. Create new rules function (e.g., `getDallasRules()`)
2. Update `getAnswerForIntent()` to route by jurisdiction
3. Add jurisdiction-specific citations
4. Create golden fixtures

## Known Limitations

- **Austin-only**: Currently only supports Austin, TX zones
- **Limited zones**: Only SF-1, SF-2, SF-3 fully supported
- **Static rules**: Rules are hardcoded (not dynamically parsed from PDFs)
- **No overlays**: Overlay districts are not yet considered

## Future Enhancements

- Support for more zones (MF, CS, etc.)
- Support for overlay districts
- Dynamic rule parsing from PDFs
- Multi-jurisdiction support
- User-contributed rule corrections

## Related

- `DISCLAIMER.md` - Legal disclaimer
- `engine/answers/rules.ts` - Rules engine implementation
- `ui/src/components/AnswerCard.jsx` - UI component

