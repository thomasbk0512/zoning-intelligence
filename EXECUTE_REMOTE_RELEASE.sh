#!/bin/bash
# Execute remote release for ui-v1.0.1
# Usage: ./EXECUTE_REMOTE_RELEASE.sh <repo-url>

set -e

REPO_URL="${1:-}"

if [ -z "$REPO_URL" ]; then
  echo "Error: Repository URL required"
  echo "Usage: $0 <repo-url>"
  echo "Example: $0 https://github.com/username/zoning-intelligence.git"
  exit 1
fi

echo "=================================================="
echo "UI v1.0.1 Remote Release Execution"
echo "Repository: $REPO_URL"
echo "=================================================="
echo ""

# Step 0: Check existing remote
echo "Step 0: Checking existing remote..."
if git remote | grep -q "^origin$"; then
  echo "Remote 'origin' exists. Removing and replacing..."
  git remote remove origin
fi

# Step 1: Add remote
echo ""
echo "Step 1: Adding remote..."
git remote add origin "$REPO_URL"
git remote -v
echo ""

# Step 2: Push tags and branch
echo "Step 2: Pushing tags and branch..."
echo "Pushing tags..."
if ! git push origin --tags; then
  echo "Warning: Tag push failed. Continuing..."
fi

echo ""
echo "Pushing branch ui/v1.0.1..."
if ! git push -u origin ui/v1.0.1; then
  echo "Error: Branch push failed"
  exit 1
fi

echo ""
echo "Verifying tags on remote..."
git ls-remote --tags origin | grep -E "(v1.0.1-dev|ui-v1.0.0)" || echo "Tags will appear after push"
echo ""

# Step 3: Check auth and create PR
echo "Step 3: Checking GitHub authentication..."
if ! gh auth status >/dev/null 2>&1; then
  echo "Warning: GitHub CLI not authenticated. Please run: gh auth login"
  echo "Continuing with PR creation..."
fi

echo ""
echo "Creating PR..."
PR_OUTPUT=$(gh pr create \
  -B main \
  -H ui/v1.0.1 \
  -t "UI v1.0.1: UX+Perf+A11y" \
  -b "$(cat ui/RELEASE_NOTES_v1.0.1.md)" 2>&1)

echo "$PR_OUTPUT"
echo ""

# Extract PR URL if possible
PR_URL=$(echo "$PR_OUTPUT" | grep -o 'https://github.com/[^ ]*' | head -1)

if [ -n "$PR_URL" ]; then
  echo "PR created: $PR_URL"
  echo ""
  echo "Monitoring CI checks..."
  echo "Press Ctrl+C to stop watching (you can continue manually)"
  sleep 2
  gh pr checks --watch || echo "CI monitoring stopped"
else
  echo "PR creation output:"
  echo "$PR_OUTPUT"
  echo ""
  echo "Please check PR status manually: gh pr list"
fi

echo ""
echo "=================================================="
echo "Next Steps:"
echo "=================================================="
echo ""
echo "1. Verify CI passes: gh pr checks"
echo "2. After CI passes, merge PR:"
echo "   gh pr merge ui/v1.0.1 --squash"
echo "3. Switch to main and pull:"
echo "   git checkout main && git pull origin main"
echo "4. Tag release:"
echo "   git tag ui-v1.0.1 -m 'UI v1.0.1: UX Polish Milestone Complete'"
echo "5. Push tag:"
echo "   git push origin ui-v1.0.1"
echo "6. Create GitHub release:"
echo "   gh release create ui-v1.0.1 -t 'UI v1.0.1' -F ui/RELEASE_NOTES_v1.0.1.md"
echo ""
echo "Post-merge checks:"
echo "- Run 5 integration test cases"
echo "- Run Lighthouse audit (target ≥90)"
echo ""

