#!/bin/bash
# Execute remote push, PR, CI, and release ui-v1.0.1
# Usage: ./EXECUTE_RELEASE.sh <repo-url>

set -e

REPO_URL="${1:-}"

if [ -z "$REPO_URL" ]; then
  echo "Error: Repository URL required"
  echo "Usage: $0 <repo-url>"
  echo "Example: $0 https://github.com/username/zoning-intelligence.git"
  exit 1
fi

echo "=================================================="
echo "UI v1.0.1 Release Execution"
echo "=================================================="
echo ""

# Step 1: Connect Remote
echo "Step 1: Connecting remote..."
if git remote | grep -q "^origin$"; then
  echo "Remote 'origin' exists. Updating URL..."
  git remote set-url origin "$REPO_URL"
else
  echo "Adding remote 'origin'..."
  git remote add origin "$REPO_URL"
fi

git remote -v
echo ""

# Step 2: Push Tags + Branch
echo "Step 2: Pushing tags and branch..."
echo "Pushing tags..."
git push origin --tags

echo ""
echo "Pushing branch ui/v1.0.1..."
git push origin ui/v1.0.1

echo ""
echo "Verifying tags on remote..."
git ls-remote --tags origin | grep -E "(v1.0.1-dev|ui-v1.0.0)" || echo "Tags will appear after push"
echo ""

# Step 3: Create PR
echo "Step 3: Creating PR..."
PR_URL=$(gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -F ui/RELEASE_NOTES_v1.0.1.md)

echo "PR created: $PR_URL"
echo ""
echo "Monitor CI with:"
echo "  gh pr checks --watch"
echo ""
echo "Or view PR at: $PR_URL"
echo ""

# Step 4: Wait for CI (optional)
read -p "Wait for CI to complete? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Watching CI checks..."
  gh pr checks --watch
fi

echo ""
echo "=================================================="
echo "Next Steps:"
echo "=================================================="
echo ""
echo "1. Verify CI passes: gh pr checks"
echo "2. Run local integration tests (see INTEGRATION_TEST_RESULTS.md)"
echo "3. Run Lighthouse audit:"
echo "   cd ui && npm run build && npm run preview"
echo "   npx lighthouse http://localhost:4173 --only-categories=performance,accessibility,best-practices,seo"
echo "4. After CI passes and tests verify, merge PR:"
echo "   gh pr merge ui/v1.0.1 --squash"
echo "5. Tag release:"
echo "   git checkout main && git pull origin main"
echo "   git tag ui-v1.0.1 -m 'UI v1.0.1: UX Polish Milestone Complete'"
echo "   git push origin ui-v1.0.1"
echo "6. Create GitHub release:"
echo "   gh release create ui-v1.0.1 -t 'UI v1.0.1' -F ui/RELEASE_NOTES_v1.0.1.md"
echo ""

