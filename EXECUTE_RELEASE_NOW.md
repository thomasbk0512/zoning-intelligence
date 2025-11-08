# Execute Release Now

**Version**: ui-v1.0.1  
**Date**: 2024-11-08  
**Status**: Ready to Execute

---

## Prerequisites

- [x] GitHub CLI installed
- [ ] GitHub CLI authenticated
- [ ] Repository URL provided

---

## Step 0: Authenticate (Interactive)

```bash
gh auth login
# Choose: GitHub.com → HTTPS → Authenticate via browser

gh auth status   # ensure logged in
```

**Expected output:**
```
Logged in to github.com as <username>
```

---

## Step 1: Execute Release

```bash
./EXECUTE_WITH_URL.sh <repo-url>
```

**Example:**
```bash
./EXECUTE_WITH_URL.sh https://github.com/username/zoning-intelligence.git
# OR
./EXECUTE_WITH_URL.sh git@github.com:username/zoning-intelligence.git
```

**What the script does:**
1. Configures remote (remove/add origin)
2. Dry-run push (safety check)
3. Pushes tags (v1.0.0, v1.0.1-dev, ui-v1.0.0)
4. Pushes branch (ui/v1.0.1)
5. Creates PR with release notes
6. Watches CI until green
7. Merges PR (when CI passes)
8. Tags release (ui-v1.0.1)
9. Pushes tag
10. Creates GitHub release

---

## Post-Execution Checks

### Automated Checks
```bash
# Check PR status
gh pr checks --watch

# View release
gh release view ui-v1.0.1

# Verify tag on remote
git ls-remote --tags origin | grep ui-v1.0.1
```

### Manual Validation

#### Integration Tests (5 cases)
1. **APN success** → 11 fields render
2. **Lat/Lng success** → 11 fields render
3. **500 error** → Retry recovers
4. **Timeout** → Skeletons → Results
5. **Invalid input** → ARIA feedback works

#### Lighthouse Audit
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

### If gh not authenticated
```bash
gh auth login    # GitHub.com → HTTPS → browser auth
gh auth status   # Verify
```

### If push denied
- Check branch protection rules
- Verify repository permissions
- Check if tags are protected

### If PR blocked
- Fix CI failures
- Re-run checks: `gh pr checks --rerun`
- Resolve required approvals

### If tag push denied
```bash
git fetch --tags origin
git push origin refs/tags/ui-v1.0.1:refs/tags/ui-v1.0.1
```

---

## Verification Checklist

After execution, verify:
- [ ] Remote configured
- [ ] Tags pushed to remote
- [ ] Branch pushed to remote
- [ ] PR created
- [ ] CI checks passing (all green)
- [ ] PR merged successfully
- [ ] Tag created and pushed
- [ ] Release published on GitHub
- [ ] 5/5 integration tests pass
- [ ] Lighthouse ≥90 (all categories)
- [ ] 11-field schema intact

---

## Ready to Execute

**Status**: ✅ Ready

**Next Action**: 
1. Authenticate: `gh auth login` (interactive)
2. Provide `<repo-url>`
3. Execute: `./EXECUTE_WITH_URL.sh <repo-url>`

---

**Last Updated**: 2024-11-08

