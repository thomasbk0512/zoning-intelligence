#!/usr/bin/env python3
"""Load real Austin parcel and zoning data.

This script replaces synthetic data with real datasets.
Expected data sources:
- Austin parcel GeoJSON/Shapefile
- Austin zoning districts layer
"""
import json
import sys
from pathlib import Path
from typing import Dict, Any


def validate_parcel_data(data_path: Path) -> Dict[str, Any]:
    """Validate parcel GeoJSON structure with field mapping."""
    with open(data_path) as f:
        data = json.load(f)
    
    if data.get("type") != "FeatureCollection":
        raise ValueError("Parcel data must be GeoJSON FeatureCollection")
    
    features = data.get("features", [])
    if len(features) == 0:
        raise ValueError("No features found in parcel data")
    
    # Check for APN field with multiple possible names
    first_feature = features[0]
    props = first_feature.get("properties", {})
    
    apn_fields = ["APN", "apn", "PARCEL_ID", "parcel_id", "PARCELID", "parcelid", 
                  "APN_NUM", "apn_num", "PROP_ID", "prop_id"]
    apn_field = next((f for f in apn_fields if f in props), None)
    
    if not apn_field:
        raise ValueError(f"No APN field found. Available fields: {list(props.keys())}")
    
    # Validate geometry
    geom = first_feature.get("geometry")
    if not geom or geom.get("type") not in ["Polygon", "MultiPolygon"]:
        raise ValueError(f"Invalid geometry type: {geom.get('type') if geom else 'None'}. Expected Polygon or MultiPolygon")
    
    return {
        "type": "FeatureCollection",
        "features": features,
        "count": len(features),
        "apn_field": apn_field,
        "available_fields": list(props.keys())
    }


def validate_zoning_data(data_path: Path) -> Dict[str, Any]:
    """Validate zoning GeoJSON structure with field mapping."""
    with open(data_path) as f:
        data = json.load(f)
    
    if data.get("type") != "FeatureCollection":
        raise ValueError("Zoning data must be GeoJSON FeatureCollection")
    
    features = data.get("features", [])
    if len(features) == 0:
        raise ValueError("No features found in zoning data")
    
    # Check for zone field with multiple possible names
    first_feature = features[0]
    props = first_feature.get("properties", {})
    
    zone_fields = ["zone", "ZONE", "zoning", "ZONING", "zone_code", "ZONE_CODE",
                   "ZONE_CODE", "ZONING_CODE", "zoning_code", "ZONE_DIST", "zone_dist"]
    zone_field = next((f for f in zone_fields if f in props), None)
    
    if not zone_field:
        raise ValueError(f"No zone field found. Available fields: {list(props.keys())}")
    
    # Validate geometry
    geom = first_feature.get("geometry")
    if not geom or geom.get("type") not in ["Polygon", "MultiPolygon"]:
        raise ValueError(f"Invalid geometry type: {geom.get('type') if geom else 'None'}. Expected Polygon or MultiPolygon")
    
    return {
        "type": "FeatureCollection",
        "features": features,
        "count": len(features),
        "zone_field": zone_field,
        "available_fields": list(props.keys())
    }


def fix_geometries(gdf):
    """Fix invalid geometries using buffer(0) trick."""
    import geopandas as gpd
    from shapely.geometry import Polygon, MultiPolygon
    
    # Check for invalid geometries
    invalid = ~gdf.geometry.is_valid
    if invalid.any():
        print(f"  Warning: {invalid.sum()} invalid geometries found, fixing...")
        # Fix using buffer(0) trick
        gdf.loc[invalid, 'geometry'] = gdf.loc[invalid, 'geometry'].buffer(0)
        print(f"  ✓ Fixed {invalid.sum()} geometries")
    
    return gdf


def load_real_data(parcel_path: str, zoning_path: str, output_dir: str = "data/austin"):
    """Load and validate real Austin data with field mapping and geometry fixes."""
    import geopandas as gpd
    from datetime import datetime
    
    parcel_file = Path(parcel_path)
    zoning_file = Path(zoning_path)
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    
    if not parcel_file.exists():
        raise FileNotFoundError(f"Parcel file not found: {parcel_path}")
    if not zoning_file.exists():
        raise FileNotFoundError(f"Zoning file not found: {zoning_path}")
    
    print(f"Validating parcel data: {parcel_path}")
    parcel_data = validate_parcel_data(parcel_file)
    print(f"✓ Parcel data valid: {parcel_data['count']} features, APN field: {parcel_data['apn_field']}")
    
    print(f"Validating zoning data: {zoning_path}")
    zoning_data = validate_zoning_data(zoning_file)
    print(f"✓ Zoning data valid: {zoning_data['count']} features, zone field: {zoning_data['zone_field']}")
    
    # Load with GeoPandas for CRS handling and geometry fixes
    print(f"\nLoading and processing data...")
    parcels_gdf = gpd.read_file(parcel_file)
    zoning_gdf = gpd.read_file(zoning_file)
    
    # Detect and report CRS
    parcel_crs = parcels_gdf.crs
    zoning_crs = zoning_gdf.crs
    print(f"  Parcel CRS: {parcel_crs}")
    print(f"  Zoning CRS: {zoning_crs}")
    
    # Transform to internal CRS (EPSG:2277 for Austin)
    target_crs = "EPSG:2277"
    if parcel_crs and str(parcel_crs) != target_crs:
        print(f"  Transforming parcels to {target_crs}...")
        parcels_gdf = parcels_gdf.to_crs(target_crs)
    elif not parcel_crs:
        print(f"  Warning: No CRS detected for parcels, assuming EPSG:4326")
        parcels_gdf.set_crs("EPSG:4326", inplace=True)
        parcels_gdf = parcels_gdf.to_crs(target_crs)
    
    if zoning_crs and str(zoning_crs) != target_crs:
        print(f"  Transforming zoning to {target_crs}...")
        zoning_gdf = zoning_gdf.to_crs(target_crs)
    elif not zoning_crs:
        print(f"  Warning: No CRS detected for zoning, assuming EPSG:4326")
        zoning_gdf.set_crs("EPSG:4326", inplace=True)
        zoning_gdf = zoning_gdf.to_crs(target_crs)
    
    # Fix geometries
    print(f"  Fixing geometries...")
    parcels_gdf = fix_geometries(parcels_gdf)
    zoning_gdf = fix_geometries(zoning_gdf)
    
    # Normalize field names (rename to standard names)
    if parcel_data['apn_field'] != 'APN':
        print(f"  Mapping parcel field: {parcel_data['apn_field']} → APN")
        parcels_gdf = parcels_gdf.rename(columns={parcel_data['apn_field']: 'APN'})
    
    if zoning_data['zone_field'] != 'zone':
        print(f"  Mapping zoning field: {zoning_data['zone_field']} → zone")
        zoning_gdf = zoning_gdf.rename(columns={zoning_data['zone_field']: 'zone'})
    
    # Save processed data
    parcels_gdf.to_file(output / "parcels.geojson", driver="GeoJSON")
    zoning_gdf.to_file(output / "zoning.geojson", driver="GeoJSON")
    
    print(f"\n✓ Data processed and saved to {output}/")
    print(f"✓ Parcels: {output}/parcels.geojson ({len(parcels_gdf)} features)")
    print(f"✓ Zoning: {output}/zoning.geojson ({len(zoning_gdf)} features)")
    
    # Create metadata file
    metadata = {
        "parcel_source": str(parcel_file),
        "zoning_source": str(zoning_file),
        "parcel_count": len(parcels_gdf),
        "zoning_count": len(zoning_gdf),
        "apn_field": "APN",
        "zone_field": "zone",
        "source_crs_parcels": str(parcel_crs) if parcel_crs else "EPSG:4326 (assumed)",
        "source_crs_zoning": str(zoning_crs) if zoning_crs else "EPSG:4326 (assumed)",
        "target_crs": target_crs,
        "loaded_date": datetime.now().isoformat(),
        "version": "1.0.1-dev"
    }
    
    with open(output / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"✓ Metadata saved to {output}/metadata.json")
    return metadata


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: load_real_data.py <parcel_file> <zoning_file> [output_dir]")
        print("\nExample:")
        print("  python3 scripts/load_real_data.py /path/to/parcels.geojson /path/to/zoning.geojson")
        sys.exit(1)
    
    parcel_path = sys.argv[1]
    zoning_path = sys.argv[2]
    output_dir = sys.argv[3] if len(sys.argv) > 3 else "data/austin"
    
    try:
        metadata = load_real_data(parcel_path, zoning_path, output_dir)
        print("\n✓ Real data integration complete!")
        print(f"  Parcels: {metadata['parcel_count']}")
        print(f"  Zoning districts: {metadata['zoning_count']}")
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)

