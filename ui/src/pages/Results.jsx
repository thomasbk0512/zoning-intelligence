import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import Card from '../components/Card'
import KeyValue from '../components/KeyValue'
import Button from '../components/Button'
import { SkeletonCard } from '../components/Skeleton'
import SourcesFlyout from '../components/SourcesFlyout'
import Map from '../components/Map'
import { getZoningByAPN, getZoningByLatLng, APIError } from '../lib/api'
import type { ZoningResult } from '../types'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const statusRef = useRef<HTMLDivElement>(null)
  
  // Try to get result from navigation state first
  const stateResult = location.state?.result as ZoningResult | undefined
  
  const [result, setResult] = useState<ZoningResult | undefined>(stateResult)
  const [loading, setLoading] = useState(!stateResult)
  const [error, setError] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [sourcesFlyoutOpen, setSourcesFlyoutOpen] = useState(false)

  // Fetch result from query params if not in state
  useEffect(() => {
    if (stateResult) {
      setResult(stateResult)
      setLoading(false)
      return
    }

    const type = searchParams.get('type')
    const apn = searchParams.get('apn')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const city = searchParams.get('city') || 'austin'

    if (!type || (!apn && (!lat || !lng))) {
      setLoading(false)
      setError(null)
      return
    }

    const fetchResult = async () => {
      setLoading(true)
      setError(null)
      
      try {
        let fetchedResult: ZoningResult
        
        if (type === 'apn' && apn) {
          fetchedResult = await getZoningByAPN(apn, city)
        } else if (type === 'location' && lat && lng) {
          const latitude = parseFloat(lat)
          const longitude = parseFloat(lng)
          if (isNaN(latitude) || isNaN(longitude)) {
            throw new APIError('Invalid latitude or longitude in URL')
          }
          fetchedResult = await getZoningByLatLng(latitude, longitude, city)
        } else {
          throw new APIError('Invalid search parameters')
        }
        
        setResult(fetchedResult)
        setAnnouncement(`Zoning results loaded for APN ${fetchedResult.apn}. Zone: ${fetchedResult.zone}. Height limit: ${fetchedResult.height_ft} feet. FAR: ${fetchedResult.far}.`)
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message)
          setAnnouncement(`Error: ${err.message}`)
        } else {
          const message = 'An unexpected error occurred. Please try again.'
          setError(message)
          setAnnouncement(`Error: ${message}`)
        }
        setResult(undefined)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [searchParams, stateResult])

  // Focus management on error (WCAG 2.4.3)
  useEffect(() => {
    if (error && statusRef.current) {
      statusRef.current.focus()
    }
  }, [error])

  // Announce status changes
  useEffect(() => {
    if (result) {
      setAnnouncement(`Zoning results loaded for APN ${result.apn}. Zone: ${result.zone}. Height limit: ${result.height_ft} feet. FAR: ${result.far}.`)
    } else if (loading) {
      setAnnouncement('Loading zoning results...')
    } else if (error) {
      setAnnouncement(`Error: ${error}`)
    }
  }, [result, loading, error])

  const handleRetry = () => {
    setError(null)
    setLoading(true)
    
    const type = searchParams.get('type')
    const apn = searchParams.get('apn')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    const city = searchParams.get('city') || 'austin'

    const fetchResult = async () => {
      try {
        let fetchedResult: ZoningResult
        
        if (type === 'apn' && apn) {
          fetchedResult = await getZoningByAPN(apn, city)
        } else if (type === 'location' && lat && lng) {
          const latitude = parseFloat(lat)
          const longitude = parseFloat(lng)
          fetchedResult = await getZoningByLatLng(latitude, longitude, city)
        } else {
          throw new APIError('Invalid search parameters')
        }
        
        setResult(fetchedResult)
        setError(null)
      } catch (err) {
        if (err instanceof APIError) {
          setError(err.message)
        } else {
          setError('An unexpected error occurred. Please try again.')
        }
        setResult(undefined)
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text mb-6">
          <span className="sr-only">Loading</span>
          Zoning Results
        </h1>
        <div className="mb-6">
          <div className="h-8 bg-surface rounded-2 w-48 mb-4 animate-pulse" aria-hidden="true" />
        </div>
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        {/* ARIA live region for loading */}
        <div 
          role="status" 
          aria-live="polite" 
          aria-atomic="true"
          className="sr-only"
        >
          Loading zoning results...
        </div>
      </div>
    )
  }

  if (error || !result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl sm:text-3xl font-semibold text-text mb-6">Zoning Results</h1>
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4 text-text">No Results</h2>
            <p className="text-text-muted mb-6">
              {error 
                ? error 
                : 'No zoning data found. Please search for a property first.'}
            </p>
            {error && (
              <div className="mb-6">
                <Button onClick={handleRetry} className="mb-4">
                  Retry Search
                </Button>
              </div>
            )}
            <Button onClick={() => navigate('/search')}>
              New Search
            </Button>
          </div>
        </Card>
        {/* ARIA live region for error */}
        <div 
          ref={statusRef}
          role="alert" 
          aria-live="assertive" 
          aria-atomic="true"
          className="sr-only"
          tabIndex={-1}
        >
          {error ? `Error: ${error}` : 'No results found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ARIA live region for announcements */}
      <div 
        ref={statusRef}
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
            aria-label="Print results"
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
          <dl className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <KeyValue label="APN" value={result.apn} />
            <KeyValue label="Jurisdiction" value={result.jurisdiction} />
            <KeyValue label="Zone" value={result.zone} />
          </dl>
        </Card>

        <Card title="Zoning Regulations">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 text-text">Setbacks (ft)</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Front:</dt>
                  <dd className="font-medium">{result.setbacks_ft.front}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Side:</dt>
                  <dd className="font-medium">{result.setbacks_ft.side}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Rear:</dt>
                  <dd className="font-medium">{result.setbacks_ft.rear}</dd>
                </div>
                {result.setbacks_ft.street_side > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Street Side:</dt>
                    <dd className="font-medium">{result.setbacks_ft.street_side}</dd>
                  </div>
                )}
              </dl>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-text">Limits</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-text-muted">Height:</dt>
                  <dd className="font-medium">{result.height_ft} ft</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">FAR:</dt>
                  <dd className="font-medium">{result.far}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-text-muted">Lot Coverage:</dt>
                  <dd className="font-medium">{result.lot_coverage_pct}%</dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>

        {result.overlays.length > 0 && (
          <Card title="Overlays">
            <ul className="space-y-2">
              {result.overlays.map((overlay, idx) => (
                <li key={idx} className="text-sm py-1 text-text">{overlay}</li>
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
                  <span className="font-medium text-text">{source.type}:</span>{' '}
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
