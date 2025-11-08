#!/usr/bin/env python3
"""Validate YAML rule files."""
import sys
import yaml
from pathlib import Path
from typing import Dict, Any


def validate_rules_file(rules_path: Path) -> tuple[bool, list[str]]:
    """Validate a single rules YAML file."""
    errors = []
    
    try:
        with open(rules_path, 'r') as f:
            rules = yaml.safe_load(f)
    except yaml.YAMLError as e:
        return False, [f"YAML parse error: {e}"]
    
    # Required top-level fields
    required_fields = ['version', 'jurisdiction', 'zones']
    for field in required_fields:
        if field not in rules:
            errors.append(f"Missing required field: {field}")
    
    # Validate CRS config
    if 'crs' in rules:
        crs = rules['crs']
        if 'input' not in crs or 'internal' not in crs:
            errors.append("CRS config missing 'input' or 'internal'")
    
    # Validate zones
    if 'zones' in rules:
        zones = rules['zones']
        if not isinstance(zones, dict):
            errors.append("'zones' must be a dictionary")
        else:
            for zone_name, zone_rules in zones.items():
                zone_errors = validate_zone_rules(zone_name, zone_rules)
                errors.extend(zone_errors)
    
    return len(errors) == 0, errors


def validate_zone_rules(zone_name: str, zone_rules: Dict[str, Any]) -> list[str]:
    """Validate rules for a single zone."""
    errors = []
    
    required_fields = ['height_ft', 'far', 'lot_coverage_pct', 'setbacks_ft']
    for field in required_fields:
        if field not in zone_rules:
            errors.append(f"Zone {zone_name}: missing required field '{field}'")
    
    # Validate setbacks
    if 'setbacks_ft' in zone_rules:
        setbacks = zone_rules['setbacks_ft']
        if not isinstance(setbacks, dict):
            errors.append(f"Zone {zone_name}: 'setbacks_ft' must be a dictionary")
        else:
            required_setbacks = ['front', 'side', 'rear']
            for setback in required_setbacks:
                if setback not in setbacks:
                    errors.append(f"Zone {zone_name}: missing setback '{setback}'")
    
    # Validate numeric fields
    numeric_fields = ['height_ft', 'far', 'lot_coverage_pct']
    for field in numeric_fields:
        if field in zone_rules:
            value = zone_rules[field]
            if not isinstance(value, (int, float)) or value < 0:
                errors.append(f"Zone {zone_name}: '{field}' must be a non-negative number")
    
    return errors


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: validate_rules.py <rules_file>...")
        sys.exit(1)
    
    all_valid = True
    for rules_path_str in sys.argv[1:]:
        rules_path = Path(rules_path_str)
        if not rules_path.exists():
            print(f"Error: File not found: {rules_path}")
            all_valid = False
            continue
        
        valid, errors = validate_rules_file(rules_path)
        if valid:
            print(f"✓ {rules_path}: Valid")
        else:
            print(f"✗ {rules_path}: Invalid")
            for error in errors:
                print(f"  - {error}")
            all_valid = False
    
    sys.exit(0 if all_valid else 1)


if __name__ == "__main__":
    main()

