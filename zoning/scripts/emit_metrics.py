#!/usr/bin/env python3
"""
Aggregate and emit metrics from telemetry data.
"""
import argparse
import json
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from zoning.engine.telemetry import emit_metrics


def main():
    parser = argparse.ArgumentParser(description="Emit aggregated metrics")
    parser.add_argument(
        "--output",
        "-o",
        default="metrics.json",
        help="Output path for metrics JSON (default: metrics.json)",
    )
    args = parser.parse_args()
    
    # Emit metrics
    metrics = emit_metrics(args.output)
    
    # Print summary
    print(f"Metrics emitted to {args.output}")
    print(f"  Parcels processed: {metrics.get('parcels_processed', 0)}")
    print(f"  Rules applied: {metrics.get('rules_applied', 0)}")
    print(f"  Total runtime (ms): {metrics.get('total_runtime_ms', 0)}")
    print(f"  Errors: {metrics.get('errors_count', 0)}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())

