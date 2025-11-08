UI v1.0.1 – ready for PR
# Zoning Intelligence CLI - MVP

A command-line tool for analyzing zoning regulations for parcels using APN or lat/lng coordinates.

## Features

- **Input**: APN or lat/lng coordinates
- **Output**: Frozen JSON schema with zone, setbacks, height, FAR, lot coverage, overlays
- **Offline mode**: Works with cached data
- **Versioned rules**: YAML-based rule definitions per jurisdiction
- **Performance**: P95 runtime ≤60s per parcel

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Basic Usage

```bash
# Query by APN
python zoning.py --apn 0204050712 --city austin --out out.json

# Query by lat/lng
python zoning.py --lat-lng 30.2672,-97.7431 --city austin --out out.json

# With verbose logging
python zoning.py --apn 0204050712 --city austin --out out.json --verbose

# Offline mode (use cached data only)
python zoning.py --apn 0204050712 --city austin --out out.json --offline

# Custom data directory
python zoning.py --apn 0204050712 --city austin --data-dir ./data --out out.json
```

### CLI Options

- `--apn APN`: Parcel APN (mutually exclusive with --lat-lng)
- `--lat-lng LAT,LNG`: Latitude,Longitude (mutually exclusive with --apn)
- `--city CITY`: City/jurisdiction (e.g., austin)
- `--data-dir DIR`: Data directory (default: current directory)
- `--out FILE`: Output JSON file (required)
- `--verbose`: Enable verbose logging
- `--offline`: Offline mode (use cached data only)
- `--llm`: Enable LLM PDF parsing (requires OPENAI_API_KEY)

## Output Schema

The output JSON follows this frozen schema:

```json
{
  "apn": "0204050712",
  "jurisdiction": "Austin, TX",
  "zone": "SF-3",
  "setbacks_ft": {
    "front": 25,
    "side": 5,
    "rear": 10,
    "street_side": 15
  },
  "height_ft": 35,
  "far": 0.4,
  "lot_coverage_pct": 40,
  "overlays": ["Floodplain", "Airport"],
  "sources": [
    {"type": "code", "cite": "§25-2-492"},
    {"type": "map", "cite": "austin_zoning_v2024"}
  ],
  "notes": "Corner lot; street-side setback applied",
  "run_ms": 4123
}
```

## Project Structure

```
zoning/
  zoning.py                    # Main CLI driver
  /rules
    austin.yaml                # Rule definitions for Austin
  /data
    /austin/
      parcels.geojson          # Parcel layer (5 synthetic parcels)
      zoning.geojson           # Zoning districts
  /pdfs
    /austin/                   # PDF code files
  /parsers
    pdf.py                     # PDF text extraction
    llm.py                     # LLM adapter (stub)
    geo.py                     # GeoJSON/Shapefile loading
  /engine
    apply_rules.py             # Rule engine
    schemas.py                 # Output schema validation
  /tests
    /unit/                     # Unit tests
    /golden/                   # 20 golden test files
    test_zoning.py             # Golden test runner
  /scripts
    generate_samples.py        # Generate synthetic data
  /cache
    §-snippets.json            # Cached PDF sections
```

## Data Sources

### Synthetic Data

The project includes synthetic sample data for testing:

- `data/austin/parcels.geojson`: 5 synthetic parcels
- `data/austin/zoning.geojson`: 3 zoning districts (SF-2, SF-3, MF-1)

To regenerate sample data:

```bash
make generate-samples
```

### Real Data

Replace the synthetic GeoJSON files with real data:

1. **Parcels**: GeoJSON or Shapefile with APN field
2. **Zoning**: GeoJSON or Shapefile with zone field
3. **Overlays**: Optional overlay layers (floodplain, airport, etc.)

## Rules Configuration

Rules are defined in YAML files under `rules/`. Example structure:

```yaml
version: 1
jurisdiction: austin_tx
crs:
  input: EPSG:4326
  internal: EPSG:2277

zones:
  SF-3:
    height_ft: 35
    far: 0.4
    lot_coverage_pct: 40
    setbacks_ft:
      front: 25
      side: 5
      rear: 10
    corner_lot:
      street_side_setback_ft: 15

overlays:
  floodplain:
    rules:
      notes: "additional review required"
```

## Testing

### Unit Tests

```bash
make unit
# or
pytest tests/unit/ -v
```

### Golden Tests

Golden tests validate the CLI output against expected results for 20 test parcels:

```bash
make golden
# or
python3 tests/test_zoning.py
```

### All Tests

```bash
make test
```

## Performance

- **Target**: P95 runtime ≤60s per parcel
- **Memory**: ≤1GB per run
- **Offline mode**: No network requests when `--offline` is set

## Limitations (MVP)

- **Jurisdictions**: Austin, TX only
- **Parcels**: Single APN per run
- **PDF Parsing**: Basic regex extraction; LLM parsing is a stub
- **Corner Lot Detection**: Simplified heuristic (no street network data)
- **Overlays**: Requires overlay layer GeoJSON files

## License

MIT

