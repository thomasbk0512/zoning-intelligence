# Final Release Steps for v1.0.1-dev

**Status**: ✅ Release setup complete - Ready for remote push

---

## Hardening Steps

### 1. Sign Tag (Recommended)

For production releases, use signed tags:

```bash
# Delete existing unsigned tag (if exists)
git tag -d v1.0.1-dev || true

# Create signed tag
git tag -s v1.0.1-dev -m "v1.0.1-dev: Real Austin data integration

- Enhanced data loader with field mapping and CRS handling
- Geometry validation and fixing applied
- Fallback zone handling for incomplete coverage
- Integration workflow verified and ready
- All tests passing (36/36)
- Runtime verified (<60s per parcel)
- Documentation archived in docs/v1.0.1/"

# Verify signature
git tag -v v1.0.1-dev

# Push signed tag
git push origin v1.0.1-dev
```

**Note**: Requires GPG key configured. See `git config user.signingkey`.

### 2. CI on Tag Push

CI automatically runs on tag pushes (v*). Verify in `.github/workflows/ci.yml`:

```yaml
on:
  push:
    tags: ['v*']
```

### 3. SBOM / Checksums

Generate checksums for release artifacts:

```bash
# Verify archive
./scripts/archive_docs.sh --verify

# Generate checksums
shasum -a 256 out.json > docs/v1.0.1/CHECKSUMS.txt
shasum -a 256 docs/v1.0.1/MANIFEST.txt >> docs/v1.0.1/CHECKSUMS.txt

# Upload checksums to release
gh release upload v1.0.1-dev docs/v1.0.1/CHECKSUMS.txt
```

### 4. Post-Release Smoke Test

Verify release works in clean environment:

```bash
# Create clean environment
python3 -m venv .venv && source .venv/bin/activate

# Install dependencies
pip install -r requirements-lock.txt

# Run smoke test
python3 zoning.py --apn 0204050712 --city austin --out out.json

# Verify output
jq -e '.apn and .zone and .jurisdiction' out.json >/dev/null
```

### 5. Rollback Plan

If issues occur:

```bash
# Delete remote tag
git push origin :refs/tags/v1.0.1-dev

# Restore from backup
./scripts/rollback_integration.sh
```

---

## Required: Push Tag

When remote repository is available:

```bash
# 1. Add remote (if not already set)
git remote add origin <repo-url>

# 2. Push tag
git push origin v1.0.1-dev

# 3. Verify push
git ls-remote --tags origin | grep v1.0.1-dev
```

---

## Optional: GitHub Release Page

If using GitHub and `gh` CLI is installed:

```bash
# Create release page with notes
gh release create v1.0.1-dev \
  -F RELEASE_v1.0.1-dev.md \
  -t "v1.0.1-dev" \
  --notes-file docs/v1.0.1/RELEASE_NOTES.md
```

This will:
- Create a GitHub release page
- Use `RELEASE_v1.0.1-dev.md` as the release description
- Set title to "v1.0.1-dev"
- Include release notes from archive

---

## Optional: Attach Artifacts

To attach documentation and artifacts to the release:

```bash
# Upload manifest and example output
gh release upload v1.0.1-dev \
  docs/v1.0.1/MANIFEST.txt \
  out.json

# Or upload entire documentation archive
gh release upload v1.0.1-dev docs/v1.0.1/*
```

---

## Complete Release Sequence

```bash
# 1. Push tag (required)
git remote add origin <repo-url>  # if not set
git push origin v1.0.1-dev
git ls-remote --tags origin | grep v1.0.1-dev

# 2. Create GitHub release (optional)
gh release create v1.0.1-dev \
  -F RELEASE_v1.0.1-dev.md \
  -t "v1.0.1-dev" \
  --notes-file docs/v1.0.1/RELEASE_NOTES.md

# 3. Upload artifacts (optional)
gh release upload v1.0.1-dev docs/v1.0.1/MANIFEST.txt
```

---

## Verification

After pushing:

```bash
# Verify tag on remote
git ls-remote --tags origin | grep v1.0.1-dev

# Verify GitHub release (if created)
gh release view v1.0.1-dev
```

---

**Status**: ✅ Ready for remote push and optional GitHub release

**Note**: Tag push makes release visible immediately. GitHub release page is optional but recommended for better visibility.
