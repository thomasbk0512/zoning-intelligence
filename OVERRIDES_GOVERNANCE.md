# Overrides Governance

## Approval Process

### Who Can Approve

- **Repository maintainers** (CODEOWNERS)
- **Domain experts** (zoning code specialists)
- **Verified contributors** (with prior override approvals)

### Approval Checklist

Before adding an override, verify:

- [ ] Citation is valid and accessible
- [ ] Rationale is clear and ≤160 characters
- [ ] Value and unit are correct
- [ ] Scope is appropriate (district vs parcel)
- [ ] Expiration date set if temporary
- [ ] No conflicts with existing overrides

### PR Requirements

When submitting an override:

1. **Title**: `Override: [district] [intent] - [brief reason]`
2. **Description**: Include:
   - Original rule value
   - Proposed override value
   - Citation (section + anchor)
   - Rationale
   - Link to feedback (if applicable)
3. **Review**: At least one maintainer approval required
4. **CI**: All quality gates must pass

## Override Schema

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
  "scope": "district",
  "expires": "2025-12-31"
}
```

### Required Fields

- `district`: Zone identifier (e.g., "SF-3")
- `intent`: One of the six supported intents
- `value`: Numeric value
- `unit`: Unit string (max 12 chars)
- `citation`: Code citation object
- `rationale`: Explanation (max 160 chars)

### Optional Fields

- `scope`: "district" (default) or "parcel"
- `apn`: Required when `scope="parcel"`
- `expires`: ISO date string (YYYY-MM-DD)

## Rollback Policy

### When to Rollback

- Override was incorrect
- Code has been updated (override no longer needed)
- Override has expired (automatic)
- Conflict with new rule

### Rollback Process

1. Remove override from `overrides.json`
2. Create PR with title: `Rollback: [district] [intent]`
3. Include reason in PR description
4. Get maintainer approval
5. Merge and verify CI passes

## Conflict Resolution

### Multiple Overrides

If multiple overrides match:
- Parcel-scoped wins over district-scoped
- Most recent (by Git history) wins for same scope

### Override vs Rule Update

If a rule is updated to match an override:
1. Remove the override
2. Update the rule in `rules.ts`
3. Regenerate golden fixtures

## Monitoring

### Metrics

- Override count (via Diagnostics panel)
- Override hash (for change detection)
- Feedback volume (via telemetry)

### Alerts

- Expired overrides (warned in CI)
- Schema validation failures (CI fails)
- Missing answers after override (CI fails)

## Security

- No secrets in overrides
- No PII in feedback
- All overrides are public (in Git)
- Validation happens in CI

## Related

- `ANSWERS_REVIEW.md` - Review workflow
- `engine/answers/overrides.schema.json` - Schema
- `.github/CODEOWNERS` - Approval authority

