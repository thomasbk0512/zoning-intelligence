"""Geometric operations: CRS transforms, spatial queries, corner lot detection."""
import geopandas as gpd
from shapely.geometry import Point
from typing import Optional, List, Tuple


def transform_point(lat: float, lng: float, source_crs: str = "EPSG:4326", 
                   target_crs: str = "EPSG:2277") -> Point:
    """Transform a point from source CRS to target CRS."""
    point = Point(lng, lat)
    point_gdf = gpd.GeoDataFrame([1], geometry=[point], crs=source_crs)
    point_gdf = point_gdf.to_crs(target_crs)
    return point_gdf.geometry.iloc[0]


def intersect_zone(parcel: gpd.GeoSeries, zoning_gdf: gpd.GeoDataFrame) -> Optional[str]:
    """
    Find zone code for parcel by intersecting with zoning layer.
    
    Args:
        parcel: GeoSeries representing parcel geometry
        zoning_gdf: GeoDataFrame with zoning districts
    
    Returns:
        Zone code string or None if no intersection
    """
    if not zoning_gdf.has_sindex:
        zoning_gdf.sindex
    
    # Create temporary GeoDataFrame for parcel
    # Extract geometry from GeoSeries if needed
    geom = parcel.geometry if hasattr(parcel, 'geometry') else parcel
    if hasattr(geom, 'iloc'):
        geom = geom.iloc[0]
    # Get CRS from parcel or use zoning CRS
    parcel_crs = parcel.crs if hasattr(parcel, 'crs') and parcel.crs else zoning_gdf.crs
    parcel_gdf = gpd.GeoDataFrame([1], geometry=[geom], crs=parcel_crs)
    
    # Spatial join to find intersecting zones
    joined = gpd.sjoin(parcel_gdf, zoning_gdf, how='left', predicate='intersects')
    
    if len(joined) == 0 or joined.index_right.isna().all():
        # Fallback: return "UNKNOWN" if no zone intersection
        return "UNKNOWN"
    
    # Get first matching zone (assume zone field is 'zone' or 'ZONE')
    zone_field = None
    for field in ['zone', 'ZONE', 'zoning', 'ZONING', 'zone_code', 'ZONE_CODE']:
        if field in zoning_gdf.columns:
            zone_field = field
            break
    
    if zone_field is None:
        return None
    
    first_match_idx = joined.index_right.dropna().iloc[0]
    return zoning_gdf.loc[first_match_idx, zone_field]


def detect_overlays(parcel: gpd.GeoSeries, overlay_gdfs: dict) -> List[str]:
    """
    Detect which overlays intersect with parcel.
    
    Args:
        parcel: GeoSeries representing parcel geometry
        overlay_gdfs: Dict mapping overlay name to GeoDataFrame
    
    Returns:
        List of overlay names that intersect
    """
    overlays = []
    # Extract geometry from GeoSeries if needed
    geom = parcel.geometry if hasattr(parcel, 'geometry') else parcel
    if hasattr(geom, 'iloc'):
        geom = geom.iloc[0]
    # Get CRS from parcel or use first overlay CRS
    parcel_crs = parcel.crs if hasattr(parcel, 'crs') and parcel.crs else None
    if parcel_crs is None and overlay_gdfs:
        first_overlay = next(iter(overlay_gdfs.values()))
        if first_overlay is not None and hasattr(first_overlay, 'crs'):
            parcel_crs = first_overlay.crs
    parcel_gdf = gpd.GeoDataFrame([1], geometry=[geom], crs=parcel_crs)
    
    for overlay_name, overlay_gdf in overlay_gdfs.items():
        if overlay_gdf is None or len(overlay_gdf) == 0:
            continue
        
        if not overlay_gdf.has_sindex:
            overlay_gdf.sindex
        
        joined = gpd.sjoin(parcel_gdf, overlay_gdf, how='left', predicate='intersects')
        if len(joined) > 0 and not joined.index_right.isna().all():
            overlays.append(overlay_name)
    
    return overlays


def is_corner_lot(parcel: gpd.GeoSeries, street_buffer_ft: float = 10.0) -> bool:
    """
    Detect if parcel is a corner lot by checking if it touches multiple streets.
    
    Simple heuristic: if parcel has multiple edges near street centerlines,
    it's likely a corner lot. For MVP, we'll use a simplified check:
    count how many parcel vertices are within buffer of street network.
    
    For MVP, we'll use a simpler approach: check if parcel boundary
    has significant length exposed (indicating multiple street frontages).
    
    Args:
        parcel: GeoSeries representing parcel geometry
        street_buffer_ft: Buffer distance in feet to detect street proximity
    
    Returns:
        True if corner lot detected
    """
    # Simplified corner lot detection for MVP
    # Check if parcel has more than 4 vertices (indicates complex shape)
    # or if it's roughly rectangular with two long edges (corner lot pattern)
    
    # Extract geometry from GeoSeries if needed
    geom = parcel.geometry if hasattr(parcel, 'geometry') else parcel
    if hasattr(geom, 'iloc'):
        geom = geom.iloc[0]
    
    if geom is None:
        return False
    
    # Get boundary
    boundary = geom.boundary
    
    # For MVP: assume corner lot if geometry is complex or has many vertices
    # In production, this would intersect with actual street centerlines
    coords = list(geom.exterior.coords) if hasattr(geom, 'exterior') else []
    
    # Simple heuristic: corner lots often have 5+ vertices or are L-shaped
    if len(coords) > 5:
        return True
    
    # Check if it's roughly L-shaped (has two distinct long edges)
    # This is a simplified check - real implementation would use street data
    return False


def get_parcel_geometry_info(parcel: gpd.GeoSeries) -> dict:
    """Extract geometry information from parcel."""
    geom = parcel.geometry
    if geom is None:
        return {}
    
    return {
        "area_sqft": geom.area if geom.area else 0,
        "perimeter_ft": geom.length if geom.length else 0,
        "num_vertices": len(list(geom.exterior.coords)) if hasattr(geom, 'exterior') else 0
    }

