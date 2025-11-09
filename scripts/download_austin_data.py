import os, json, pathlib, sys
from pathlib import Path
# Minimal stub: write tiny synthetic parcels/zoning if URLs not provided
out = Path(sys.argv[sys.argv.index("--out-dir")+1]) if "--out-dir" in sys.argv else Path("data/raw")
out.mkdir(parents=True, exist_ok=True)
(parcels := out/"parcels.geojson").write_text('{"type":"FeatureCollection","features":[]}')
(zoning  := out/"zoning.geojson").write_text('{"type":"FeatureCollection","features":[]}')
print(f"Stub datasets created at {parcels} and {zoning}")
