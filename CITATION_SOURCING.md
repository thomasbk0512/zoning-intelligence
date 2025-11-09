# Citation Sourcing Guide

## Overview

Citations link answer cards to specific sections of zoning codes. Each jurisdiction has its own code sources, and citations must be accurate and stable.

## Code Structure

### Code IDs

Each jurisdiction defines `code_ids` in the registry:

```json
{
  "id": "austin",
  "code_ids": ["austin_ldc_2024"]
}
```

### Anchors

Anchors are defined in `engine/answers/citations.ts`:

```typescript
export const CODE_ANCHORS: Record<string, Record<string, string>> = {
  austin_ldc_2024: {
    '25-2-492': 'SF-3 district regulations',
    // ...
  },
  travis_etj_ord_2024: {
    '3.3.1': 'SF-3 district: yard setbacks',
    // ...
  },
}
```

## Citation Format

Citations in rules follow this structure:

```typescript
{
  code_id: 'austin_ldc_2024',
  section: '25-2-492',
  anchor: '(B)(1)',
  snippet: 'Front yard: 25 feet minimum',
}
```

- **code_id**: Must match a `code_id` in the jurisdiction registry
- **section**: Section number/identifier in the code
- **anchor**: Subsection anchor (optional)
- **snippet**: Human-readable excerpt (optional)

## Adding Citations

### Step 1: Define Anchor

Add to `CODE_ANCHORS` in `citations.ts`:

```typescript
new_code_2024: {
  'X.Y.Z': 'Description of what this section covers',
}
```

### Step 2: Reference in Rules

Use in rule definitions:

```typescript
citations: [
  {
    code_id: 'new_code_2024',
    section: 'X.Y.Z',
    anchor: '(A)',
    snippet: 'Relevant excerpt',
  },
]
```

### Step 3: Validate

Ensure:
- `code_id` exists in jurisdiction registry
- `section` has an anchor defined
- `anchor` format is consistent

## Anchor Stability

### Principles

- **Don't change anchors** - Once defined, keep them stable
- **Version codes** - Use year suffix (e.g., `_2024`)
- **Document changes** - If code updates, create new version

### Versioning

When codes are updated:

1. Create new `code_id` (e.g., `austin_ldc_2025`)
2. Add new anchors
3. Update jurisdiction registry
4. Migrate rules gradually

## Best Practices

### Section Format

- Use consistent format per jurisdiction
- Austin: `25-2-492` (chapter-section-subsection)
- ETJ: `3.3.1` (section.subsection.sub-subsection)

### Anchor Format

- Use parentheses: `(A)`, `(B)(1)`, `(C)(2)(a)`
- Be consistent within a code
- Match official code structure

### Snippets

- Keep concise (1-2 sentences)
- Include key numbers/values
- Use plain language

## Validation

The registry validator checks:

- All `code_ids` in registry are referenced
- No orphaned `code_ids` (not in registry)
- Citations reference valid `code_ids`

## Examples

### Austin LDC

```typescript
{
  code_id: 'austin_ldc_2024',
  section: '25-2-492',
  anchor: '(B)(1)',
  snippet: 'Front yard: 25 feet minimum',
}
```

### Travis ETJ

```typescript
{
  code_id: 'travis_etj_ord_2024',
  section: '3.3.1',
  anchor: '(A)',
  snippet: 'Front yard: 25 feet minimum',
}
```

## Related

- `JURISDICTIONS_README.md` - How to add jurisdictions
- `OVERLAYS_README.md` - Overlay system (uses citations)

