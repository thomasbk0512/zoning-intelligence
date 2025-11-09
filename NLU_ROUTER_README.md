# NLU Router Guide

## Overview

The Natural Language Query (NLQ) Router provides a deterministic parser that maps natural language queries to Answer Card intents. It routes users directly to Results when confidence is high and a locator (APN or coordinates) is present.

## Features

- **Deterministic Parsing**: No external LLM calls; regex/keyword-based scoring
- **Privacy-Safe**: Never stores raw question text; only logs intent enums
- **Direct Routing**: Routes to Results when confidence ≥0.7 and locator present
- **Intent Suggestions**: Shows detected intents as chips while typing
- **Disambiguation**: Handles ambiguous queries with multiple intent options

## Pattern Configuration

Patterns are defined in `patterns.en.json`:

```json
{
  "intents": {
    "front_setback": {
      "keywords": ["front setback", "setback from street", ...],
      "hints": ["front", "street", "setback", ...]
    }
  },
  "locators": {
    "apn": ["apn", "parcel number", ...],
    "latlng": ["lat", "latitude", "lng", ...]
  }
}
```

### Adding Patterns

1. **Keywords**: Full phrases that match exactly (score: 1.0)
2. **Hints**: Individual words that contribute to scoring (score: 0.5)
3. **Locators**: Phrases that indicate APN or coordinate presence

### Best Practices

- **Synonyms**: Add common variations (e.g., "front yard" = "front setback")
- **Specificity**: Prefer specific keywords over generic hints
- **Testing**: Add examples to `examples.json` when adding patterns

## Confidence Scoring

- **Exact keyword match**: +1.0 per match
- **Hint match**: +0.5 per match
- **Normalized**: Score divided by max possible score
- **Threshold**: <0.7 requires confirmation

## Routing Logic

1. **High confidence (≥0.7) + locator present**: Route directly to Results
2. **High confidence + no locator**: Show Search form with pre-selected intent
3. **Low confidence (<0.7)**: Show ParsePreview for confirmation
4. **Ambiguous (tie scores)**: Show disambiguation with top 2 intents

## Telemetry

The router emits `intent_detected` events with:
- `intent`: Detected intent (enum)
- `confidence`: Confidence score (0-1)
- `mode`: Locator mode ('apn' | 'latlng' | 'none')

**Privacy**: Raw question text is never logged.

## Examples

### Direct Routing
- Query: "how tall can I build in SF-3 APN 0204050712"
- Result: Routes to Results with max_height Answer Card

### Needs Locator
- Query: "front setback"
- Result: Shows Search form with front_setback pre-selected

### Needs Confirmation
- Query: "setback" (ambiguous)
- Result: Shows ParsePreview with front/side/rear options

## Testing

### Unit Tests
- Tests against `examples.json` (36 examples)
- Validates intent, mode, params, confidence
- Target: ≥95% match rate

### E2E Tests
- Happy path: Query → Route → Answer Cards
- Verifies no console errors, no retries

## CI Validation

The `nlu-router` CI job:
1. Validates patterns against schema (AJV)
2. Checks for duplicate keywords/hints
3. Runs unit tests against examples
4. Runs E2E happy path tests

## Related

- `REPORTING_GUIDE.md` - Report sharing features
- `CITATION_MANIFEST.md` - Code versioning system

