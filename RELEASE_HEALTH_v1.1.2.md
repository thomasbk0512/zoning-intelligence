# Release Health Report: v1.1.2

**Release**: [v1.1.2 — Observability](https://github.com/thomasbk0512/zoning-intelligence/releases/tag/v1.1.2)  
**Tag**: `v1.1.2`  
**Generated**: 2025-11-09

## CI Status

**Post-tag CI on main**: ✅ Green

All CI workflows completed successfully after the v1.1.2 release.

## CI Artifacts

### Artifact: `observability-artifacts`

**Status**: Available (if present in latest CI run)

**Contents**:
- `cache/logs/**`: Structured log files (JSON format)
- `metrics.json`: Aggregated metrics from telemetry
- `ui/lhci/**`: Lighthouse CI reports (if enabled)

**Access**: Download from the latest GitHub Actions run under "Artifacts" section.

**Note**: Artifacts are retained for 7 days. If no artifacts are present, this indicates:
- No CLI runs occurred in CI
- Metrics emission was not triggered
- Lighthouse CI is disabled (default)

## Metrics Summary

If `metrics.json` is present in artifacts, it contains:

```json
{
  "ts": "2025-11-09T...Z",
  "parcels_processed": <number>,
  "rules_applied": <number>,
  "total_runtime_ms": <number>,
  "errors_count": <number>,
  "warnings_count": <number>
}
```

**Fields**:
- `parcels_processed`: Number of parcels processed
- `rules_applied`: Number of zoning rules applied
- `total_runtime_ms`: Total execution time in milliseconds
- `errors_count`: Number of errors encountered
- `warnings_count`: Number of warnings encountered
- `ts`: Timestamp (ISO 8601)

**Current Status**: Metrics will be available after first CLI execution in CI with `--verbose` flag.

## Observability Features

✅ **Structured Logging**: Enabled
- Console: INFO level and above (JSON)
- Files: DEBUG level and above (JSON) in `cache/logs/`

✅ **Metrics Collection**: Enabled
- Counters: `parcels_processed`, `rules_applied`, `errors_count`, `warnings_count`
- Timers: `total_runtime_ms`, `data_load_ms`, `parcel_lookup_ms`, `rules_ms`

✅ **CI Artifact Upload**: Configured
- Automatic upload on every CI run
- Graceful handling of missing files (`if-no-files-found: ignore`)

✅ **UI Diagnostics**: Available
- Endpoint: `ui/diagnostics.json`
- Includes version, build time, feature flags

## Next Steps

1. Enable optional quality gates (E2E, Lighthouse) via repository variables if needed
2. Monitor metrics over time to identify performance trends
3. Review logs for any warnings or errors
4. See `OBSERVABILITY.md` for detailed usage instructions

## Related

- [OBSERVABILITY.md](OBSERVABILITY.md) - Observability guide
- [CI_QUALITY_GATES.md](CI_QUALITY_GATES.md) - Quality gates documentation
- [Release Notes](https://github.com/thomasbk0512/zoning-intelligence/releases/tag/v1.1.2)

