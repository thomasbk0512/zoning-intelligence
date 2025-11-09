#!/bin/bash
# Start the Zoning Intelligence API Server

cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Start the API server
python3 api.py

