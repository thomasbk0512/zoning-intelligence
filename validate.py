#!/usr/bin/env python3
"""Quick validation script to check structure and imports."""
import sys
from pathlib import Path

def check_imports():
    """Check if all imports work."""
    try:
        from parsers.geo import load_geofile
        from parsers.pdf import get_citation_snippet
        from parsers.llm import parse_pdf_with_llm
        from engine.geom import intersect_zone
        from engine.apply_rules import load_rules
        from engine.schemas import validate_output_schema
        print("✓ All imports successful")
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        print("  Install dependencies: pip install -r requirements.txt")
        return False

def check_files():
    """Check if required files exist."""
    base = Path(__file__).parent
    required = [
        "zoning.py",
        "rules/austin.yaml",
        "data/austin/parcels.geojson",
        "data/austin/zoning.geojson",
        "tests/unit/test_geo.py",
        "tests/golden/001.apn.json",
    ]
    
    missing = []
    for f in required:
        if not (base / f).exists():
            missing.append(f)
    
    if missing:
        print(f"✗ Missing files: {', '.join(missing)}")
        return False
    else:
        print("✓ All required files present")
        return True

def check_line_count():
    """Check zoning.py line count."""
    base = Path(__file__).parent
    with open(base / "zoning.py") as f:
        lines = len([l for l in f if l.strip() and not l.strip().startswith('#')])
    
    if lines > 250:
        print(f"✗ zoning.py exceeds 250 LOC: {lines}")
        return False
    else:
        print(f"✓ zoning.py LOC: {lines} (≤250)")
        return True

if __name__ == "__main__":
    print("Validating zoning MVP structure...\n")
    results = [
        check_files(),
        check_line_count(),
        check_imports(),
    ]
    
    if all(results):
        print("\n✓ Validation passed")
        sys.exit(0)
    else:
        print("\n✗ Validation failed")
        sys.exit(1)

