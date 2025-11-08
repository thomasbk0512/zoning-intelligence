# Execute Release Commands

**Version**: ui-v1.0.1  
**Date**: 2024-11-08  
**Status**: Ready to Execute

---

## Step 0: Authenticate (Interactive)

```bash
gh auth login
# Choose: GitHub.com → HTTPS → Authenticate via browser

gh auth status   # expect: Logged in to github.com as <you>
```

---

## Step 1: Execute Release

Replace `<repo-url>` with your actual repository URL:

```bash
./EXECUTE_WITH_URL.sh <repo-url>
```

### Examples:

**HTTPS:**
```bash
./EXECUTE_WITH_URL.sh https://github.com/username/zoning-intelligence.git
```

**SSH:**
```bash
./EXECUTE_WITH_URL.sh git@github.com:username/zoning-intelligence.git
```

---

## Post-Execution Checks

### CI and Release Visibility
```bash
# Check PR status
gh pr checks --watch

# View release
gh release view ui-v1.0.1

# Verify tag on remote
git ls-remote --tags origin | grep ui-v1.0.1
```

### Manual Integration Validation (5 cases)
1. **APN success** → 11 fields render
2. **Lat/Lng success** → 11 fields render
3. **500 error** → error UI + Retry recovers
4. **Timeout** → skeletons then results
5. **Invalid input** → ARIA feedback works

### Lighthouse Audit (≥90 all categories)
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

---

## Optional: Signed Tags

If your org requires signed tags, configure before running:

```bash
# List GPG keys
gpg --list-secret-keys

# Configure signing key
git config user.signingkey <YOUR_GPG_KEY_ID>

# Edit script to use signed tags:
# Replace: git tag "${REL_TAG}"
# With: git tag -s "${REL_TAG}" -m "UI v1.0.1"
```

---

## Done When

- [ ] PR merged ✅
- [ ] ui-v1.0.1 tag live ✅
- [ ] CI green ✅
- [ ] 5/5 integration ✅
- [ ] Lighthouse ≥90 ✅

---

## Ready to Execute

**Status**: ✅ Ready

**Next Action**: 
1. Authenticate: `gh auth login` (interactive)
2. Provide `<repo-url>`
3. Execute: `./EXECUTE_WITH_URL.sh <repo-url>`

---

**Last Updated**: 2024-11-08

