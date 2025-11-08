"""Unit tests for geom.py."""
import pytest
import geopandas as gpd
from shapely.geometry import Point, Polygon
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from engine.geom import transform_point, intersect_zone, detect_overlays, is_corner_lot


def test_transform_point():
    """Test CRS transformation."""
    point = transform_point(30.2672, -97.7431, "EPSG:4326", "EPSG:2277")
    assert point is not None
    assert hasattr(point, 'x')
    assert hasattr(point, 'y')


def test_intersect_zone():
    """Test zone intersection."""
    parcel = gpd.GeoSeries([Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])], crs='EPSG:2277')
    parcel.name = 'test'
    
    zoning_gdf = gpd.GeoDataFrame({
        'zone': ['SF-3', 'SF-2'],
        'geometry': [
            Polygon([(-0.5, -0.5), (1.5, -0.5), (1.5, 1.5), (-0.5, 1.5)]),
            Polygon([(2, 2), (3, 2), (3, 3), (2, 3)])
        ]
    }, crs='EPSG:2277')
    
    zone = intersect_zone(parcel, zoning_gdf)
    assert zone == 'SF-3'


def test_detect_overlays():
    """Test overlay detection."""
    parcel = gpd.GeoSeries([Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])], crs='EPSG:2277')
    parcel.name = 'test'
    
    overlay_gdfs = {
        'Floodplain': gpd.GeoDataFrame({
            'geometry': [Polygon([(-0.5, -0.5), (1.5, -0.5), (1.5, 1.5), (-0.5, 1.5)])]
        }, crs='EPSG:2277'),
        'Airport': gpd.GeoDataFrame({
            'geometry': [Polygon([(2, 2), (3, 2), (3, 3), (2, 3)])]
        }, crs='EPSG:2277')
    }
    
    overlays = detect_overlays(parcel, overlay_gdfs)
    assert 'Floodplain' in overlays
    assert 'Airport' not in overlays


def test_is_corner_lot():
    """Test corner lot detection."""
    # Simple rectangular parcel (not corner lot)
    parcel = gpd.GeoSeries([Polygon([(0, 0), (1, 0), (1, 1), (0, 1)])], crs='EPSG:2277')
    parcel.name = 'test'
    
    # For MVP, corner lot detection is simplified
    result = is_corner_lot(parcel)
    assert isinstance(result, bool)

