# Observability Guide

This document describes how to access and interpret logs, metrics, and diagnostics for the Zoning Intelligence CLI and UI.

## Overview

The observability system provides:
- **Structured logging**: JSON-formatted logs to stdout (INFO) and files (DEBUG)
- **Metrics**: Counters and timers for performance and usage tracking
- **CI Artifacts**: Automated collection of logs and metrics in CI runs
- **UI Diagnostics**: Lightweight endpoint for build/version information

## Structured Logging

### Local Development

Logs are written to:
- **Console**: INFO level and above, JSON format
- **Files**: DEBUG level and above, JSON format, under `cache/logs/`

Example log entry:
```json
{
  "ts": "2025-11-09T12:34:56.789Z",
  "level": "INFO",
  "logger": "zoning",
  "message": "Parcel found",
  "parcel_lookup_ms": 45.2,
  "apn": "0204050712"
}
```

### Reading Logs

**Console output** (during CLI execution):
```bash
python3 zoning.py --apn 0204050712 --city austin --out out.json --verbose
```

**Log files**:
```bash
# List log files
ls -lh cache/logs/

# View latest log
tail -f cache/logs/zoning_*.log | jq

# Search for errors
grep -h '"level":"ERROR"' cache/logs/*.log | jq

# Count log entries by level
grep -h '"level"' cache/logs/*.log | jq -r '.level' | sort | uniq -c
```

### Log Levels

- **DEBUG**: Detailed diagnostic information (timers, counters, internal state)
- **INFO**: General informational messages (parcel found, rules applied)
- **WARNING**: Warning messages (timer not found, fallback used)
- **ERROR**: Error conditions (APN not found, data files missing)

## Metrics

### Metrics Schema

Metrics are emitted as JSON with the following structure:

```json
{
  "ts": "2025-11-09T12:34:56.789Z",
  "parcels_processed": 1,
  "rules_applied": 1,
  "total_runtime_ms": 1234.56,
  "errors_count": 0,
  "warnings_count": 0
}
```

### Available Metrics

- **parcels_processed**: Number of parcels processed
- **rules_applied**: Number of zoning rules applied
- **total_runtime_ms**: Total execution time in milliseconds
- **errors_count**: Number of errors encountered
- **warnings_count**: Number of warnings encountered

### Accessing Metrics

**Local execution**:
```bash
# Run CLI with verbose flag to emit metrics
python3 zoning.py --apn 0204050712 --city austin --out out.json --verbose

# Metrics are written to out_metrics.json
cat out_metrics.json | jq
```

**Manual emission**:
```bash
# After running CLI, aggregate metrics
python3 zoning/scripts/emit_metrics.py --output metrics.json
cat metrics.json | jq
```

**CI artifacts**:
1. Go to the GitHub Actions run
2. Click on the "observability-artifacts" artifact
3. Download and extract
4. View `metrics.json`

## CI Artifacts

### Artifact Contents

Every CI run uploads (if present):
- `cache/logs/**`: All log files from the run
- `metrics.json`: Aggregated metrics
- `ui/lhci/**`: Lighthouse CI reports (if enabled)

### Accessing Artifacts

1. Navigate to the GitHub Actions tab
2. Select a workflow run
3. Scroll to the "Artifacts" section
4. Download "observability-artifacts"
5. Extract and explore the contents

### Artifact Retention

Artifacts are retained for **7 days** by default. To extend retention:
- Go to repository Settings → Actions → Artifacts
- Adjust retention period

## UI Diagnostics

### Diagnostics Endpoint

The UI provides a lightweight diagnostics JSON at:
- **File**: `ui/diagnostics.json`
- **Endpoint**: `/diagnostics.json` (if served)

### Diagnostics Schema

```json
{
  "version": "1.1.2",
  "build_time": "2025-11-09T00:00:00Z",
  "environment": "production",
  "features": {
    "telemetry": true,
    "metrics": true,
    "structured_logging": true
  },
  "endpoints": {
    "api": "/api",
    "diagnostics": "/diagnostics.json"
  }
}
```

### Accessing Diagnostics

**Local development**:
```bash
cat ui/diagnostics.json | jq
```

**Production**:
```bash
curl https://your-domain.com/diagnostics.json | jq
```

**Lighthouse CI**:
The diagnostics endpoint can be consumed by Lighthouse CI for custom metrics collection.

## Troubleshooting

### No Logs Generated

- Ensure `cache/logs/` directory exists and is writable
- Check that the CLI is using the telemetry module
- Verify log level is set appropriately

### Metrics Missing

- Run CLI with `--verbose` flag to enable metrics emission
- Check that `emit_metrics()` is called after execution
- Verify `metrics.json` is not gitignored

### CI Artifacts Empty

- Artifacts are uploaded even if empty (by design)
- Check that jobs completed successfully
- Verify artifact paths match expected locations

### Performance Impact

- Structured logging adds minimal overhead (~1-2ms per log entry)
- Metrics collection is in-memory and fast
- File I/O is asynchronous where possible

## Best Practices

1. **Log Levels**: Use appropriate log levels (DEBUG for development, INFO for production)
2. **Metrics**: Emit metrics at the end of execution, not during
3. **Artifacts**: Keep artifact sizes reasonable (<100MB per run)
4. **Retention**: Clean up old logs periodically (CI handles this automatically)
5. **Privacy**: Ensure no sensitive data (APNs, coordinates) in logs/metrics

## Examples

### Parse Logs with jq

```bash
# Extract all error messages
jq -r 'select(.level=="ERROR") | .message' cache/logs/*.log

# Calculate average parcel lookup time
jq -r 'select(.parcel_lookup_ms) | .parcel_lookup_ms' cache/logs/*.log | \
  awk '{sum+=$1; count++} END {print sum/count "ms"}'

# Count errors by type
jq -r 'select(.level=="ERROR") | .error_type // "unknown"' cache/logs/*.log | \
  sort | uniq -c
```

### Analyze Metrics

```bash
# View metrics summary
cat metrics.json | jq '{
  parcels: .parcels_processed,
  rules: .rules_applied,
  runtime_ms: .total_runtime_ms,
  errors: .errors_count
}'

# Compare metrics across runs
for f in metrics_*.json; do
  echo "=== $f ==="
  jq '{runtime: .total_runtime_ms, errors: .errors_count}' "$f"
done
```

## Related Documentation

- [CI Workflow](../.github/workflows/ci.yml)
- [Telemetry Module](../zoning/engine/telemetry.py)
- [Metrics Script](../zoning/scripts/emit_metrics.py)

