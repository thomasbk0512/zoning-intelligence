#!/usr/bin/env python3
"""Generate synthetic parcel and zoning data for testing."""
import json
from pathlib import Path


def generate_parcels_geojson(output_path: str):
    """Generate 5 synthetic parcels in Austin area."""
    # Austin area coordinates (EPSG:4326)
    parcels = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"APN": "0204050712"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-97.7431, 30.2672],
                        [-97.7428, 30.2672],
                        [-97.7428, 30.2675],
                        [-97.7431, 30.2675],
                        [-97.7431, 30.2672]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {"APN": "0204050713"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-97.7435, 30.2672],
                        [-97.7432, 30.2672],
                        [-97.7432, 30.2675],
                        [-97.7435, 30.2675],
                        [-97.7435, 30.2672]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {"APN": "0204050714"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-97.7439, 30.2672],
                        [-97.7436, 30.2672],
                        [-97.7436, 30.2675],
                        [-97.7439, 30.2675],
                        [-97.7439, 30.2672]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {"APN": "0204050715"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-97.7443, 30.2672],
                        [-97.7440, 30.2672],
                        [-97.7440, 30.2675],
                        [-97.7443, 30.2675],
                        [-97.7443, 30.2672]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {"APN": "0204050716"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-97.7447, 30.2672],
                        [-97.7444, 30.2672],
                        [-97.7444, 30.2675],
                        [-97.7447, 30.2675],
                        [-97.7447, 30.2672]
                    ]]
                }
            }
        ]
    }
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(parcels, f, indent=2)
    print(f"Generated {len(parcels['features'])} parcels: {output_path}")


def generate_zoning_geojson(output_path: str):
    """Generate synthetic zoning districts covering the parcels."""
    # Create zoning districts that cover the parcel areas
    zoning = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"zone": "SF-3"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-97.7448, 30.2671],
                        [-97.7430, 30.2671],
                        [-97.7430, 30.2676],
                        [-97.7448, 30.2676],
                        [-97.7448, 30.2671]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {"zone": "SF-2"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-97.7430, 30.2671],
                        [-97.7410, 30.2671],
                        [-97.7410, 30.2676],
                        [-97.7430, 30.2676],
                        [-97.7430, 30.2671]
                    ]]
                }
            },
            {
                "type": "Feature",
                "properties": {"zone": "MF-1"},
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[
                        [-97.7450, 30.2671],
                        [-97.7448, 30.2671],
                        [-97.7448, 30.2676],
                        [-97.7450, 30.2676],
                        [-97.7450, 30.2671]
                    ]]
                }
            }
        ]
    }
    
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w') as f:
        json.dump(zoning, f, indent=2)
    print(f"Generated {len(zoning['features'])} zoning districts: {output_path}")


if __name__ == "__main__":
    import sys
    base_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    
    generate_parcels_geojson(f"{base_dir}/data/austin/parcels.geojson")
    generate_zoning_geojson(f"{base_dir}/data/austin/zoning.geojson")

