# Stale Anchors Playbook

## Overview

When code sources are updated, citations may become stale. This playbook outlines how to detect, triage, and update stale citations.

## Detection

### Automatic Detection

The system automatically detects stale citations by comparing snippet hashes:

1. **Runtime**: When citations are loaded, snippet hashes are compared
2. **CI**: `validate-anchors.mjs` checks hash integrity
3. **UI**: `VersionNotice` component alerts users to stale citations

### Manual Detection

1. Check Diagnostics panel for stale anchor count
2. Review manifest hash mismatches in CI logs
3. Compare snippet text with current code source

## Triage

### Severity Levels

- **Critical**: Core zoning rules changed (setbacks, height, coverage)
- **Moderate**: Clarifications or minor wording changes
- **Low**: Formatting or non-substantive changes

### Impact Assessment

1. **Check affected answers**: Which Answer Cards reference stale citations?
2. **Verify current code**: Does the snippet still match the code?
3. **Assess user impact**: Are users seeing incorrect information?

## Resolution

### Update Process

1. **Fetch current code**: Get latest version from official source
2. **Extract snippet**: Get exact text for the section/anchor
3. **Compute hash**: SHA256 of snippet text
4. **Update anchors file**: Replace snippet_hash in `anchors.{jurisdiction_id}.json`
5. **Update manifest**: Recompute hash and bump version
6. **Test**: Run validation scripts and E2E tests

### Example

```bash
# 1. Update anchor
# Edit anchors.austin.json, update snippet_hash for affected anchor

# 2. Recompute manifest hash
node -e "
const fs = require('fs');
const crypto = require('crypto');
const content = fs.readFileSync('ui/src/engine/citations/anchors.austin.json', 'utf-8');
const hash = crypto.createHash('sha256').update(content).digest('hex');
console.log(hash);
"

# 3. Update manifest.austin.json with new hash and version

# 4. Validate
node scripts/citations/validate-anchors.mjs
```

## Prevention

### Best Practices

1. **Version tracking**: Always bump version when updating anchors
2. **Hash verification**: Always validate hash matches in CI
3. **Regular audits**: Periodically check for code updates
4. **Automated checks**: CI should flag hash mismatches

### Monitoring

- Set up alerts for hash mismatches in CI
- Review stale anchor reports in Diagnostics
- Track version update frequency

## Related

- `CITATION_MANIFEST.md` - Manifest system overview
- `CI_QUALITY_GATES.md` - CI validation criteria

