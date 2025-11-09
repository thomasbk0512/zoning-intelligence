#!/bin/bash
set -e

echo "=== Sequential PR Merge Script ==="
echo ""

# Start from main
git checkout main
git pull origin main

# PR #36 is already merged
echo "✅ PR #36 already merged"

# Process PRs 37-43
for pr in 37 38 39 40 41 42 43; do
  echo ""
  echo "=== Processing PR #$pr ==="
  
  # Get branch name
  branch=$(gh pr view $pr --json headRefName --jq -r '.headRefName')
  echo "Branch: $branch"
  
  # Checkout and update
  git checkout $branch
  git pull origin $branch
  
  # Merge main into this branch (taking PR's version for conflicts)
  echo "Merging main into $branch..."
  if git merge origin/main --no-edit -X ours 2>&1 | tee /tmp/merge_output.txt; then
    echo "Merge successful"
  else
    if grep -q "conflict" /tmp/merge_output.txt; then
      echo "Resolving conflicts by keeping PR version..."
      git checkout --ours .
      git add .
      git commit -m "Merge main: resolve conflicts by keeping PR changes" || true
    fi
  fi
  
  # Push updated branch
  echo "Pushing updated branch..."
  git push origin $branch --force-with-lease
  
  # Merge PR
  echo "Merging PR #$pr..."
  gh pr merge $pr --squash --admin --delete-branch=false || echo "Merge failed, continuing..."
  
  # Return to main and pull
  git checkout main
  git pull origin main
  sleep 2
done

echo ""
echo "=== Complete ==="
