#!/usr/bin/env python3
"""
Convert metrics.json to a compact markdown table.
"""
import argparse
import json
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description="Convert metrics.json to markdown table")
    parser.add_argument(
        "--input",
        "-i",
        default="metrics.json",
        help="Input metrics JSON file (default: metrics.json)",
    )
    parser.add_argument(
        "--output",
        "-o",
        default="-",
        help="Output markdown file (default: stdout)",
    )
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        if args.output == "-":
            print("No metrics yet")
        else:
            with open(args.output, "w") as f:
                f.write("No metrics yet\n")
        return 0

    try:
        with open(input_path) as f:
            metrics = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing {args.input}: {e}", file=sys.stderr)
        return 1

    # Build markdown table
    table_rows = [
        "| Metric | Value |",
        "|--------|-------|",
    ]

    # Core metrics
    core_metrics = [
        ("parcels_processed", "Parcels Processed"),
        ("rules_applied", "Rules Applied"),
        ("total_runtime_ms", "Total Runtime (ms)"),
        ("errors_count", "Errors"),
        ("warnings_count", "Warnings"),
    ]

    for key, label in core_metrics:
        value = metrics.get(key, 0)
        table_rows.append(f"| {label} | {value} |")

    # Timestamp
    if "ts" in metrics:
        table_rows.append(f"| Timestamp | {metrics['ts']} |")

    # Additional metrics
    for key, value in sorted(metrics.items()):
        if key not in ["parcels_processed", "rules_applied", "total_runtime_ms", "errors_count", "warnings_count", "ts"]:
            table_rows.append(f"| {key} | {value} |")

    output = "\n".join(table_rows) + "\n"

    if args.output == "-":
        print(output)
    else:
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w") as f:
            f.write(output)

    return 0


if __name__ == "__main__":
    sys.exit(main())

