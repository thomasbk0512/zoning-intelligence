"""Output schema validation."""
from typing import Dict, Any, List, Optional


def validate_output_schema(data: Dict[str, Any]) -> bool:
    """
    Validate output matches frozen JSON schema.
    
    Required fields:
    - apn: string
    - jurisdiction: string
    - zone: string
    - setbacks_ft: dict with front, side, rear, street_side (all numbers)
    - height_ft: number
    - far: number
    - lot_coverage_pct: number
    - overlays: list of strings
    - sources: list of dicts with type and cite
    - notes: string
    - run_ms: number
    """
    required = {
        "apn": str,
        "jurisdiction": str,
        "zone": str,
        "setbacks_ft": dict,
        "height_ft": (int, float),
        "far": (int, float),
        "lot_coverage_pct": (int, float),
        "overlays": list,
        "sources": list,
        "notes": str,
        "run_ms": (int, float)
    }
    
    for key, expected_type in required.items():
        if key not in data:
            return False
        if not isinstance(data[key], expected_type):
            return False
    
    # Validate setbacks_ft structure
    setbacks = data["setbacks_ft"]
    for setback_key in ["front", "side", "rear", "street_side"]:
        if setback_key not in setbacks:
            return False
        if not isinstance(setbacks[setback_key], (int, float)):
            return False
    
    # Validate sources structure
    for source in data["sources"]:
        if not isinstance(source, dict):
            return False
        if "type" not in source or "cite" not in source:
            return False
    
    return True


def create_output_schema(apn: str, jurisdiction: str, zone: str,
                        setbacks_ft: Dict[str, float], height_ft: float,
                        far: float, lot_coverage_pct: float,
                        overlays: List[str], sources: List[Dict[str, str]],
                        notes: str, run_ms: float) -> Dict[str, Any]:
    """Create output dict matching frozen schema."""
    return {
        "apn": apn,
        "jurisdiction": jurisdiction,
        "zone": zone,
        "setbacks_ft": {
            "front": setbacks_ft.get("front", 0),
            "side": setbacks_ft.get("side", 0),
            "rear": setbacks_ft.get("rear", 0),
            "street_side": setbacks_ft.get("street_side", 0)
        },
        "height_ft": height_ft,
        "far": far,
        "lot_coverage_pct": lot_coverage_pct,
        "overlays": overlays,
        "sources": sources,
        "notes": notes,
        "run_ms": run_ms
    }

