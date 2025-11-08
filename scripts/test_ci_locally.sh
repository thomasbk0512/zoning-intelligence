#!/bin/bash
# Test CI workflow steps locally

set -e

echo "=========================================="
echo "Testing CI Workflow Steps Locally"
echo "=========================================="

# Step 1: Install dependencies
echo ""
echo "Step 1: Installing dependencies..."
python3 -m pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "✓ Dependencies installed"

# Step 2: Lint (optional)
echo ""
echo "Step 2: Linting (optional)..."
if command -v ruff &> /dev/null; then
    ruff check . || echo "⚠ Linting issues found (non-blocking)"
else
    echo "⚠ Ruff not installed, skipping lint"
fi

# Step 3: Run tests
echo ""
echo "Step 3: Running tests..."
make test
echo "✓ Tests passed"

# Step 4: Validate rules
echo ""
echo "Step 4: Validating rules..."
python3 scripts/validate_rules.py rules/*.yaml
echo "✓ Rules validated"

echo ""
echo "=========================================="
echo "All CI steps completed successfully!"
echo "=========================================="
