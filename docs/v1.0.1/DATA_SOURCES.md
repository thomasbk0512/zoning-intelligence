# Austin Data Sources

## Official Data Sources

### Parcel Data
- **Austin Open Data Portal**: https://data.austintexas.gov
- **Dataset**: "Parcels" or "Property Parcels"
- **Format**: GeoJSON or Shapefile
- **Required Fields**: APN (or PARCEL_ID)
- **CRS**: EPSG:2277 (Texas State Plane Central) or EPSG:4326

### Zoning Data
- **Austin Open Data Portal**: https://data.austintexas.gov
- **Dataset**: "Zoning Districts" or "Zoning"
- **Format**: GeoJSON or Shapefile
- **Required Fields**: zone (or ZONE, zoning, ZONE_CODE)
- **CRS**: EPSG:2277 or EPSG:4326

## Download Instructions

1. Visit https://data.austintexas.gov
2. Search for "parcels" and "zoning"
3. Download GeoJSON or Shapefile format
4. Verify CRS and field names
5. Run validation script

## Alternative Sources

- **City of Austin GIS**: https://www.austintexas.gov/gis
- **Travis County Appraisal District**: https://www.traviscad.org

## Data Requirements

- Parcels: Must include APN field
- Zoning: Must include zone code field
- CRS: Will be transformed to EPSG:2277 if needed
- Coverage: Full Austin city limits preferred

