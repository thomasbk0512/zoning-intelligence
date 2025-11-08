# Release Hardening Guide

## Overview

This guide covers hardening steps for production releases, including signed tags, CI verification, SBOM generation, and rollback procedures.

---

## 1. Signed Tags

### Setup GPG Key (one-time)

```bash
# Generate GPG key (if needed)
gpg --full-generate-key

# List keys
gpg --list-secret-keys --keyid-format LONG

# Configure git to use key
git config user.signingkey <KEY_ID>
git config commit.gpgsign true  # Optional: sign all commits
```

### Create Signed Tag

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

---

## 2. CI on Tag Push

CI automatically runs on tag pushes matching `v*` pattern.

**Configuration**: `.github/workflows/ci.yml`

```yaml
on:
  push:
    tags: ['v*']
```

**Verification**: Check GitHub Actions after tag push.

---

## 3. SBOM / Checksums

### Generate Checksums

```bash
# Verify archive
./scripts/archive_docs.sh --verify

# Generate checksums
./scripts/generate_checksums.sh v1.0.1

# Upload to release
gh release upload v1.0.1-dev docs/v1.0.1/CHECKSUMS.txt
```

### Manual Checksum Generation

```bash
# Generate checksums for specific files
shasum -a 256 out.json > docs/v1.0.1/CHECKSUMS.txt
shasum -a 256 docs/v1.0.1/MANIFEST.txt >> docs/v1.0.1/CHECKSUMS.txt
```

---

## 4. Post-Release Smoke Test

Run smoke test in clean environment:

```bash
# Automated script
./scripts/post_release_smoke_test.sh

# Or manual
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-lock.txt
python3 zoning.py --apn 0204050712 --city austin --out out.json
jq -e '.apn and .zone and .jurisdiction' out.json >/dev/null
```

---

## 5. Rollback Plan

If issues occur after release:

```bash
# 1. Delete remote tag
git push origin :refs/tags/v1.0.1-dev

# 2. Restore from backup
./scripts/rollback_integration.sh

# 3. Verify restoration
make test
```

---

## 6. GitHub Token Scopes

For GitHub CLI operations, minimal required scopes:

- `repo` (full access) OR
- `public_repo` (for public repositories)

**Add workflow scope only if needed** for CI/CD operations.

---

## Complete Hardened Release Sequence

```bash
# 1. Sign tag
git tag -d v1.0.1-dev || true
git tag -s v1.0.1-dev -m "v1.0.1-dev: ..."
git tag -v v1.0.1-dev
git push origin v1.0.1-dev

# 2. Verify CI runs (check GitHub Actions)

# 3. Generate checksums
./scripts/archive_docs.sh --verify
./scripts/generate_checksums.sh v1.0.1

# 4. Create GitHub release
gh release create v1.0.1-dev \
  -F RELEASE_v1.0.1-dev.md \
  -t "v1.0.1-dev" \
  --notes-file docs/v1.0.1/RELEASE_NOTES.md

# 5. Upload artifacts
gh release upload v1.0.1-dev docs/v1.0.1/MANIFEST.txt
gh release upload v1.0.1-dev docs/v1.0.1/CHECKSUMS.txt

# 6. Post-release smoke test
./scripts/post_release_smoke_test.sh
```

---

## Ready Gate Checklist

Before proceeding to UI/publication:

- [ ] Signed tag pushed
- [ ] CI green (all checks pass)
- [ ] SBOM/checksums generated and uploaded
- [ ] Post-release smoke test passed
- [ ] Documentation updated
- [ ] Rollback plan tested

---

**Status**: Hardening procedures documented and ready
