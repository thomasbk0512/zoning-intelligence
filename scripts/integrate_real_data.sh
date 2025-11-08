#!/bin/bash
# Complete real data integration workflow

set -e

echo "=========================================="
echo "Real Data Integration Workflow"
echo "=========================================="

# Step 1: Backup existing data
echo ""
echo "Step 1: Backing up existing data..."
./scripts/backup_data.sh

# Step 2: Load real data
echo ""
echo "Step 2: Loading real data..."
if [ $# -lt 2 ]; then
    echo "Usage: $0 <parcel_file> <zoning_file>"
    echo ""
    echo "Example:"
    echo "  $0 /path/to/austin_parcels.geojson /path/to/austin_zoning.geojson"
    exit 1
fi

PARCEL_FILE="$1"
ZONING_FILE="$2"

python3 scripts/load_real_data.py "$PARCEL_FILE" "$ZONING_FILE"

# Step 3: Validate rules
echo ""
echo "Step 3: Validating rules..."
python3 scripts/validate_rules.py rules/*.yaml

# Step 4: Test with sample APNs
echo ""
echo "Step 4: Testing with sample APNs..."
# Extract first few APNs and test
FIRST_APN=$(python3 -c "
import json
with open('data/austin/parcels.geojson') as f:
    data = json.load(f)
    print(data['features'][0]['properties'].get('APN', data['features'][0]['properties'].get('apn', 'UNKNOWN')))
" 2>/dev/null || echo "0204050712")

echo "Testing with APN: $FIRST_APN"
python3 zoning.py --apn "$FIRST_APN" --city austin --out /tmp/test_real_data.json 2>&1 | grep -v "UserWarning" || true

if [ -f /tmp/test_real_data.json ]; then
    echo "✓ Test output generated"
    python3 -c "
import json
with open('/tmp/test_real_data.json') as f:
    data = json.load(f)
    print(f'  APN: {data[\"apn\"]}')
    print(f'  Zone: {data[\"zone\"]}')
    print(f'  Runtime: {data[\"run_ms\"]:.1f}ms')
"
else
    echo "⚠ Test output not generated"
fi

# Step 5: Run full test suite
echo ""
echo "Step 5: Running full test suite..."
make test

# Step 6: Update golden tests (optional)
echo ""
echo "Step 6: Golden test update (manual step required)"
echo "  Run: python3 scripts/update_golden_tests.py data/austin/parcels.geojson"
echo "  Then run CLI for each APN to generate actual expected outputs"

echo ""
echo "=========================================="
echo "Integration workflow complete!"
echo "=========================================="

