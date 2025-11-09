# v1.1.2 — Observability (telemetry + CI artifacts)

## Summary

Adds structured logging, metrics collection, and CI artifact uploads to enable observability across the CLI and UI.

## Changes

### Structured Logging
- **JSON-formatted logs** to stdout (INFO) and files (DEBUG)
- Logs written to `cache/logs/` directory
- Includes timestamps, levels, and structured context

### Metrics Collection
- **Counters**: `parcels_processed`, `rules_applied`, `errors_count`, `warnings_count`
- **Timers**: `total_runtime_ms`, `data_load_ms`, `parcel_lookup_ms`, `rules_ms`
- Metrics emitted to JSON file after execution
- Aggregation script: `scripts/emit_metrics.py`

### CI Artifacts
- **Automatic upload** of logs, metrics, and Lighthouse reports
- Artifacts retained for 7 days
- Upload succeeds even if artifacts are empty (no CI failures)

### UI Diagnostics
- **Lightweight diagnostics endpoint**: `ui/diagnostics.json`
- Includes version, build time, and feature flags
- Consumable by Lighthouse CI for custom metrics

### Documentation
- **OBSERVABILITY.md**: Complete guide to logs, metrics, and artifacts
- Includes examples, troubleshooting, and best practices

## Files Changed

- `zoning/engine/telemetry.py` (new): Telemetry helpers
- `zoning/zoning.py`: Integrated telemetry (timers, counters, logging)
- `zoning/scripts/emit_metrics.py` (new): Metrics aggregation script
- `ui/diagnostics.json` (new): UI diagnostics endpoint
- `.github/workflows/ci.yml`: Added metrics emission and artifact upload
- `OBSERVABILITY.md` (new): Observability documentation
- `cache/logs/.gitkeep` (new): Ensure logs directory exists

## How to Access Artifacts

### Local Development

**View logs**:
```bash
tail -f cache/logs/zoning_*.log | jq
```

**View metrics**:
```bash
python3 zoning.py --apn 0204050712 --city austin --out out.json --verbose
cat out_metrics.json | jq
```

**UI diagnostics**:
```bash
cat ui/diagnostics.json | jq
```

### CI Artifacts

1. Go to the GitHub Actions run
2. Click on the "observability-artifacts" artifact
3. Download and extract
4. Explore:
   - `cache/logs/`: All log files
   - `metrics.json`: Aggregated metrics
   - `ui/lhci/`: Lighthouse reports (if enabled)

## Verification

- ✅ CLI runs without changing result schema (11 fields, ±0.1 ft tolerance)
- ✅ CI remains green; artifact upload succeeds even when empty
- ✅ Metrics include: `parcels_processed`, `rules_applied`, `total_runtime_ms`, `errors_count`, `ts`
- ✅ Logs are structured JSON with timestamps and levels

## Related

- Milestone: v1.1.2 — Observability
- See `OBSERVABILITY.md` for detailed usage instructions

