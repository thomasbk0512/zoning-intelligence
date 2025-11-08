"""Golden test runner for zoning CLI."""
import json
import subprocess
import sys
from pathlib import Path
from typing import Dict, Any, Tuple


TOLERANCE_FT = 0.1


def load_golden(golden_file: Path) -> Dict[str, Any]:
    """Load golden test file."""
    with open(golden_file, 'r') as f:
        return json.load(f)


def compare_outputs(actual: Dict[str, Any], expected: Dict[str, Any], 
                   tolerance_ft: float = TOLERANCE_FT) -> Tuple[bool, str]:
    """
    Compare actual output to expected with tolerance.
    
    Returns:
        (match, error_message)
    """
    errors = []
    
    # Check exact matches
    exact_fields = ['apn', 'jurisdiction', 'zone', 'overlays', 'sources']
    for field in exact_fields:
        if field not in actual:
            errors.append(f"Missing field: {field}")
        elif actual[field] != expected.get(field):
            errors.append(f"Mismatch in {field}: {actual[field]} != {expected[field]}")
    
    # Check numeric fields with tolerance
    numeric_fields = ['height_ft', 'far', 'lot_coverage_pct']
    for field in numeric_fields:
        if field not in actual:
            errors.append(f"Missing field: {field}")
        else:
            actual_val = actual[field]
            expected_val = expected.get(field, 0)
            if abs(actual_val - expected_val) > 0.001:  # Small tolerance for floats
                errors.append(f"Mismatch in {field}: {actual_val} != {expected_val}")
    
    # Check setbacks with tolerance
    if 'setbacks_ft' not in actual:
        errors.append("Missing field: setbacks_ft")
    else:
        actual_setbacks = actual['setbacks_ft']
        expected_setbacks = expected.get('setbacks_ft', {})
        for setback_type in ['front', 'side', 'rear', 'street_side']:
            actual_val = actual_setbacks.get(setback_type, 0)
            expected_val = expected_setbacks.get(setback_type, 0)
            if abs(actual_val - expected_val) > tolerance_ft:
                errors.append(
                    f"Setback {setback_type} mismatch: {actual_val} != {expected_val} "
                    f"(tolerance: {tolerance_ft} ft)"
                )
    
    # Notes can vary, so we just check it exists
    if 'notes' not in actual:
        errors.append("Missing field: notes")
    
    # run_ms can vary, so we just check it exists and is reasonable
    if 'run_ms' not in actual:
        errors.append("Missing field: run_ms")
    elif actual['run_ms'] < 0:
        errors.append(f"Invalid run_ms: {actual['run_ms']}")
    
    return len(errors) == 0, "; ".join(errors) if errors else ""


def run_golden_test(golden_file: Path, base_dir: Path) -> Tuple[bool, str]:
    """
    Run a single golden test.
    
    Args:
        golden_file: Path to golden JSON file
        base_dir: Base directory of project
    
    Returns:
        (passed, error_message)
    """
    # Extract APN from golden file
    expected = load_golden(golden_file)
    apn = expected['apn']
    
    # Run CLI
    output_file = base_dir / "tests" / "golden" / f"{golden_file.stem}_actual.json"
    cmd = [
        sys.executable,
        str(base_dir / "zoning.py"),
        "--apn", apn,
        "--city", "austin",
        "--data-dir", str(base_dir),
        "--out", str(output_file),
        "--offline"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, cwd=str(base_dir))
        if result.returncode != 0:
            return False, f"CLI failed: {result.stderr}"
    except Exception as e:
        return False, f"Error running CLI: {e}"
    
    # Load actual output
    if not output_file.exists():
        return False, f"Output file not created: {output_file}"
    
    try:
        with open(output_file, 'r') as f:
            actual = json.load(f)
    except Exception as e:
        return False, f"Error loading output: {e}"
    
    # Compare
    match, error_msg = compare_outputs(actual, expected)
    if not match:
        return False, error_msg
    
    return True, ""


def run_all_golden_tests():
    """Run all golden tests."""
    base_dir = Path(__file__).parent.parent
    golden_dir = base_dir / "tests" / "golden"
    
    if not golden_dir.exists():
        print(f"Golden test directory not found: {golden_dir}")
        return False
    
    golden_files = sorted(golden_dir.glob("*.apn.json"))
    if len(golden_files) == 0:
        print("No golden test files found")
        return False
    
    print(f"Running {len(golden_files)} golden tests...")
    
    passed = 0
    failed = 0
    
    for golden_file in golden_files:
        test_name = golden_file.stem
        print(f"Testing {test_name}...", end=" ")
        
        success, error_msg = run_golden_test(golden_file, base_dir)
        
        if success:
            print("PASSED")
            passed += 1
        else:
            print(f"FAILED: {error_msg}")
            failed += 1
    
    print(f"\nResults: {passed} passed, {failed} failed")
    return failed == 0


if __name__ == "__main__":
    success = run_all_golden_tests()
    sys.exit(0 if success else 1)

