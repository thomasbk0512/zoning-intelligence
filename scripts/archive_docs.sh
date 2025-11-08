#!/bin/bash
# Archive documentation for v1.0.1 release

set -e

VERSION="v1.0.1"
DOCS_DIR="docs/$VERSION"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Verify mode
if [ "$1" == "--verify" ]; then
    echo "Verifying documentation archive for $VERSION..."
    
    if [ ! -d "$DOCS_DIR" ]; then
        echo "✗ Archive directory not found: $DOCS_DIR"
        exit 1
    fi
    
    if [ ! -f "$DOCS_DIR/MANIFEST.txt" ]; then
        echo "✗ Manifest not found: $DOCS_DIR/MANIFEST.txt"
        exit 1
    fi
    
    # Check expected files
    EXPECTED_FILES=(
        "INTEGRATION_GUIDE.md"
        "INTEGRATION_CONFIRMED.md"
        "DATA_SOURCES.md"
        "V1.0.1_READY.md"
        "README.md"
        "RELEASE.md"
        "CHANGELOG.md"
        "DEPLOYMENT.md"
        "ROADMAP.md"
        "P0_TRANSITION.md"
        "P0_START.md"
        "P0_PROGRESS.md"
        "EXECUTION_CHECKLIST.md"
        "DOCUMENTATION_INDEX.md"
    )
    
    MISSING=0
    for file in "${EXPECTED_FILES[@]}"; do
        if [ ! -f "$DOCS_DIR/$file" ]; then
            echo "✗ Missing: $file"
            MISSING=$((MISSING + 1))
        fi
    done
    
    if [ $MISSING -eq 0 ]; then
        echo "✓ All expected files present"
        echo "✓ Archive verified: $DOCS_DIR"
        echo "✓ Manifest: $DOCS_DIR/MANIFEST.txt"
        exit 0
    else
        echo "✗ Archive incomplete: $MISSING files missing"
        exit 1
    fi
fi

echo "Archiving documentation for $VERSION..."

mkdir -p "$DOCS_DIR"

# Copy integration docs
echo "Copying integration documentation..."
cp INTEGRATION_GUIDE.md "$DOCS_DIR/" 2>/dev/null || true
cp INTEGRATION_CONFIRMED.md "$DOCS_DIR/" 2>/dev/null || true
cp DATA_SOURCES.md "$DOCS_DIR/" 2>/dev/null || true
cp V1.0.1_READY.md "$DOCS_DIR/" 2>/dev/null || true

# Copy core docs
echo "Copying core documentation..."
cp README.md "$DOCS_DIR/" 2>/dev/null || true
cp RELEASE.md "$DOCS_DIR/" 2>/dev/null || true
cp CHANGELOG.md "$DOCS_DIR/" 2>/dev/null || true
cp DEPLOYMENT.md "$DOCS_DIR/" 2>/dev/null || true

# Copy planning docs
echo "Copying planning documentation..."
cp ROADMAP.md "$DOCS_DIR/" 2>/dev/null || true
cp P0_TRANSITION.md "$DOCS_DIR/" 2>/dev/null || true
cp P0_START.md "$DOCS_DIR/" 2>/dev/null || true
cp P0_PROGRESS.md "$DOCS_DIR/" 2>/dev/null || true
cp EXECUTION_CHECKLIST.md "$DOCS_DIR/" 2>/dev/null || true

# Copy index
cp DOCUMENTATION_INDEX.md "$DOCS_DIR/" 2>/dev/null || true

# Create manifest
cat > "$DOCS_DIR/MANIFEST.txt" << MANIFEST
Documentation Archive for $VERSION
Created: $(date)
Source: $ROOT_DIR

Contents:
- Integration documentation (4 files)
- Core documentation (4 files)
- Planning documentation (5 files)
- Index (1 file)

Total: 14 documentation files
MANIFEST

echo "✓ Documentation archived to $DOCS_DIR/"
echo "✓ Manifest created: $DOCS_DIR/MANIFEST.txt"
ls -1 "$DOCS_DIR" | wc -l | xargs echo "  Files archived:"
