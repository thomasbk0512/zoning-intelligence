#!/bin/bash
# Backup golden tests and data files

set -e

BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Creating backup in $BACKUP_DIR..."

mkdir -p "$BACKUP_DIR"

# Backup golden tests
if [ -d "$BASE_DIR/tests/golden" ]; then
    echo "Backing up golden tests..."
    cp -r "$BASE_DIR/tests/golden" "$BACKUP_DIR/"
    echo "✓ Golden tests backed up"
fi

# Backup data files
if [ -d "$BASE_DIR/data" ]; then
    echo "Backing up data files..."
    cp -r "$BASE_DIR/data" "$BACKUP_DIR/"
    echo "✓ Data files backed up"
fi

# Create manifest
cat > "$BACKUP_DIR/MANIFEST.txt" << EOF
Backup created: $(date)
Source: $BASE_DIR
Contents:
- tests/golden/ (golden test fixtures)
- data/ (parcel and zoning data)

To restore:
cp -r $BACKUP_DIR/tests/golden/* tests/golden/
cp -r $BACKUP_DIR/data/* data/
EOF

echo "✓ Backup complete: $BACKUP_DIR"
echo "Manifest: $BACKUP_DIR/MANIFEST.txt"

