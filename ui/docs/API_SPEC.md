# API Specification

## Endpoints

### GET /zoning

Get zoning information for a property.

#### Query Parameters

**Option 1: Search by APN**
- `apn` (string, required): Assessor's Parcel Number
- `city` (string, required): City name (e.g., 'austin')

**Option 2: Search by Location**
- `latitude` (number, required): Latitude
- `longitude` (number, required): Longitude
- `city` (string, required): City name (e.g., 'austin')

#### Response

```json
{
  "apn": "0204050712",
  "jurisdiction": "Austin, TX",
  "zone": "SF-3",
  "setbacks_ft": {
    "front": 25,
    "side": 5,
    "rear": 10,
    "street_side": 0
  },
  "height_ft": 35,
  "far": 0.4,
  "lot_coverage_pct": 40,
  "overlays": [],
  "sources": [
    {
      "type": "map",
      "cite": "austin_zoning_v2024"
    }
  ],
  "notes": "",
  "run_ms": 150
}
```

#### Error Response

```json
{
  "error": "Error message"
}
```

## Backend CLI Contract

The backend CLI uses:

```bash
python3 zoning.py --apn <APN> --city <city> --out out.json
python3 zoning.py --lat <lat> --lng <lng> --city <city> --out out.json
```

The UI will need to wrap this in an API service or call the CLI directly.

