import sys, json, pathlib
from pathlib import Path
out = Path(sys.argv[sys.argv.index("--out")+1]) if "--out" in sys.argv else Path("data/austin/derived")
out.mkdir(parents=True, exist_ok=True)
(out/"parcels.geojson").write_text('{"type":"FeatureCollection","features":[]}')
(out/"zoning.geojson").write_text('{"type":"FeatureCollection","features":[]}')
print(f"Derived subset written to {out}")
