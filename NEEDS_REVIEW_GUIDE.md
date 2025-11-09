# Needs Review Guide

## When Answers Escalate to Needs Review

Answers are marked `needs_review` when:

1. **Conflicting constraints**: Multiple sources (overlay, exception, override) produce incompatible values
2. **Missing data**: Required lot context unavailable (e.g., slope, frontage)
3. **Unresolved precedence**: Edge cases where precedence chain doesn't resolve cleanly

## Conflict Detection

The system detects conflicts when:

- Two or more sources produce different values for the same intent
- Values have the same unit (comparable)
- No single source has clear precedence

### Example

```
Overlay (NP): max lot_coverage = 35%
Exception (steep_slope): max lot_coverage = 25%
→ Conflict: Cannot satisfy both constraints
→ Status: needs_review
```

## UI Presentation

### ConflictNotice Component

When `status === 'needs_review'`, the UI displays:

- **Warning icon** (⚠️)
- **Title**: "Review Required: [Intent]"
- **Explanation**: "Conflicting values from multiple sources"
- **Source list**: Each conflicting source with:
  - Type (Overlay, Exception, Override, Rule)
  - Value and unit
  - Citation links
- **Action**: "View Code" buttons for each source

### AnswerCard Badge

- **"Needs Review"** badge (yellow)
- Replaces other badges when conflict detected

## User Guidance

### What Users Should Do

1. **Review all cited sources** - Click "View Code" for each conflicting source
2. **Consult jurisdiction** - Contact local planning department for official determination
3. **Provide feedback** - Use "Was this correct?" to report resolution

### Copy Patterns

**Conflict Message**:
> "Conflicting values from multiple sources. Please review the cited code sections."

**Footer**:
> "Consult your jurisdiction for official requirements. This answer requires manual review."

## Product Stance

### When to Escalate

- **Always escalate conflicts** - Never guess; provide evidence
- **Preserve citations** - All sources must be cited
- **Be transparent** - Show users exactly what conflicted

### When NOT to Escalate

- **Compatible constraints** - If max(35%) and min(25%) both satisfied, use most restrictive
- **Clear precedence** - If override exists, use it (no conflict)
- **Missing optional data** - If frontage unknown but not required, proceed

## Resolution Workflow

1. **User reports** - Via feedback mechanism
2. **Maintainer reviews** - Check citations and precedence
3. **Override created** - If verified, add override to `overrides.json`
4. **Golden updated** - Regenerate test fixtures
5. **Conflict resolved** - Future queries use override

## Examples

### Example 1: Overlay vs Exception

```
Base rule: front_setback = 25 ft
Overlay (HD): min = 30 ft
Exception (corner_lot): replace = 20 ft

Resolution:
- Exception has higher precedence than overlay
- Final: 20 ft (exception)
- No conflict (precedence resolves)
```

### Example 2: Conflicting Constraints

```
Base rule: lot_coverage = 40%
Overlay (NP): max = 35%
Exception (steep_slope): max = 25%

Resolution:
- Both constraints are "max" (compatible)
- Use most restrictive: 25%
- No conflict
```

### Example 3: True Conflict

```
Base rule: front_setback = 25 ft
Overlay (HD): min = 30 ft
Exception (flag_lot): replace = 20 ft

Resolution:
- Exception (replace) conflicts with overlay (min)
- Cannot satisfy both
- Status: needs_review
- Show both sources with citations
```

## Related

- `OVERLAYS_README.md` - Overlay system documentation
- `ANSWERS_REVIEW.md` - Feedback workflow
- `OVERRIDES_GOVERNANCE.md` - Override approval process
