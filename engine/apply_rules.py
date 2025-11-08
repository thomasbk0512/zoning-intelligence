"""Rule engine: YAML loading, zone matching, overlay merging."""
import yaml
from pathlib import Path
from typing import Dict, Any, List, Optional


def load_rules(rules_file: str) -> Dict[str, Any]:
    """Load and validate rule YAML file."""
    path = Path(rules_file)
    if not path.exists():
        raise FileNotFoundError(f"Rules file not found: {rules_file}")
    
    with open(path, 'r') as f:
        rules = yaml.safe_load(f)
    
    # Validate required fields
    if 'version' not in rules:
        raise ValueError("Rules file missing 'version' field")
    if 'jurisdiction' not in rules:
        raise ValueError("Rules file missing 'jurisdiction' field")
    if 'zones' not in rules:
        raise ValueError("Rules file missing 'zones' field")
    
    return rules


def get_zone_rules(rules: Dict[str, Any], zone_code: str) -> Optional[Dict[str, Any]]:
    """Get rules for a specific zone code."""
    zones = rules.get('zones', {})
    return zones.get(zone_code)


def apply_zone_rules(zone_rules: Dict[str, Any], is_corner_lot: bool = False) -> Dict[str, Any]:
    """
    Apply zone rules and corner lot logic.
    
    Returns dict with:
    - height_ft
    - far
    - lot_coverage_pct
    - setbacks_ft (dict with front, side, rear, street_side)
    """
    result = {
        "height_ft": zone_rules.get("height_ft", 0),
        "far": zone_rules.get("far", 0),
        "lot_coverage_pct": zone_rules.get("lot_coverage_pct", 0),
        "setbacks_ft": {
            "front": zone_rules.get("setbacks_ft", {}).get("front", 0),
            "side": zone_rules.get("setbacks_ft", {}).get("side", 0),
            "rear": zone_rules.get("setbacks_ft", {}).get("rear", 0),
            "street_side": 0
        }
    }
    
    # Apply corner lot street-side setback if applicable
    if is_corner_lot:
        corner_lot_rules = zone_rules.get("corner_lot", {})
        street_side = corner_lot_rules.get("street_side_setback_ft", 0)
        result["setbacks_ft"]["street_side"] = street_side
    
    return result


def get_overlay_rules(rules: Dict[str, Any], overlay_names: List[str]) -> Dict[str, Any]:
    """
    Get rules for overlays.
    
    Returns dict with overlay-specific rules and notes.
    """
    overlay_rules = rules.get('overlays', {})
    result = {
        "notes": []
    }
    
    for overlay_name in overlay_names:
        overlay_key = overlay_name.lower().replace(" ", "_")
        if overlay_key in overlay_rules:
            overlay_rule = overlay_rules[overlay_key]
            if "rules" in overlay_rule:
                rules_dict = overlay_rule["rules"]
                if "notes" in rules_dict:
                    result["notes"].append(rules_dict["notes"])
    
    return result


def get_crs_config(rules: Dict[str, Any]) -> Dict[str, str]:
    """Get CRS configuration from rules file."""
    crs_config = rules.get('crs', {})
    return {
        "input": crs_config.get("input", "EPSG:4326"),
        "internal": crs_config.get("internal", "EPSG:2277")
    }

