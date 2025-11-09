"""
Telemetry helpers for structured logging and metrics collection.
"""
import json
import logging
import os
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

# Global metrics store
_metrics: Dict[str, Any] = defaultdict(int)
_timers: Dict[str, float] = {}
_logger: Optional[logging.Logger] = None


def _ensure_logger() -> logging.Logger:
    """Initialize structured logger if not already created."""
    global _logger
    if _logger is not None:
        return _logger
    
    # Create logs directory
    log_dir = Path("cache/logs")
    log_dir.mkdir(parents=True, exist_ok=True)
    
    # Configure JSON formatter
    class JSONFormatter(logging.Formatter):
        def format(self, record: logging.LogRecord) -> str:
            log_entry = {
                "ts": datetime.utcnow().isoformat() + "Z",
                "level": record.levelname,
                "logger": record.name,
                "message": record.getMessage(),
            }
            # Add extra fields if present
            if hasattr(record, "extra"):
                log_entry.update(record.extra)
            return json.dumps(log_entry)
    
    # Create logger
    logger = logging.getLogger("zoning")
    logger.setLevel(logging.DEBUG)
    logger.propagate = False
    
    # Console handler (INFO level, JSON)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(JSONFormatter())
    logger.addHandler(console_handler)
    
    # File handler (DEBUG level, JSON)
    log_file = log_dir / f"zoning_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(JSONFormatter())
    logger.addHandler(file_handler)
    
    _logger = logger
    return logger


def log(level: str, message: str, **extra: Any) -> None:
    """Emit structured log entry."""
    logger = _ensure_logger()
    log_level = getattr(logging, level.upper(), logging.INFO)
    logger.log(log_level, message, extra={"extra": extra})


def start_timer(name: str) -> None:
    """Start a named timer."""
    _timers[name] = time.time()
    log("debug", f"Timer started: {name}", timer=name, action="start")


def stop_timer(name: str) -> float:
    """Stop a named timer and return elapsed seconds."""
    if name not in _timers:
        log("warning", f"Timer not found: {name}", timer=name)
        return 0.0
    
    elapsed = time.time() - _timers[name]
    del _timers[name]
    log("debug", f"Timer stopped: {name}", timer=name, elapsed_ms=elapsed * 1000)
    return elapsed


def incr(counter: str, value: int = 1) -> None:
    """Increment a counter metric."""
    _metrics[counter] += value
    log("debug", f"Counter incremented: {counter}", counter=counter, value=value, total=_metrics[counter])


def set_gauge(gauge: str, value: float) -> None:
    """Set a gauge metric."""
    _metrics[gauge] = value
    log("debug", f"Gauge set: {gauge}", gauge=gauge, value=value)


def emit_metrics(output_path: Optional[str] = None) -> Dict[str, Any]:
    """Emit all collected metrics to JSON."""
    metrics = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "parcels_processed": _metrics.get("parcels_processed", 0),
        "rules_applied": _metrics.get("rules_applied", 0),
        "total_runtime_ms": _metrics.get("total_runtime_ms", 0),
        "errors_count": _metrics.get("errors_count", 0),
        "warnings_count": _metrics.get("warnings_count", 0),
    }
    
    # Add any other metrics
    for key, value in _metrics.items():
        if key not in metrics:
            metrics[key] = value
    
    if output_path:
        output_file = Path(output_path)
        output_file.parent.mkdir(parents=True, exist_ok=True)
        with open(output_file, "w") as f:
            json.dump(metrics, f, indent=2)
        log("info", f"Metrics emitted to {output_path}", metrics_file=output_path)
    
    return metrics


def reset_metrics() -> None:
    """Reset all metrics (useful for testing)."""
    global _metrics, _timers
    _metrics.clear()
    _timers.clear()

