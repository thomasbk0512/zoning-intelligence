#!/usr/bin/env python3
"""Zoning Intelligence API Server - FastAPI wrapper around zoning.py CLI."""
import json
import sys
import time
from pathlib import Path
from typing import Optional, Tuple

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from parsers.geo import load_geofile, find_parcel_by_apn, find_nearest_parcel
from parsers.pdf import get_citation_snippet
from parsers.llm import parse_pdf_with_llm
from engine.geom import intersect_zone, detect_overlays, is_corner_lot
from engine.apply_rules import load_rules, get_zone_rules, apply_zone_rules, get_overlay_rules, get_crs_config
from engine.schemas import create_output_schema, validate_output_schema
# Telemetry stubs (if module doesn't exist)
try:
    from engine.telemetry import (
        emit_metrics,
        incr,
        log,
        set_gauge,
        start_timer,
        stop_timer,
    )
except ImportError:
    # Stub telemetry functions if module doesn't exist
    def emit_metrics(*args, **kwargs): pass
    def incr(*args, **kwargs): pass
    def log(*args, **kwargs): pass
    def set_gauge(*args, **kwargs): pass
    def start_timer(*args, **kwargs): return 0
    def stop_timer(*args, **kwargs): return 0

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

app = FastAPI(title="Zoning Intelligence API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    
    # Load parcel layer
    parcel_path = base_path / config["parcel_layer"]
    parcels = load_geofile(str(parcel_path), target_crs=crs_config["internal"])
    
    # Load zoning layer
    zoning_path = base_path / config["zoning_layer"]
    zoning = load_geofile(str(zoning_path), target_crs=crs_config["internal"])
    
    # Load overlay layers
    overlay_gdfs = {}
    for overlay_name, overlay_path in config.get("overlay_layers", {}).items():
        overlay_full_path = base_path / overlay_path
        if overlay_full_path.exists():
            overlay_gdfs[overlay_name] = load_geofile(str(overlay_full_path), target_crs=crs_config["internal"])
    
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
        return parcel, apn


def get_zoning_data(apn: Optional[str] = None, latitude: Optional[float] = None, 
                    longitude: Optional[float] = None, city: str = "austin", 
                    data_dir: str = ".", verbose: bool = False, offline: bool = False):
    """Get zoning data for a parcel - extracted from zoning.py logic."""
    start_time = time.time()
    
    # Load jurisdiction data
    data = load_jurisdiction_data(city, data_dir, verbose)
    
    # Find parcel
    lat_lng = None
    if latitude is not None and longitude is not None:
        lat_lng = (latitude, longitude)
    
    parcel, parcel_apn = find_parcel(data, apn, lat_lng, verbose)
    
    # Get zone
    zone = intersect_zone(parcel, data["zoning"])
    if zone is None:
        zone = "UNKNOWN"
    
    # Get zone rules
    zone_rules = get_zone_rules(data["rules"], zone)
    if zone_rules is None:
        raise ValueError(f"No rules found for zone: {zone}")
    
    # Detect corner lot
    corner_lot = is_corner_lot(parcel)
    
    # Apply zone rules (note: apply_zone_rules takes zone_rules dict and is_corner_lot bool)
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
        {"type": "map", "cite": f"{city}_zoning_v2024"}
    ]
    
    # Format jurisdiction
    jurisdiction_raw = data["rules"].get("jurisdiction", city)
    if "_" in jurisdiction_raw:
        parts = jurisdiction_raw.split("_")
        jurisdiction_name = f"{parts[0].title()}, {parts[1].upper()}"
    else:
        jurisdiction_name = jurisdiction_raw.title()
    
    # Build output
    run_ms = (time.time() - start_time) * 1000
    output = create_output_schema(
        apn=parcel_apn,
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
    
    return output


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.get("/zoning")
async def get_zoning(
    apn: Optional[str] = Query(None, description="Assessor's Parcel Number"),
    latitude: Optional[float] = Query(None, description="Latitude"),
    longitude: Optional[float] = Query(None, description="Longitude"),
    city: str = Query("austin", description="City/jurisdiction"),
):
    """
    Get zoning information for a parcel.
    
    Either APN or latitude/longitude must be provided.
    """
    if not apn and (latitude is None or longitude is None):
        raise HTTPException(
            status_code=400,
            detail="Either 'apn' or both 'latitude' and 'longitude' must be provided"
        )
    
    if apn and (latitude is not None or longitude is not None):
        raise HTTPException(
            status_code=400,
            detail="Cannot specify both 'apn' and 'latitude'/'longitude'"
        )
    
    try:
        result = get_zoning_data(
            apn=apn,
            latitude=latitude,
            longitude=longitude,
            city=city.lower(),
            data_dir=".",
            verbose=False,
            offline=False
        )
        
        return result
        
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Configuration error: {str(e)}")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
