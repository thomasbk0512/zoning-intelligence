import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import KeyValue from '../components/KeyValue'
import Button from '../components/Button'
import { SkeletonCard } from '../components/Skeleton'
import SourcesFlyout from '../components/SourcesFlyout'
import Map from '../components/Map'
import type { ZoningResult } from '../types'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result as ZoningResult | undefined
  const [loading, setLoading] = useState(!result)
  const [announcement, setAnnouncement] = useState('')
  const [sourcesFlyoutOpen, setSourcesFlyoutOpen] = useState(false)

  useEffect(() => {
    if (result) {
      setLoading(false)
      // Announce results with key information
      setAnnouncement(`Zoning results loaded for APN ${result.apn}. Zone: ${result.zone}. Height limit: ${result.height_ft} feet. FAR: ${result.far}.`)
    } else if (loading) {
      setAnnouncement('Loading zoning results...')
    }
  }, [result, loading])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <div className="h-8 bg-surface rounded-2 w-48 mb-4 animate-pulse" aria-hidden="true" />
        </div>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-text">No Results</h2>
            <p className="text-text-muted mb-6">
              No zoning data found. Please search for a property first.
            </p>
            <Button onClick={() => navigate('/search')}>
              Go to Search
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ARIA live region for announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text">Zoning Results</h1>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => window.print()}
            className="no-print"
          >
            Print
          </Button>
          <Button variant="secondary" onClick={() => navigate('/search')}>
            New Search
          </Button>
        </div>
      </div>
      
      <div 
        role="region" 
        aria-label="Zoning results"
        className="space-y-6"
      >
        {/* Map with overlays */}
        <Card title="Map View">
          <Map 
            result={result}
            parcelGeometry={result.parcel_geometry}
            zoningGeometry={result.zoning_geometry}
          />
        </Card>

        <Card title="Property Information">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <KeyValue label="APN" value={result.apn} />
            <KeyValue label="Jurisdiction" value={result.jurisdiction} />
            <KeyValue label="Zone" value={result.zone} />
          </div>
        </Card>

        <Card title="Zoning Regulations">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Setbacks (ft)</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-text-muted">Front:</span>
                  <span className="font-medium">{result.setbacks_ft.front}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-text-muted">Side:</span>
                  <span className="font-medium">{result.setbacks_ft.side}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-text-muted">Rear:</span>
                  <span className="font-medium">{result.setbacks_ft.rear}</span>
                </li>
                {result.setbacks_ft.street_side > 0 && (
                  <li className="flex justify-between">
                    <span className="text-text-muted">Street Side:</span>
                    <span className="font-medium">{result.setbacks_ft.street_side}</span>
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Limits</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-text-muted">Height:</span>
                  <span className="font-medium">{result.height_ft} ft</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-text-muted">FAR:</span>
                  <span className="font-medium">{result.far}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-text-muted">Lot Coverage:</span>
                  <span className="font-medium">{result.lot_coverage_pct}%</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {result.overlays.length > 0 && (
          <Card title="Overlays">
            <ul className="space-y-2">
              {result.overlays.map((overlay, idx) => (
                <li key={idx} className="text-sm py-1">{overlay}</li>
              ))}
            </ul>
          </Card>
        )}

        {result.notes && (
          <Card title="Notes">
            <p className="text-sm text-text">{result.notes}</p>
          </Card>
        )}

        <Card title="Sources">
          <div className="space-y-2">
            <ul className="space-y-2 text-sm">
              {result.sources.slice(0, 2).map((source, idx) => (
                <li key={idx} className="py-1">
                  <span className="font-medium">{source.type}:</span>{' '}
                  <span className="text-text-muted">{source.cite}</span>
                </li>
              ))}
            </ul>
            {result.sources.length > 2 && (
              <Button
                variant="secondary"
                onClick={() => setSourcesFlyoutOpen(true)}
                className="mt-2"
              >
                View All Sources ({result.sources.length})
              </Button>
            )}
          </div>
          <p className="text-xs text-text-muted mt-4">
            Query completed in {result.run_ms}ms
          </p>
        </Card>

        <SourcesFlyout
          sources={result.sources}
          isOpen={sourcesFlyoutOpen}
          onClose={() => setSourcesFlyoutOpen(false)}
        />
      </div>
    </div>
  )
}

