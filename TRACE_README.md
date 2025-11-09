# Answer Trace System

## Overview

The Answer Trace system provides deterministic, step-by-step explanations of how each Answer Card value was computed. Every trace shows the complete computation chain: base rule → overlays → exceptions → overrides, with mathematical expressions and citations at each step.

## Trace Structure

Each trace contains:

- **answer_id**: Unique identifier (e.g., `SF-3:front_setback`)
- **jurisdiction_id**: Jurisdiction (e.g., `austin`, `travis_etj`)
- **district**: Zoning district (e.g., `SF-3`)
- **intent**: Answer intent (one of the six intents)
- **units**: Unit of measurement (e.g., `ft`, `percent`, `sqft`)
- **steps**: Ordered array of computation steps
- **provenance**: Final influencer (`rule`, `overlay`, `exception`, `override`, or `conflict`)
- **final_value**: Final computed value (null if conflict)
- **conflict**: Boolean indicating if conflicts were detected

## Step Types

### Rule Step

The first step is always a rule step, providing the base value from the zoning code:

```json
{
  "type": "rule",
  "id": "rule.SF3.front",
  "expr": "25",
  "value": 25,
  "citations": [...]
}
```

### Overlay Step

Applied when a parcel is in an overlay district:

```json
{
  "type": "overlay",
  "id": "overlay.WQZ.min25",
  "op": "min",
  "expr": "max(prev, 25)",
  "value": 25,
  "citations": [...]
}
```

### Exception Step

Applied when lot conditions trigger an exception:

```json
{
  "type": "exception",
  "id": "exception.corner.add5",
  "op": "add",
  "expr": "prev + 5",
  "value": 30,
  "citations": [...]
}
```

### Override Step

Applied when a verified override exists:

```json
{
  "type": "override",
  "id": "override.parcel",
  "op": "replace",
  "expr": "28",
  "value": 28,
  "citations": [...]
}
```

## Expression Format

Expressions use `prev` to reference the previous step's value:

- **Rule**: `"25"` (literal value)
- **Overlay min**: `"max(prev, 25)"` (constraint: at least 25)
- **Overlay max**: `"min(prev, 35)"` (constraint: at most 35)
- **Exception add**: `"prev + 5"` (additive adjustment)
- **Override replace**: `"28"` (replacement value)

## Trace Building

Traces are built during answer resolution in `merge.ts`:

1. **Rule step**: Created from base district rule
2. **Overlay steps**: Added for each applicable overlay adjustment
3. **Exception steps**: Added for each triggered exception
4. **Override step**: Added if an override applies
5. **Final trace**: Built with all steps and provenance

## UI Integration

- **Explain button**: Appears on AnswerCard when trace is available
- **TraceModal**: Shows ordered steps with math expressions
- **Copy actions**: JSON and Markdown export
- **Code links**: Each citation links to CodeModal

## Validation

Traces are validated for:

- **Schema compliance**: AJV validation against `trace.schema.json`
- **Completeness**: First step must be rule; all steps have citations
- **Consistency**: `final_value` matches Answer Card (unless conflict)
- **Coverage**: All answered intents have traces

## Examples

### Simple Rule Trace

```
Step 1: Rule
  ID: rule.SF3.front
  Expression: 25
  Value: 25 ft
  Citations: Austin LDC 2024, Section 25-2-492 (B)(1)
```

### Rule + Overlay Trace

```
Step 1: Rule
  ID: rule.SF3.front
  Expression: 25
  Value: 25 ft

Step 2: Overlay
  ID: overlay.WQZ.min25
  Operation: min
  Expression: max(prev, 25)
  Value: 25 ft
  Citations: Austin LDC 2024, Section 25-2-492
```

### Rule + Exception Trace

```
Step 1: Rule
  ID: rule.SF3.front
  Expression: 25
  Value: 25 ft

Step 2: Exception
  ID: exception.corner.add5
  Operation: add
  Expression: prev + 5
  Value: 30 ft
  Citations: Austin LDC 2024, Section 25-2-492
```

## Related

- `OVERLAYS_README.md` - Overlay system
- `NEEDS_REVIEW_GUIDE.md` - Conflict resolution
- `CITATION_MANIFEST.md` - Code versioning

