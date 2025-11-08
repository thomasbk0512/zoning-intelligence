"""GeoJSON/Shapefile loading with CRS transformation."""
import geopandas as gpd
from pathlib import Path
from typing import Optional


def load_geofile(filepath: str, target_crs: str = "EPSG:2277") -> gpd.GeoDataFrame:
    """
    Load GeoJSON or Shapefile and transform to target CRS.
    
    Args:
        filepath: Path to GeoJSON or Shapefile
        target_crs: Target CRS (default: EPSG:2277 for Austin)
    
    Returns:
        GeoDataFrame in target CRS with spatial index
    """
    path = Path(filepath)
    if not path.exists():
        raise FileNotFoundError(f"Geo file not found: {filepath}")
    
    gdf = gpd.read_file(filepath)
    
    # Transform to target CRS if needed
    if gdf.crs is None:
        # Assume WGS84 if no CRS specified
        gdf.set_crs("EPSG:4326", inplace=True)
    
    if gdf.crs != target_crs:
        gdf = gdf.to_crs(target_crs)
    
    # Ensure spatial index exists
    if not gdf.has_sindex:
        gdf.sindex
    
    return gdf


def find_parcel_by_apn(gdf: gpd.GeoDataFrame, apn: str, apn_field: str = "APN") -> Optional[gpd.GeoSeries]:
    """Find parcel by APN field."""
    matches = gdf[gdf[apn_field] == apn]
    if len(matches) == 0:
        return None
    return matches.iloc[0]


def find_nearest_parcel(gdf: gpd.GeoDataFrame, lat: float, lng: float, 
                       source_crs: str = "EPSG:4326", target_crs: str = "EPSG:2277") -> Optional[gpd.GeoSeries]:
    """Find nearest parcel to lat/lng point."""
    from shapely.geometry import Point
    
    # Create point in source CRS
    point = Point(lng, lat)
    point_gdf = gpd.GeoDataFrame([1], geometry=[point], crs=source_crs)
    
    # Transform to target CRS
    point_gdf = point_gdf.to_crs(target_crs)
    query_point = point_gdf.geometry.iloc[0]
    
    # Use spatial index for nearest neighbor
    if not gdf.has_sindex:
        gdf.sindex
    
    # Find nearest using sindex.nearest (takes geometry, not bounds)
    # Returns array of indices - handle both scalar and array returns
    nearest_result = gdf.sindex.nearest(query_point, return_all=False)
    if len(nearest_result) == 0:
        return None
    
    # Handle array return (may be 2D)
    if hasattr(nearest_result, 'shape') and len(nearest_result.shape) > 1:
        nearest_indices = nearest_result.flatten()
    else:
        nearest_indices = nearest_result if hasattr(nearest_result, '__iter__') else [nearest_result]
    
    # Get actual nearest by distance
    distances = gdf.geometry.iloc[nearest_indices].distance(query_point)
    nearest_idx = distances.idxmin()
    
    return gdf.loc[nearest_idx]

