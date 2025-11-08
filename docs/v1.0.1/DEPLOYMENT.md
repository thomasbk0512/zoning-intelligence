# Deployment Guide v1.0.0

## Quick Start

```bash
# 1. Clone/checkout v1.0.0
git checkout v1.0.0

# 2. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run tests
make test

# 5. Run CLI
python3 zoning.py --apn 0204050712 --city austin --out out.json
```

## Production Smoke Test

```bash
python3 zoning.py --apn 0204050712 --city austin --out smoke_test.json
python3 -m json.tool smoke_test.json
```

Expected: Valid JSON with 11 fields, runtime <1000ms

## Reproducible Build

For exact dependency versions:
```bash
pip install -r requirements-lock.txt
```

## Verification

- [x] All tests passing (36/36)
- [x] Schema validation working
- [x] Runtime <60s (actual: 129ms)
- [x] Valid JSON output
- [x] Dependencies pinned

## Release Artifacts

- `zoning.py`: Main CLI (166 LOC)
- `requirements.txt`: Dependency specs
- `requirements-lock.txt`: Pinned versions
- `RELEASE.md`: Release notes
- `README.md`: Documentation
