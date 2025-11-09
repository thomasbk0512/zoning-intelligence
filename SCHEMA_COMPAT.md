# Schema Compatibility Guide

This document defines change control rules for the frozen UI schema (11-field contract).

## Schema Lock

The UI schema is frozen in `SCHEMA_LOCK.json` with a SHA256 hash for verification.

**Current Version**: 1.0.0  
**Lock Hash**: See `SCHEMA_LOCK.json`

## Change Control Rules

### v1.x (Current)

**Allowed Changes** (additive only):
- ✅ Adding new **optional** fields
- ✅ Adding new properties to existing objects (optional)
- ✅ Extending enum values
- ✅ Relaxing validation constraints (e.g., increasing tolerance)

**Prohibited Changes**:
- ❌ Removing fields
- ❌ Renaming fields
- ❌ Changing field types
- ❌ Making required fields optional
- ❌ Changing units or tolerance for distance/height fields
- ❌ Breaking changes to existing field structures

### v2.0+ (Future)

Major version bumps allow breaking changes:
- Field renames
- Type changes
- Structural changes
- Removal of deprecated fields

## Verification

### Freeze Schema

```bash
npm run schema:freeze
```

Generates `SCHEMA_LOCK.json` with current schema and hash.

### Verify Schema

```bash
npm run schema:verify
```

Verifies current schema matches lock file. Fails if drift detected.

## CI Integration

Schema verification runs automatically in CI:
- `verify-ui.mjs` runs in quality-gates job
- Fails CI if schema drift detected
- Prevents accidental breaking changes

## Migration Path

If schema changes are needed:

1. **For v1.x**: Add new optional fields only
2. **For v2.0**: Create new lock file with major version bump
3. **Update UI**: Ensure backward compatibility during transition
4. **Update Backend**: Coordinate schema changes with backend team
5. **Update Tests**: Update golden tests and E2E tests
6. **Update Docs**: Document changes in release notes

## Examples

### ✅ Allowed (v1.x)

```typescript
// Adding optional field
{
  ...existingFields,
  new_optional_field?: string  // OK
}

// Extending enum
type Zone = 'SF-3' | 'SF-2' | 'SF-1' | 'NEW-ZONE'  // OK
```

### ❌ Prohibited (v1.x)

```typescript
// Renaming field
{
  apn_number: string  // ❌ Was 'apn'
}

// Changing type
{
  height_ft: string  // ❌ Was number
}

// Removing field
{
  // run_ms removed  // ❌
}
```

## Related

- `SCHEMA_LOCK.json` - Frozen schema definition
- `scripts/schema/freeze-ui.mjs` - Freeze script
- `scripts/schema/verify-ui.mjs` - Verification script

