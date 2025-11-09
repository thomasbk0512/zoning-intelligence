# Citation Manifest System

## Overview

The citation manifest system provides versioning and integrity checking for code citations. Each jurisdiction has a manifest file that tracks code versions, publication dates, and anchors.

## Manifest Structure

Each jurisdiction has a `manifest.{jurisdiction_id}.json` file:

```json
{
  "jurisdiction_id": "austin",
  "version": "2025.01",
  "published_at": "2025-01-15",
  "sources": [
    {
      "code_id": "austin_ldc_2024",
      "name": "Austin Land Development Code",
      "url": "https://library.municode.com/tx/austin/codes/land_development_code",
      "sections": ["25-2-490", "25-2-491", "25-2-492"]
    }
  ],
  "hash": "a1b2c3d4..."
}
```

## Anchors Structure

Each jurisdiction has an `anchors.{jurisdiction_id}.json` file:

```json
{
  "code_id": "austin_ldc_2024",
  "anchors": [
    {
      "section": "25-2-492",
      "anchor": "(A)",
      "snippet_hash": "sha256_hash_here",
      "snippet": "Minimum lot size: 5,750 square feet"
    }
  ]
}
```

## Workflow

### Updating a Manifest

1. **Bump version**: Update `version` field (YYYY.MM format)
2. **Update published_at**: Set to current date
3. **Update sources**: Add/remove/modify source entries
4. **Regenerate anchors**: Update anchor files with new snippet hashes
5. **Update hash**: Compute SHA256 of anchors file and update manifest hash

### Adding New Citations

1. Add anchor entry to `anchors.{jurisdiction_id}.json`
2. Compute snippet_hash (SHA256 of snippet text)
3. Update manifest hash
4. Update version if this is a new code release

### Detecting Stale Citations

The system compares snippet hashes to detect when code has changed:

- If a citation's snippet_hash doesn't match the anchor file, it's marked as `stale: true`
- UI shows `VersionNotice` when stale citations are detected
- Diagnostics panel lists all stale anchors

## Validation

Run validation scripts:

```bash
# Validate manifests
node scripts/citations/validate-manifest.mjs

# Validate anchors and check hashes
node scripts/citations/validate-anchors.mjs
```

## Related

- `STALE_ANCHORS_PLAYBOOK.md` - How to handle stale citations
- `JURISDICTIONS_README.md` - Adding new jurisdictions

