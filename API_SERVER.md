# Zoning Intelligence API Server

The API server provides a REST API for querying zoning information. It wraps the CLI functionality in a FastAPI web service.

## Quick Start

### 1. Install Dependencies

```bash
# Create virtual environment (if not already created)
python3 -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On macOS/Linux
# OR
.venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Start the Server

```bash
# Activate virtual environment first
source .venv/bin/activate

# Start the server
python3 api.py
```

Or use the startup script:

```bash
./start_api.sh
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check

```bash
GET /health
```

Returns: `{"status": "healthy"}`

### Get Zoning Information

```bash
GET /zoning?apn=<APN>&city=<city>
# OR
GET /zoning?latitude=<lat>&longitude=<lng>&city=<city>
```

**Parameters:**
- `apn` (optional): Assessor's Parcel Number
- `latitude` (optional): Latitude coordinate
- `longitude` (optional): Longitude coordinate
- `city` (optional, default: "austin"): City/jurisdiction

**Note:** Either `apn` OR both `latitude` and `longitude` must be provided.

**Example:**

```bash
# Query by APN
curl "http://localhost:8000/zoning?apn=0204050712&city=austin"

# Query by coordinates
curl "http://localhost:8000/zoning?latitude=30.2672&longitude=-97.7431&city=austin"
```

**Response:**

Returns a JSON object with the 11-field schema:
- `apn`: Assessor's Parcel Number
- `jurisdiction`: Jurisdiction name
- `zone`: Zoning designation
- `setbacks_ft`: Setback distances (front, side, rear, street_side)
- `height_ft`: Height limit
- `far`: Floor Area Ratio
- `lot_coverage_pct`: Lot coverage percentage
- `overlays`: Overlay districts
- `sources`: Data sources
- `notes`: Additional notes
- `run_ms`: Query execution time

## Running in Background

To run the server in the background:

```bash
# Start in background
python3 api.py > api_server.log 2>&1 &

# Check if it's running
curl http://localhost:8000/health

# Stop the server (find PID first)
ps aux | grep api.py
kill <PID>
```

## Troubleshooting

### Port Already in Use

If port 8000 is already in use:

```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process or change the port in api.py
```

### Module Not Found Errors

Make sure you've activated the virtual environment and installed all dependencies:

```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### Data Files Not Found

Ensure the data files exist:
- `data/austin/parcels.geojson`
- `data/austin/zoning.geojson`
- `rules/austin.yaml`

## Development

The API server is built with:
- **FastAPI**: Modern, fast web framework
- **Uvicorn**: ASGI server
- **CORS**: Enabled for all origins (configure for production)

## Production Deployment

For production:
1. Configure CORS to allow only specific origins
2. Use a production ASGI server (e.g., Gunicorn with Uvicorn workers)
3. Set up proper logging
4. Configure environment variables for configuration
5. Use a reverse proxy (nginx) for HTTPS

