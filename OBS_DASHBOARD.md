# Observability Dashboard

Quick view of metrics and system health.

## Metrics Summary

<!-- This section is auto-generated from metrics.json -->
<!-- Run: python3 scripts/metrics_to_md.py --input metrics.json --output - -->

```bash
# To update this dashboard:
python3 scripts/metrics_to_md.py --input metrics.json --output OBS_DASHBOARD.md
```

**Current Status**: No metrics yet

Metrics will appear here after:
1. Running the CLI with `--verbose` flag
2. CI execution with metrics emission
3. Running `scripts/emit_metrics.py`

## Quick Links

- [OBSERVABILITY.md](OBSERVABILITY.md) - Full observability guide
- [RELEASE_HEALTH_v1.1.2.md](RELEASE_HEALTH_v1.1.2.md) - Release health report
- [CI Artifacts](https://github.com/thomasbk0512/zoning-intelligence/actions) - Download logs and metrics

## Metrics Fields

- **parcels_processed**: Number of parcels processed
- **rules_applied**: Number of zoning rules applied
- **total_runtime_ms**: Total execution time in milliseconds
- **errors_count**: Number of errors encountered
- **warnings_count**: Number of warnings encountered

