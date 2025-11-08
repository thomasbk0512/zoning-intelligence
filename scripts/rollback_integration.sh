#!/bin/bash
# Rollback data integration to previous backup

set -e

echo "=========================================="
echo "Rollback Data Integration"
echo "=========================================="

# Find latest backup
LATEST_BACKUP=$(ls -td backups/*/ 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "✗ No backups found in backups/"
    exit 1
fi

echo "Latest backup: $LATEST_BACKUP"
echo ""

# Confirm rollback
read -p "Restore from this backup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

# Restore golden tests
if [ -d "$LATEST_BACKUP/tests/golden" ]; then
    echo "Restoring golden tests..."
    cp -r "$LATEST_BACKUP/tests/golden"/* tests/golden/ 2>/dev/null || true
    echo "✓ Golden tests restored"
fi

# Restore data
if [ -d "$LATEST_BACKUP/data" ]; then
    echo "Restoring data files..."
    cp -r "$LATEST_BACKUP/data"/* data/ 2>/dev/null || true
    echo "✓ Data files restored"
fi

echo ""
echo "✓ Rollback complete"
echo ""
echo "To revert tag if already pushed:"
echo "  git tag -d v1.0.1-dev"
echo "  git push origin :refs/tags/v1.0.1-dev"

