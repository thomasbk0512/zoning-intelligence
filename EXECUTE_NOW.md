# Execute Release Now

**Version**: ui-v1.0.1  
**Date**: 2024-11-08  
**Status**: ✅ READY TO EXECUTE

---

## Quick Execution

### Option 1: Automated Script (Recommended)
```bash
./EXECUTE_RELEASE.sh <repo-url>
```

### Option 2: Manual Steps
```bash
# 1. Connect remote
git remote add origin <repo-url>
# OR if remote exists:
git remote set-url origin <repo-url>

# 2. Push tags and branch
git push origin --tags
git push origin ui/v1.0.1

# 3. Create PR
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -b "$(cat ui/RELEASE_NOTES_v1.0.1.md)"

# 4. Monitor CI
gh pr checks --watch

# 5. After CI passes, merge and tag
gh pr merge ui/v1.0.1 --squash
git checkout main
git pull origin main
git tag ui-v1.0.1 -m "UI v1.0.1: UX Polish Milestone Complete"
git push origin ui-v1.0.1

# 6. Create release
gh release create ui-v1.0.1 \
  -t "UI v1.0.1" \
  -F ui/RELEASE_NOTES_v1.0.1.md
```

---

## Pre-Execution Checklist

- [x] Build verified: `npm run build` ✅
- [x] Tests passing: `npm run test` ✅
- [x] Schema contract maintained (11 fields) ✅
- [x] Release notes prepared ✅
- [x] Scripts ready ✅
- [x] Documentation complete ✅
- [ ] Repository URL available ⏳

---

## Post-Execution Validation

### Integration Tests (5 cases)
1. [ ] APN success → 11 fields render
2. [ ] Lat/Lng success → 11 fields render
3. [ ] Force 500 → error UI + Retry recovers
4. [ ] Timeout → skeletons then results
5. [ ] Invalid input → blocked with ARIA feedback

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

## Ready Gate

**Execute when**:
- [x] Local verification complete ✅
- [x] All artifacts ready ✅
- [ ] Repository URL available ⏳

**After execution, verify**:
- [ ] Tags visible on remote
- [ ] PR created and CI green
- [ ] 5/5 integration cases pass
- [ ] Lighthouse ≥90 (all categories)
- [ ] 11-field schema unchanged
- [ ] ui-v1.0.1 tag pushed
- [ ] Release published

---

## Rollback Plan

If issues are found:

```bash
# Delete tag
git push origin :refs/tags/ui-v1.0.1

# Delete release
gh release delete ui-v1.0.1 --yes

# Revert merge (if needed)
gh pr revert <merge-sha> --title "Revert UI v1.0.1" --body "Rollback due to CI/e2e failure"
```

---

## Next Steps

1. **Provide repository URL**
2. **Execute release script**: `./EXECUTE_RELEASE.sh <repo-url>`
3. **Monitor CI**: `gh pr checks --watch`
4. **Run integration tests** (5 cases)
5. **Run Lighthouse audit** (target ≥90)
6. **Merge PR** (after CI passes)
7. **Tag and publish release**
8. **E2E regression testing**

---

**Status**: ✅ READY TO EXECUTE (Pending Repository URL)

**Last Updated**: 2024-11-08

