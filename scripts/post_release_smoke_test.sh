#!/bin/bash
# Post-release smoke test in clean environment

set -e

echo "=========================================="
echo "Post-Release Smoke Test"
echo "=========================================="

# Create clean virtual environment
echo "Creating clean virtual environment..."
python3 -m venv .venv_test
source .venv_test/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements-lock.txt

# Run smoke test
echo "Running smoke test..."
python3 zoning.py --apn 0204050712 --city austin --out out.json

# Verify output
echo "Verifying output..."
if jq -e '.apn and .zone and .jurisdiction' out.json >/dev/null 2>&1; then
    echo "✓ Output validation passed"
else
    echo "✗ Output validation failed"
    exit 1
fi

# Check schema fields
FIELD_COUNT=$(jq 'keys | length' out.json)
if [ "$FIELD_COUNT" -eq 11 ]; then
    echo "✓ Schema validation passed (11/11 fields)"
else
    echo "✗ Schema validation failed (expected 11, got $FIELD_COUNT)"
    exit 1
fi

# Cleanup
deactivate
rm -rf .venv_test

echo "=========================================="
echo "✓ Post-release smoke test passed"
echo "=========================================="

