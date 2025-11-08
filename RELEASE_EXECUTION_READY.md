# Release Execution Ready

**Version**: ui-v1.0.1  
**Date**: 2024-11-08  
**Status**: ✅ READY TO EXECUTE

---

## Quick Start

### One-Shot Execution
```bash
./EXECUTE_REMOTE_RELEASE.sh <repo-url>
```

### Interactive Execution
```bash
./QUICK_EXECUTE.sh [repo-url]
# Prompts for URL if not provided
```

---

## Manual Execution Steps

### Step 0: Check Remote
```bash
git remote -v || true
```

### Step 1: Configure Remote
```bash
# Remove existing remote if needed
git remote remove origin 2>/dev/null || true

# Add new remote
git remote add origin <repo-url>
git remote -v
```

### Step 2: Push Tags and Branch
```bash
# Push all tags
git push origin --tags

# Push branch with upstream
git push -u origin ui/v1.0.1
```

### Step 3: Create PR and Watch CI
```bash
# Check GitHub auth
gh auth status

# Create PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -b "$(cat ui/RELEASE_NOTES_v1.0.1.md)"

# Watch CI
gh pr checks --watch
```

### Step 4: Merge & Tag (After CI Passes)
```bash
# Merge PR
gh pr merge ui/v1.0.1 --squash

# Switch to main and pull
git checkout main
git pull origin main

# Tag release
git tag ui-v1.0.1 -m "UI v1.0.1: UX Polish Milestone Complete"

# Push tag
git push origin ui-v1.0.1
```

### Step 5: Create GitHub Release
```bash
gh release create ui-v1.0.1 \
  -t "UI v1.0.1" \
  -F ui/RELEASE_NOTES_v1.0.1.md
```

---

## Post-Merge Validation

### Integration Tests (5 cases)
1. **APN Success** → 11 fields render
2. **Lat/Lng Success** → 11 fields render
3. **500 Error** → Retry recovers
4. **Timeout** → Skeletons then results
5. **Invalid Input** → ARIA feedback

### Lighthouse Audit
```bash
cd ui
npm run build
npm run preview
# In another terminal:
npx lighthouse http://localhost:4173 \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=html \
  --output-path=./lighthouse-report.html
```

**Target**: ≥90 in all categories

---

## Troubleshooting

### PR Blocked on Out-of-Date Branch
```bash
gh pr status
git fetch origin main
git rebase origin/main ui/v1.0.1
git push -f origin ui/v1.0.1
```

### Tag Push Denied (Protect Rules)
```bash
git fetch --tags origin
git push origin refs/tags/ui-v1.0.1:refs/tags/ui-v1.0.1
```

### Signed Tags (Optional)
```bash
git config user.signingkey <YOUR_GPG_KEY>
git tag -s ui-v1.0.1 -m "UI v1.0.1"
git push origin ui-v1.0.1
```

### CI Fails
```bash
# View CI logs
gh pr checks

# Re-run failed job
gh run rerun <run-id>
```

---

## Ready Gate Checklist

- [x] Local verification complete
- [x] Build passing
- [x] Tests passing
- [x] Schema contract maintained
- [x] Release notes prepared
- [x] Scripts ready
- [ ] Repository URL provided
- [ ] Remote configured
- [ ] Tags pushed
- [ ] Branch pushed
- [ ] PR created
- [ ] CI passing
- [ ] PR merged
- [ ] Tag created and pushed
- [ ] Release published
- [ ] Integration tests pass
- [ ] Lighthouse ≥90

---

## Execution Status

**Current Status**: Ready for execution

**Next Action**: Provide repository URL and execute:
```bash
./EXECUTE_REMOTE_RELEASE.sh <repo-url>
```

---

**Last Updated**: 2024-11-08

