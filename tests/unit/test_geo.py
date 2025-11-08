"""Unit tests for geo.py."""
import pytest
import geopandas as gpd
from shapely.geometry import Point, Polygon
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from parsers.geo import load_geofile, find_parcel_by_apn, find_nearest_parcel


def test_load_geofile(tmp_path):
    """Test loading GeoJSON file."""
    # Create test GeoJSON
    geojson = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {"APN": "12345"},
            "geometry": {
                "type": "Point",
                "coordinates": [-97.7431, 30.2672]
            }
        }]
    }
    
    import json
    test_file = tmp_path / "test.geojson"
    with open(test_file, 'w') as f:
        json.dump(geojson, f)
    
    gdf = load_geofile(str(test_file))
    assert len(gdf) == 1
    assert gdf.crs is not None


def test_find_parcel_by_apn():
    """Test finding parcel by APN."""
    gdf = gpd.GeoDataFrame({
        'APN': ['12345', '67890'],
        'geometry': [Point(0, 0), Point(1, 1)]
    }, crs='EPSG:4326')
    
    parcel = find_parcel_by_apn(gdf, '12345')
    assert parcel is not None
    assert parcel['APN'] == '12345'
    
    parcel = find_parcel_by_apn(gdf, '99999')
    assert parcel is None


def test_find_nearest_parcel():
    """Test finding nearest parcel to lat/lng."""
    gdf = gpd.GeoDataFrame({
        'APN': ['12345', '67890'],
        'geometry': [
            Point(-97.7431, 30.2672),  # Austin area
            Point(-97.7500, 30.2700)
        ]
    }, crs='EPSG:4326')
    
    # Transform to projected CRS for distance calculations
    gdf = gdf.to_crs('EPSG:2277')
    
    parcel = find_nearest_parcel(gdf, 30.2672, -97.7431)
    assert parcel is not None
    assert parcel['APN'] == '12345'

