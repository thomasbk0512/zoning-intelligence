#!/usr/bin/env bash
# EXECUTE_WITH_URL.sh — remote release for ui-v1.0.1

set -euo pipefail

REPO_URL="${1:-}"
BRANCH="ui/v1.0.1"
REL_TAG="ui-v1.0.1"
PR_TITLE="UI v1.0.1: UX+Perf+A11y"
REL_NOTES="ui/RELEASE_NOTES_v1.0.1.md"

if [[ -z "${REPO_URL}" ]]; then
  echo "Usage: $0 <repo-url>"; exit 64
fi

# 0) Sanity
git status -s
git rev-parse --abbrev-ref HEAD | grep -qx "${BRANCH}" || {
  echo "Error: current branch is not ${BRANCH}"; exit 65; }

command -v gh >/dev/null || { echo "Install GitHub CLI (gh)."; exit 67; }
gh auth status || { echo "Run: gh auth login"; exit 68; }

# 1) Configure remote (replace if exists)
git remote remove origin >/dev/null 2>&1 || true
git remote add origin "${REPO_URL}"
git remote -v

# 2) Dry-run, then push tags and branch
git push --dry-run origin --tags
git push --dry-run -u origin "${BRANCH}"

git push origin --tags
git push -u origin "${BRANCH}"

# 3) Open PR and watch CI
PR_BODY="$(cat "${REL_NOTES}")"
gh pr create -B main -H "${BRANCH}" -t "${PR_TITLE}" -b "${PR_BODY}"

echo "Watching CI… (Ctrl+C to stop, PR will continue running)"
gh pr checks --watch || true

# 4) Merge when CI passes
echo "Attempting merge (requires green checks / permissions)…"
gh pr merge --squash || {
  echo "Merge blocked. Resolve checks or approvals, then rerun this step:"
  echo "  gh pr merge --squash"
  exit 0
}

# 5) Tag release and push
if git tag -l | grep -qx "${REL_TAG}"; then
  echo "Tag ${REL_TAG} already exists locally."
else
  git tag "${REL_TAG}"
fi
git push origin "${REL_TAG}"

# 6) Publish GitHub release
gh release create "${REL_TAG}" -t "UI v1.0.1" -F "${REL_NOTES}"

# 7) Post-merge reminders
cat <<'DONE'

Next steps:
- Run 5 integration cases (APN, Lat/Lng, 500+Retry, timeout+skeletons, invalid input+a11y)
- Lighthouse: performance/accessibility/best/SEO ≥ 90
  cd ui && npm run build && npm run preview
  npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo

Rollback (if needed):
  git push origin :refs/tags/ui-v1.0.1
  gh release delete ui-v1.0.1 --yes
  gh pr revert <merge-sha> -t "Revert UI v1.0.1" -b "Rollback due to CI/e2e failure"
DONE
