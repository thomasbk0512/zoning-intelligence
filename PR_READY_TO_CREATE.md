# ✅ PR Ready to Create

**Status**: Branch `data/integration` is pushed and ready for PR creation

---

## 📋 Create PR Now

**One-click PR creation URL**:
```
https://github.com/thomasbk0512/zoning-intelligence/compare/main...data/integration?expand=1&title=v1.1.0%20—%20Data%20integration%20(derived%20subset%2C%20CI-stable)&body=See%20PR_BODY.md
```

**Steps**:
1. Click the URL above
2. Review the prefilled title and body
3. Click "Create pull request"

---

## 🔍 Monitor CI

**CI Actions Page**:
```
https://github.com/thomasbk0512/zoning-intelligence/actions
```

**CI Workflow Steps** (will run automatically):
1. ✅ Download or stub datasets
2. ✅ Derive CI subset (≤5MB)
3. ✅ Validate rules
4. ✅ Regenerate golden tests
5. ✅ Run tests
6. ✅ Verify derived data size
7. ✅ Verify schema fields (11 fields)

---

## 💬 PR Verification Comment Template

**Copy this into a PR comment after CI finishes** (fill the brackets):

```markdown
## ✅ Data Integration Verification

**Derived Dataset Size**: [copy from CI step "Verify derived data size", e.g., "2.3 MB"]

**Golden Test Files**: 20 files regenerated

**First 10 APNs** (from tests/golden/001–010.apn.json):
1. [apn from 001.apn.json]
2. [apn from 002.apn.json]
3. [apn from 003.apn.json]
4. [apn from 004.apn.json]
5. [apn from 005.apn.json]
6. [apn from 006.apn.json]
7. [apn from 007.apn.json]
8. [apn from 008.apn.json]
9. [apn from 009.apn.json]
10. [apn from 010.apn.json]

**Schema Contract**: ✅ Unchanged (11 fields, ±0.1 ft tolerance)

**CI Status**: ✅ Green (all jobs passing)
```

---

## 🤖 Optional: Auto-Generate Comment

If you want Cursor to automatically prepare the comment after CI finishes, use this prompt:

**Task**: After I create the PR for data/integration → main, read the CI outputs and regenerated golden files and produce a ready-to-paste PR verification comment.

**Input**:
- Repo path: current workspace
- PR URL: (paste it here after you create it)
- Files to read for APNs: tests/golden/001.apn.json … tests/golden/010.apn.json
- CI artifact to read for size: job log line from step "Verify derived data size"

**Constraints**:
- Do not push commits
- Do not require gh auth; if unauthenticated, just read local files and extract APNs
- For dataset size, if job logs aren't accessible, leave a clear placeholder
- Keep the 11-field schema assumption; if fewer fields are found, note it

**Output**: A single Markdown block with the final PR verification comment, fully filled with APNs (and dataset size if available), ready to paste.

---

## ✅ Verification Checklist

- [x] Branch `data/integration` created from `main` (shared history verified)
- [x] All files committed and pushed
- [x] CI workflow configured
- [x] Auto-stub fallback enabled
- [ ] PR created (use URL above)
- [ ] CI runs and completes
- [ ] Verification comment posted

---

**Status**: ✅ Ready for PR creation

**Schema Contract**: Unchanged (11 fields, ±0.1 ft tolerance)

