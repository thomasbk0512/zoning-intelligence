# Release v1.0.0

## Zoning Intelligence CLI MVP

**Release Date**: 2024-11-08  
**Status**: Production Ready

## Features

- **Input**: APN or lat/lng coordinates
- **Output**: Frozen JSON schema with zone, setbacks, height, FAR, lot coverage, overlays
- **Offline mode**: Works with cached data
- **Versioned rules**: YAML-based rule definitions per jurisdiction
- **Performance**: P95 runtime ≤60s per parcel (actual: 129ms)

## Installation

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

For reproducible builds:
```bash
pip install -r requirements-lock.txt
```

## Usage

```bash
python3 zoning.py --apn 0204050712 --city austin --out out.json
```

## Test Results

- **Unit Tests**: 16/16 passing
- **Golden Tests**: 20/20 passing
- **Total**: 36/36 tests passing

## Performance

- **Runtime**: 129ms per parcel (465x under 60s target)
- **Memory**: <1GB per run
- **Schema Validation**: All 11 required fields validated

## Output Schema

```json
{
  "apn": "string",
  "jurisdiction": "string",
  "zone": "string",
  "setbacks_ft": {"front": 0, "side": 0, "rear": 0, "street_side": 0},
  "height_ft": 0,
  "far": 0,
  "lot_coverage_pct": 0,
  "overlays": [],
  "sources": [{"type": "code", "cite": "string"}],
  "notes": "string",
  "run_ms": 0
}
```

## Dependencies

- geopandas>=0.14.0
- shapely>=2.0.0
- pyyaml>=6.0
- PyPDF2>=3.0.0
- pytest>=7.4.0

See `requirements-lock.txt` for pinned versions.

## Known Limitations (MVP)

- Austin, TX jurisdiction only
- Single APN per run
- Simplified corner lot detection
- Basic PDF regex extraction (LLM stub)

## Changelog

### v1.0.0 (2024-11-08)
- Initial MVP release
- Core CLI functionality
- GeoJSON/Shapefile support
- YAML rule engine
- PDF code extraction
- Test framework (unit + golden)

