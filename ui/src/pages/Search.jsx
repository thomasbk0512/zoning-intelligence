import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import Tabs from '../components/Tabs'
import Input from '../components/Input'
import Button from '../components/Button'
import Card from '../components/Card'
import IntentChip from '../components/IntentChip'
import ParsePreview from '../components/ParsePreview'
import { parseQuery } from '../engine/nlu/router'
import { getZoningByAPN, getZoningByLatLng, APIError } from '../lib/api'
import type { ZoningResult, SearchType } from '../types'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [searchType, setSearchType] = useState<SearchType>(
    (searchParams.get('type') as SearchType) || 'apn'
  )
  const [apn, setApn] = useState(searchParams.get('apn') || '')
  const [latitude, setLatitude] = useState(searchParams.get('lat') || '')
  const [longitude, setLongitude] = useState(searchParams.get('lng') || '')
  const [city, setCity] = useState(searchParams.get('city') || 'austin')
  
  const [nlq, setNlq] = useState('')
  const [parse, setParse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle prefill from Home page
  useEffect(() => {
    const state = location.state as any
    if (state?.prefillIntent) {
      setSearchType('nlq') // Default to NLQ tab
      if (state.prefillQuery) {
        setNlq(state.prefillQuery)
        const result = parseQuery(state.prefillQuery)
        setParse(result)
      }
    }
  }, [location.state])

  // Update URL params when inputs change
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('type', searchType)
    if (apn) params.set('apn', apn)
    if (latitude) params.set('lat', latitude)
    if (longitude) params.set('lng', longitude)
    if (city) params.set('city', city)
    setSearchParams(params, { replace: true })
  }, [searchType, apn, latitude, longitude, city, setSearchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      let result: ZoningResult

      if (searchType === 'apn') {
        if (!apn.trim()) {
          setError('APN is required')
          setLoading(false)
          return
        }
        result = await getZoningByAPN(apn.trim(), city)
      } else {
        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)
        
        if (isNaN(lat) || isNaN(lng)) {
          setError('Valid latitude and longitude are required')
          setLoading(false)
          return
        }
        
        if (lat < -90 || lat > 90) {
          setError('Latitude must be between -90 and 90')
          setLoading(false)
          return
        }
        
        if (lng < -180 || lng > 180) {
          setError('Longitude must be between -180 and 180')
          setLoading(false)
          return
        }
        
        result = await getZoningByLatLng(lat, lng, city)
      }

      navigate('/results', { state: { result } })
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNlqChange = (value: string) => {
    setNlq(value)
    if (value.trim().length > 3) {
      const result = parseQuery(value)
      setParse(result)
      
      // Track telemetry
      if (result.intent && typeof window !== 'undefined' && (window as any).__telem_track) {
        ;(window as any).__telem_track('intent_detected', {
          intent: result.intent,
          confidence: result.confidence,
          mode: result.mode,
        })
      }
      
      // Auto-fill form if locator detected
      if (result.mode === 'apn' && result.params.apn) {
        setApn(result.params.apn)
        setSearchType('apn')
      } else if (result.mode === 'latlng' && result.params.latitude && result.params.longitude) {
        setLatitude(result.params.latitude.toString())
        setLongitude(result.params.longitude.toString())
        setSearchType('location')
      }
    } else {
      setParse(null)
    }
  }

  const handleNlqSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nlq.trim() || !parse?.intent) return

    setError(null)
    setLoading(true)

    try {
      // High confidence + locator present → route directly
      if (parse.confidence >= 0.7 && parse.mode !== 'none') {
        let result: ZoningResult

        if (parse.mode === 'apn' && parse.params.apn) {
          result = await getZoningByAPN(parse.params.apn, city)
        } else if (parse.mode === 'latlng' && parse.params.latitude && parse.params.longitude) {
          result = await getZoningByLatLng(parse.params.latitude, parse.params.longitude, city)
        } else {
          // Fallback to form submission
          await handleSubmit(e as any)
          return
        }

        navigate('/results', { state: { result } })
      } else {
        // Low confidence or no locator → use form
        await handleSubmit(e as any)
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Search Property</h1>
      
      <Card>
        <Tabs
          value={searchType}
          onChange={(value) => setSearchType(value as SearchType)}
          tabs={[
            { value: 'nlq', label: 'Ask a Question' },
            { value: 'apn', label: 'APN' },
            { value: 'location', label: 'Location (Lat/Lng)' },
          ]}
        />

        {searchType === 'nlq' ? (
          <form onSubmit={handleNlqSubmit} className="space-y-6 mt-6" noValidate>
            <div>
              <label htmlFor="nlq" className="block text-sm font-medium text-text mb-2">
                Ask a Question
              </label>
              <textarea
                id="nlq"
                value={nlq}
                onChange={(e) => handleNlqChange(e.target.value)}
                placeholder="e.g., 'how tall can I build in SF-3 APN 0204050712'"
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={3}
                aria-describedby="nlq-help"
              />
              <p id="nlq-help" className="mt-1 text-xs text-text-muted">
                Ask about setbacks, height limits, lot coverage, or minimum lot size. Include an APN or coordinates.
              </p>
            </div>

            {parse && (
              <div className="space-y-3">
                {parse.intent && (
                  <div>
                    <p className="text-sm font-medium text-text mb-2">Detected Intent:</p>
                    <IntentChip intent={parse.intent} confidence={parse.confidence} />
                  </div>
                )}
                <ParsePreview
                  parse={parse}
                  onSelectIntent={(intent) => {
                    setParse({ ...parse, intent, needs_disambiguation: false })
                  }}
                  onConfirm={handleNlqSubmit}
                />
              </div>
            )}

            {error && (
              <div className="p-4 bg-primary-weak border border-danger rounded-2" role="alert">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !parse?.intent}
              className="w-full"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6" noValidate>

          {searchType === 'apn' ? (
            <Input
              id="apn"
              label="APN"
              type="text"
              value={apn}
              onChange={(e) => setApn(e.target.value)}
              placeholder="0204050712"
              required
              error={error && searchType === 'apn' ? error : undefined}
              aria-describedby="apn-help"
            />
          ) : (
            <div className="space-y-4">
              <Input
                id="latitude"
                label="Latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="30.2672"
                required
                error={error && searchType === 'location' ? error : undefined}
              />
              <Input
                id="longitude"
                label="Longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-97.7431"
                required
              />
            </div>
          )}

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-text mb-2">
              City
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-2 bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="austin">Austin, TX</option>
            </select>
          </div>

          {/* ARIA live region for state announcements */}
          <div 
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            {loading ? 'Searching for property...' : error ? `Error: ${error}` : 'Ready to search'}
          </div>

          {error && (
            <div className="p-4 bg-primary-weak border border-danger rounded-2" role="alert" aria-live="assertive" aria-atomic="true">
              <p className="text-sm text-danger mb-3">{error}</p>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                Retry Search
              </Button>
            </div>
          )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}

