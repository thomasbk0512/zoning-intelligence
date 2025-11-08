#!/bin/bash
# Push remote, open PR, and release ui-v1.0.1
# Usage: ./PUSH_AND_RELEASE_COMMANDS.sh <repo-url>

set -e

REPO_URL="${1:-}"

if [ -z "$REPO_URL" ]; then
  echo "Error: Repository URL required"
  echo "Usage: $0 <repo-url>"
  exit 1
fi

echo "=================================================="
echo "Step 1: Connect Remote & Push Tags/Branch"
echo "=================================================="

# Check if remote exists
if git remote | grep -q "^origin$"; then
  echo "Remote 'origin' already exists. Updating..."
  git remote set-url origin "$REPO_URL"
else
  echo "Adding remote 'origin'..."
  git remote add origin "$REPO_URL"
fi

git remote -v

echo ""
echo "Pushing tags..."
git push origin --tags

echo ""
echo "Pushing branch ui/v1.0.1..."
git push origin ui/v1.0.1

echo ""
echo "Verifying tags on remote..."
git ls-remote --tags origin | grep -E "(v1.0.1-dev|ui-v1.0.0|ui-v1.0.1)" || echo "Tags will appear after push"

echo ""
echo "=================================================="
echo "Step 2: Create PR & Monitor CI"
echo "=================================================="

echo "Creating PR..."
gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -F ui/RELEASE_NOTES_v1.0.1.md

echo ""
echo "PR created. Monitor CI with:"
echo "  gh pr checks --watch"

echo ""
echo "=================================================="
echo "Step 3: After CI passes, merge & tag"
echo "=================================================="

echo "To merge and tag, run:"
echo "  gh pr merge ui/v1.0.1 --squash"
echo "  git checkout main"
echo "  git pull origin main"
echo "  git tag ui-v1.0.1 -m 'UI v1.0.1: UX Polish Milestone Complete'"
echo "  git push origin ui-v1.0.1"
echo ""
echo "To create GitHub release:"
echo "  gh release create ui-v1.0.1 -t 'UI v1.0.1' -F ui/RELEASE_NOTES_v1.0.1.md"

