import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { ZoningResult } from '../types'
import type { Geometry } from 'geojson'

interface MapProps {
  result: ZoningResult
  parcelGeometry?: Geometry
  zoningGeometry?: Geometry
}

export default function Map({ result, parcelGeometry, zoningGeometry }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [showParcel, setShowParcel] = useState(true)
  const [showZoning, setShowZoning] = useState(true)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: [-97.7431, 30.2672], // Austin, TX default
      zoom: 13
    })

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Add parcel layer
  useEffect(() => {
    if (!map.current || !parcelGeometry || !showParcel) return

    const sourceId = 'parcel-source'
    const layerId = 'parcel-layer'

    // Remove existing layer if present
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId)
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId)
    }

    // Add parcel source and layer
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: parcelGeometry,
        properties: {}
      }
    })

    map.current.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': '#3b82f6',
        'fill-opacity': 0.3,
        'fill-outline-color': '#1e40af'
      }
    })

    // Fit bounds to parcel
    const bounds = new maplibregl.LngLatBounds()
    const coords = (parcelGeometry as { type: 'Polygon'; coordinates: number[][][] }).coordinates[0]
    coords.forEach((coord: number[]) => {
      bounds.extend([coord[0], coord[1]])
    })
    map.current.fitBounds(bounds, { padding: 50 })

    return () => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId)
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId)
      }
    }
  }, [parcelGeometry, showParcel])

  // Add zoning layer
  useEffect(() => {
    if (!map.current || !zoningGeometry || !showZoning) return

    const sourceId = 'zoning-source'
    const layerId = 'zoning-layer'

    // Remove existing layer if present
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId)
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId)
    }

    // Add zoning source and layer
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: zoningGeometry,
        properties: { zone: result.zone }
      }
    })

    // Color-code by zone type
    const zoneColor = result.zone.startsWith('SF') ? '#10b981' : 
                     result.zone.startsWith('MF') ? '#f59e0b' : 
                     result.zone.startsWith('CS') ? '#ef4444' : '#6b7280'

    map.current.addLayer({
      id: layerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': zoneColor,
        'fill-opacity': 0.2,
        'fill-outline-color': zoneColor
      }
    })

    return () => {
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId)
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId)
      }
    }
  }, [zoningGeometry, showZoning, result.zone])

  return (
    <div className="space-y-4">
      {/* Overlay toggle panel */}
      <div 
        className="bg-bg p-4 rounded-3 border border-border"
        role="group"
        aria-label="Map overlay controls"
      >
        <h3 className="text-sm font-semibold mb-3">Map Overlays</h3>
        <div className="space-y-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showParcel}
              onChange={(e) => setShowParcel(e.target.checked)}
              className="mr-2 h-4 w-4 text-primary focus-ring border-border rounded-2"
              aria-label="Toggle parcel boundary overlay"
            />
            <span className="text-sm text-text">Parcel Boundary</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showZoning}
              onChange={(e) => setShowZoning(e.target.checked)}
              className="mr-2 h-4 w-4 text-primary focus-ring border-border rounded-2"
              aria-label="Toggle zoning district overlay"
            />
            <span className="text-sm text-text">Zoning District ({result.zone})</span>
          </label>
        </div>
      </div>

      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full h-96 rounded-3 border border-border"
        role="img"
        aria-label={`Map showing parcel ${result.apn} in zone ${result.zone}`}
        aria-describedby="map-description"
      />
      <div id="map-description" className="sr-only">
        Interactive map displaying parcel boundaries and zoning district overlays.
        Use the controls above to toggle overlay visibility.
      </div>
    </div>
  )
}

