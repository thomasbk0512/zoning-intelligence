#!/usr/bin/env python3
"""Zoning Intelligence CLI - MVP driver."""
import argparse
import json
import sys
import time
from pathlib import Path
from typing import Optional, Tuple

from parsers.geo import load_geofile, find_parcel_by_apn, find_nearest_parcel
from parsers.pdf import get_citation_snippet
from parsers.llm import parse_pdf_with_llm
from engine.geom import intersect_zone, detect_overlays, is_corner_lot
from engine.apply_rules import load_rules, get_zone_rules, apply_zone_rules, get_overlay_rules, get_crs_config
from engine.schemas import create_output_schema, validate_output_schema


# Jurisdiction configuration
JURISDICTIONS = {
    "austin": {
        "parcel_layer": "data/austin/parcels.geojson",
        "zoning_layer": "data/austin/zoning.geojson",
        "overlay_layers": {},
        "code_pdfs": [],
        "rules_file": "rules/austin.yaml"
    }
}


def parse_args():
    """Parse CLI arguments."""
    parser = argparse.ArgumentParser(description="Zoning Intelligence CLI")
    input_group = parser.add_mutually_exclusive_group(required=True)
    input_group.add_argument("--apn", help="APN (parcel ID)")
    input_group.add_argument("--lat-lng", help="Latitude,Longitude (e.g., 30.2672,-97.7431)")
    parser.add_argument("--city", required=True, help="City/jurisdiction (e.g., austin)")
    parser.add_argument("--data-dir", default=".", help="Data directory (default: current dir)")
    parser.add_argument("--out", required=True, help="Output JSON file")
    parser.add_argument("--verbose", action="store_true", help="Verbose logging")
    parser.add_argument("--offline", action="store_true", help="Offline mode (use cached data only)")
    parser.add_argument("--llm", action="store_true", help="Enable LLM PDF parsing")
    return parser.parse_args()


def load_jurisdiction_data(city: str, data_dir: str, verbose: bool = False):
    """Load all data layers for jurisdiction."""
    if city not in JURISDICTIONS:
        raise ValueError(f"Unknown jurisdiction: {city}")
    
    config = JURISDICTIONS[city]
    base_path = Path(data_dir)
    
    # Load rules
    rules_path = base_path / config["rules_file"]
    rules = load_rules(str(rules_path))
    crs_config = get_crs_config(rules)
    
    if verbose:
        print(f"Loaded rules from {rules_path}")
        print(f"CRS: {crs_config['input']} -> {crs_config['internal']}")
    
    # Load parcel layer
    parcel_path = base_path / config["parcel_layer"]
    parcels = load_geofile(str(parcel_path), target_crs=crs_config["internal"])
    if verbose:
        print(f"Loaded {len(parcels)} parcels from {parcel_path}")
    
    # Load zoning layer
    zoning_path = base_path / config["zoning_layer"]
    zoning = load_geofile(str(zoning_path), target_crs=crs_config["internal"])
    if verbose:
        print(f"Loaded {len(zoning)} zoning districts from {zoning_path}")
    
    # Load overlay layers
    overlay_gdfs = {}
    for overlay_name, overlay_path in config.get("overlay_layers", {}).items():
        overlay_full_path = base_path / overlay_path
        if overlay_full_path.exists():
            overlay_gdfs[overlay_name] = load_geofile(str(overlay_full_path), target_crs=crs_config["internal"])
            if verbose:
                print(f"Loaded overlay {overlay_name} from {overlay_full_path}")
    
    return {
        "rules": rules,
        "crs_config": crs_config,
        "parcels": parcels,
        "zoning": zoning,
        "overlay_gdfs": overlay_gdfs,
        "config": config,
        "base_path": base_path
    }


def find_parcel(data: dict, apn: Optional[str], lat_lng: Optional[Tuple[float, float]], verbose: bool = False):
    """Find parcel by APN or lat/lng."""
    parcels = data["parcels"]
    crs_config = data["crs_config"]
    
    if apn:
        parcel = find_parcel_by_apn(parcels, apn)
        if parcel is None:
            raise ValueError(f"Parcel not found for APN: {apn}")
        if verbose:
            print(f"Found parcel: {apn}")
        return parcel, apn
    else:
        lat, lng = lat_lng
        parcel = find_nearest_parcel(parcels, lat, lng, 
                                    source_crs=crs_config["input"],
                                    target_crs=crs_config["internal"])
        if parcel is None:
            raise ValueError(f"No parcel found near {lat},{lng}")
        # Get APN from parcel
        apn = parcel.get("APN", "UNKNOWN")
        if verbose:
            print(f"Found nearest parcel: {apn} at {lat},{lng}")
        return parcel, apn


def main():
    """Main CLI entry point."""
    start_time = time.time()
    args = parse_args()
    
    try:
        # Load jurisdiction data
        data = load_jurisdiction_data(args.city, args.data_dir, args.verbose)
        
        # Parse input
        lat_lng = None
        if args.lat_lng:
            try:
                lat, lng = map(float, args.lat_lng.split(','))
                lat_lng = (lat, lng)
            except ValueError:
                sys.exit(f"Invalid lat-lng format: {args.lat_lng}")
        
        # Find parcel
        parcel, apn = find_parcel(data, args.apn, lat_lng, args.verbose)
        
        # Get zone
        zone = intersect_zone(parcel, data["zoning"])
        if zone is None:
            zone = "UNKNOWN"
            if args.verbose:
                print("Warning: No zone intersection found")
        
        # Get zone rules
        zone_rules = get_zone_rules(data["rules"], zone)
        if zone_rules is None:
            raise ValueError(f"No rules found for zone: {zone}")
        
        # Detect corner lot
        corner_lot = is_corner_lot(parcel)
        
        # Apply zone rules
        zone_constraints = apply_zone_rules(zone_rules, corner_lot)
        
        # Detect overlays
        overlays = detect_overlays(parcel, data["overlay_gdfs"])
        overlay_rules = get_overlay_rules(data["rules"], overlays)
        
        # Build notes
        notes_parts = []
        if corner_lot:
            notes_parts.append("Corner lot; street-side setback applied")
        if overlay_rules.get("notes"):
            notes_parts.extend(overlay_rules["notes"])
        notes = "; ".join(notes_parts) if notes_parts else ""
        
        # Get PDF citations (stub for MVP)
        sources = [
            {"type": "map", "cite": f"{args.city}_zoning_v2024"}
        ]
        
        # Add code citations if PDFs available
        pdf_paths = [str(data["base_path"] / pdf) for pdf in data["config"].get("code_pdfs", [])]
        if pdf_paths and not args.offline:
            # Try to get a citation (stub)
            citation = "§25-2-492"  # Example citation
            if args.llm:
                snippet = parse_pdf_with_llm(pdf_paths[0] if pdf_paths else None, citation)
            else:
                snippet = get_citation_snippet(citation, pdf_paths, use_cache=True)
            if snippet:
                sources.append({"type": "code", "cite": citation})
        
        # Build output
        run_ms = (time.time() - start_time) * 1000
        # Format jurisdiction: "austin_tx" -> "Austin, TX"
        jurisdiction_raw = data["rules"].get("jurisdiction", args.city)
        if "_" in jurisdiction_raw:
            parts = jurisdiction_raw.split("_")
            jurisdiction_name = f"{parts[0].title()}, {parts[1].upper()}"
        else:
            jurisdiction_name = jurisdiction_raw.title()
        
        output = create_output_schema(
            apn=apn,
            jurisdiction=jurisdiction_name,
            zone=zone,
            setbacks_ft=zone_constraints["setbacks_ft"],
            height_ft=zone_constraints["height_ft"],
            far=zone_constraints["far"],
            lot_coverage_pct=zone_constraints["lot_coverage_pct"],
            overlays=overlays,
            sources=sources,
            notes=notes,
            run_ms=run_ms
        )
        
        # Validate output
        if not validate_output_schema(output):
            raise ValueError("Output schema validation failed")
        
        # Write output
        with open(args.out, 'w') as f:
            json.dump(output, f, indent=2)
        
        if args.verbose:
            print(f"Output written to {args.out}")
            print(f"Runtime: {run_ms:.0f}ms")
        
    except Exception as e:
        if args.verbose:
            import traceback
            traceback.print_exc()
        sys.exit(f"Error: {e}")


if __name__ == "__main__":
    main()

