import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Tabs from '../components/Tabs'
import Input from '../components/Input'
import Button from '../components/Button'
import Card from '../components/Card'
import { getZoningByAPN, getZoningByLatLng, APIError } from '../lib/api'
import type { ZoningResult, SearchType } from '../types'

interface ValidationErrors {
  apn?: string
  latitude?: string
  longitude?: string
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  
  const [searchType, setSearchType] = useState<SearchType>(
    (searchParams.get('type') as SearchType) || 'apn'
  )
  const [apn, setApn] = useState(searchParams.get('apn') || '')
  const [latitude, setLatitude] = useState(searchParams.get('lat') || '')
  const [longitude, setLongitude] = useState(searchParams.get('lng') || '')
  const [city, setCity] = useState(searchParams.get('city') || 'austin')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  // Update URL params when inputs change (debounced)
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('type', searchType)
    if (apn) params.set('apn', apn)
    if (latitude) params.set('lat', latitude)
    if (longitude) params.set('lng', longitude)
    if (city) params.set('city', city)
    setSearchParams(params, { replace: true })
  }, [searchType, apn, latitude, longitude, city, setSearchParams])

  // Focus management on error
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [error])

  // Validate inputs
  const validateInputs = (): boolean => {
    const errors: ValidationErrors = {}
    
    if (searchType === 'apn') {
      if (!apn.trim()) {
        errors.apn = 'APN is required'
      } else if (!/^\d+$/.test(apn.trim())) {
        errors.apn = 'APN must contain only digits'
      }
    } else {
      const lat = parseFloat(latitude)
      const lng = parseFloat(longitude)
      
      if (!latitude.trim()) {
        errors.latitude = 'Latitude is required'
      } else if (isNaN(lat)) {
        errors.latitude = 'Latitude must be a valid number'
      } else if (lat < -90 || lat > 90) {
        errors.latitude = 'Latitude must be between -90 and 90'
      }
      
      if (!longitude.trim()) {
        errors.longitude = 'Longitude is required'
      } else if (isNaN(lng)) {
        errors.longitude = 'Longitude must be a valid number'
      } else if (lng < -180 || lng > 180) {
        errors.longitude = 'Longitude must be between -180 and 180'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setValidationErrors({})
    
    if (!validateInputs()) {
      return
    }
    
    setLoading(true)

    try {
      let result: ZoningResult

      if (searchType === 'apn') {
        result = await getZoningByAPN(apn.trim(), city)
      } else {
        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)
        result = await getZoningByLatLng(lat, lng, city)
      }

      // Navigate with query params for deep linking
      const params = new URLSearchParams()
      params.set('type', searchType)
      if (searchType === 'apn') {
        params.set('apn', apn.trim())
      } else {
        params.set('lat', latitude)
        params.set('lng', longitude)
      }
      params.set('city', city)
      
      navigate(`/results?${params.toString()}`, { state: { result } })
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
      <h1 className="text-2xl sm:text-3xl font-semibold text-text mb-6 sm:mb-8">Search Property</h1>
      
      <Card>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Tabs
            value={searchType}
            onChange={(value) => {
              setSearchType(value as SearchType)
              setError(null)
              setValidationErrors({})
            }}
            tabs={[
              { value: 'apn', label: 'APN' },
              { value: 'location', label: 'Location (Lat/Lng)' },
            ]}
          />

          {searchType === 'apn' ? (
            <Input
              id="apn"
              label="APN"
              type="text"
              value={apn}
              onChange={(e) => {
                setApn(e.target.value)
                if (validationErrors.apn) {
                  setValidationErrors({ ...validationErrors, apn: undefined })
                }
              }}
              placeholder="0204050712"
              required
              error={validationErrors.apn || (error && searchType === 'apn' ? error : undefined)}
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
                onChange={(e) => {
                  setLatitude(e.target.value)
                  if (validationErrors.latitude) {
                    setValidationErrors({ ...validationErrors, latitude: undefined })
                  }
                }}
                placeholder="30.2672"
                required
                error={validationErrors.latitude}
              />
              <Input
                id="longitude"
                label="Longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => {
                  setLongitude(e.target.value)
                  if (validationErrors.longitude) {
                    setValidationErrors({ ...validationErrors, longitude: undefined })
                  }
                }}
                placeholder="-97.7431"
                required
                error={validationErrors.longitude || (error && searchType === 'location' ? error : undefined)}
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

          {error && !validationErrors.apn && !validationErrors.latitude && !validationErrors.longitude && (
            <div 
              ref={errorRef}
              className="p-4 bg-primary-weak border border-danger rounded-2" 
              role="alert" 
              aria-live="assertive" 
              aria-atomic="true"
              tabIndex={-1}
            >
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
      </Card>
    </div>
  )
}
