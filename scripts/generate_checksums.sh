#!/bin/bash
# Generate checksums for release artifacts

set -e

VERSION="${1:-v1.0.1}"
OUTPUT_DIR="docs/$VERSION"
CHECKSUMS_FILE="$OUTPUT_DIR/CHECKSUMS.txt"

echo "Generating checksums for $VERSION..."

# Create output directory if needed
mkdir -p "$OUTPUT_DIR"

# Clear existing checksums
> "$CHECKSUMS_FILE"

# Generate checksums for key files
if [ -f "out.json" ]; then
    echo "Checksumming out.json..."
    shasum -a 256 out.json >> "$CHECKSUMS_FILE"
fi

if [ -f "$OUTPUT_DIR/MANIFEST.txt" ]; then
    echo "Checksumming MANIFEST.txt..."
    shasum -a 256 "$OUTPUT_DIR/MANIFEST.txt" >> "$CHECKSUMS_FILE"
fi

# Checksum all markdown files in archive
if [ -d "$OUTPUT_DIR" ]; then
    echo "Checksumming documentation files..."
    find "$OUTPUT_DIR" -name "*.md" -type f | sort | while read file; do
        shasum -a 256 "$file" >> "$CHECKSUMS_FILE"
    done
fi

echo "✓ Checksums generated: $CHECKSUMS_FILE"
cat "$CHECKSUMS_FILE"

