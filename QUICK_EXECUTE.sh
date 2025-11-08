#!/bin/bash
# Quick release execution - prompts for repo URL if not provided
# Usage: ./QUICK_EXECUTE.sh [repo-url]

set -e

REPO_URL="${1:-}"

if [ -z "$REPO_URL" ]; then
  read -p "Enter repository URL: " REPO_URL
  if [ -z "$REPO_URL" ]; then
    echo "Error: Repository URL required"
    exit 1
  fi
fi

echo "=================================================="
echo "Executing UI v1.0.1 Release"
echo "Repository: $REPO_URL"
echo "=================================================="
echo ""

# Step 1: Configure remote
echo "Step 1: Configuring remote..."
if git remote | grep -q "^origin$"; then
  echo "Remote 'origin' exists. Updating..."
  git remote set-url origin "$REPO_URL"
else
  echo "Adding remote 'origin'..."
  git remote add origin "$REPO_URL"
fi
git remote -v
echo ""

# Step 2: Push tags and branch
echo "Step 2: Pushing tags and branch..."
echo "Pushing tags..."
git push origin --tags
echo ""
echo "Pushing branch ui/v1.0.1..."
git push origin ui/v1.0.1
echo ""

# Step 3: Create PR
echo "Step 3: Creating PR..."
PR_URL=$(gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -F ui/RELEASE_NOTES_v1.0.1.md 2>&1)

echo "$PR_URL"
echo ""
echo "PR created. Next steps:"
echo "1. Monitor CI: gh pr checks --watch"
echo "2. After CI passes, merge: gh pr merge ui/v1.0.1 --squash"
echo "3. Tag release: git checkout main && git pull && git tag ui-v1.0.1 && git push origin ui-v1.0.1"
echo "4. Create release: gh release create ui-v1.0.1 -t 'UI v1.0.1' -F ui/RELEASE_NOTES_v1.0.1.md"
echo ""

