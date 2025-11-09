import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import Tabs from '../components/Tabs'
import Input from '../components/Input'
import ApnInput from '../components/ApnInput'
import CityField from '../components/CityField'
import Button from '../components/Button'
import Card from '../components/Card'
import ParsePreview from '../components/ParsePreview'
import ErrorDisplay from '../components/ErrorDisplay'
import { parseQuery, confidenceBucket } from '../engine/nlu/router'
import { getZoningByAPN, getZoningByLatLng, APIError, checkBackendHealth, getConnectionStatus } from '../lib/api'
import { addRecent } from '../lib/recents'
import { validateActiveTab } from '../lib/validation'
import { COPY } from '../copy/ui'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [searchType, setSearchType] = useState(
    searchParams.get('type') || 'nlq'
  )
  const [apn, setApn] = useState(searchParams.get('apn') || '')
  const [latitude, setLatitude] = useState(searchParams.get('lat') || '')
  const [longitude, setLongitude] = useState(searchParams.get('lng') || '')
  const [city, setCity] = useState(searchParams.get('city') || 'austin')
  
  const [nlq, setNlq] = useState('')
  const [parse, setParse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})
  const [apiError, setApiError] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState('unknown')
  
  // Focus management on route change
  const formRef = useRef(null)
  
  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      const status = getConnectionStatus()
      setConnectionStatus(status)
      
      if (status === 'offline' || status === 'unknown') {
        const isHealthy = await checkBackendHealth()
        setConnectionStatus(isHealthy ? 'online' : 'offline')
      }
    }
    
    checkConnection()
    
    // Periodic health check
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  // Handle prefill from Home page
  useEffect(() => {
    const state = location.state
    if (state?.prefillIntent) {
      setSearchType('nlq') // Default to NLQ tab
      if (state.prefillQuery) {
        setNlq(state.prefillQuery)
        const result = parseQuery(state.prefillQuery)
        setParse(result)
      }
    }
    
    // Focus first input on mount/route change
    setTimeout(() => {
      const firstInput = formRef.current?.querySelector('input, textarea')
      if (firstInput) {
        firstInput.focus()
      }
    }, 100)
  }, [location.state, searchType])

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
  
  // Clear validation errors when tab changes
  useEffect(() => {
    setValidationErrors({})
  }, [searchType])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setApiError(null)
    setValidationErrors({})
    
    // Validate active tab only
    const validation = validateActiveTab(searchType, {
      nlq,
      apn,
      latitude,
      longitude,
    })
    
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      
      // Track telemetry
      if (typeof window !== 'undefined' && window.__telem_track) {
        Object.keys(validation.errors).forEach(field => {
          window.__telem_track('validation_error', {
            field,
            reason: 'format',
            surface: 'search',
          })
        })
      }
      return
    }
    
    // Check connection before submitting
    if (connectionStatus === 'offline') {
      const isHealthy = await checkBackendHealth()
      if (!isHealthy) {
        setApiError(new APIError('Backend server is not available. Please ensure the server is running.', undefined, true))
        setConnectionStatus('offline')
        return
      }
      setConnectionStatus('online')
    }
    
    setLoading(true)

    try {
      let result

      if (searchType === 'apn') {
        result = await getZoningByAPN(apn.trim(), city)
      } else {
        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)
        result = await getZoningByLatLng(lat, lng, city)
      }

      // Add to recent searches with deep link
      const deepLink = searchType === 'apn' 
        ? `/search?type=apn&apn=${encodeURIComponent(apn)}`
        : `/search?type=location&lat=${latitude}&lng=${longitude}`
      addRecent({
        query: searchType === 'apn' ? apn : `${latitude}, ${longitude}`,
        resultType: searchType,
        deepLink,
      })
      
      navigate('/results', { state: { result } })
    } catch (err) {
      if (err instanceof APIError) {
        setApiError(err)
        // Also set validation error for field-level display
        setValidationErrors({ [searchType === 'apn' ? 'apn' : 'location']: err.message })
        
        // Update connection status
        if (err.isNetworkError) {
          setConnectionStatus('offline')
        }
      } else {
        setApiError(new APIError(COPY.general.error))
        setValidationErrors({ general: COPY.general.error })
      }
    } finally {
      setLoading(false)
    }
  }
  
  const handleRetry = async () => {
    // Re-check connection
    const isHealthy = await checkBackendHealth()
    setConnectionStatus(isHealthy ? 'online' : 'offline')
    
    if (isHealthy) {
      // Retry the last search
      const syntheticEvent = { preventDefault: () => {} }
      await handleSubmit(syntheticEvent)
    }
  }

  const handleNlqChange = (value) => {
    setNlq(value)
    setValidationErrors({})
    
    if (value.trim().length > 3) {
      const result = parseQuery(value)
      setParse(result)
      
      // Track telemetry with confidence bucket
      if (result.intent && typeof window !== 'undefined' && window.__telem_track) {
        window.__telem_track('intent_detected', {
          intent: result.intent,
          confidence: result.confidence,
          confidence_bucket: confidenceBucket(result.confidence),
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
  
  const handleKeyDown = (e) => {
    // Enter or Cmd+Enter submits
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault()
      if (searchType === 'nlq') {
        handleNlqSubmit(e)
      } else {
        handleSubmit(e)
      }
    }
  }

  const handleNlqSubmit = async (e) => {
    e.preventDefault()
    
    // Clear previous errors
    setApiError(null)
    setValidationErrors({})
    
    // Validate NLQ tab
    const validation = validateActiveTab('nlq', { nlq })
    if (!validation.valid) {
      setValidationErrors(validation.errors)
      return
    }
    
    if (!parse?.intent) {
      setValidationErrors({ nlq: COPY.validation.nlqRequired })
      return
    }

    // Check connection before submitting
    if (connectionStatus === 'offline') {
      const isHealthy = await checkBackendHealth()
      if (!isHealthy) {
        setApiError(new APIError('Backend server is not available. Please ensure the server is running.', undefined, true))
        setConnectionStatus('offline')
        return
      }
      setConnectionStatus('online')
    }
    
    setLoading(true)

    try {
      // High confidence + locator present → route directly
      const bucket = confidenceBucket(parse.confidence)
      if (bucket === 'high' && parse.mode !== 'none') {
        let result

        if (parse.mode === 'apn' && parse.params.apn) {
          result = await getZoningByAPN(parse.params.apn, city)
        } else if (parse.mode === 'latlng' && parse.params.latitude && parse.params.longitude) {
          result = await getZoningByLatLng(parse.params.latitude, parse.params.longitude, city)
        } else {
          // Fallback to form submission
          await handleSubmit(e)
          return
        }

        // Add to recent searches with deep link
        const deepLink = `/search?type=nlq&q=${encodeURIComponent(nlq)}`
        addRecent({
          query: nlq,
          intent: parse.intent,
          resultType: 'nlq',
          deepLink,
        })
        
        navigate('/results', { state: { result } })
      } else {
        // Low/medium confidence or no locator → use form
        await handleSubmit(e)
      }
    } catch (err) {
      if (err instanceof APIError) {
        setApiError(err)
        setValidationErrors({ nlq: err.message })
        
        // Update connection status
        if (err.isNetworkError) {
          setConnectionStatus('offline')
        }
      } else {
        setApiError(new APIError(COPY.general.error))
        setValidationErrors({ general: COPY.general.error })
      }
    } finally {
      setLoading(false)
    }
  }
  
  // Determine primary CTA type
  const getPrimaryCTA = () => {
    if (searchType === 'nlq') {
      if (parse?.needs_confirmation) {
        const intentLabel = parse.intent ? (COPY.intent[parse.intent] || parse.intent.replace(/_/g, ' ')) : 'this intent'
        return { type: 'continue', label: `${COPY.search.continueButton} ${intentLabel}` }
      }
      return { type: 'search', label: loading ? COPY.search.searchingButton : COPY.search.searchButton }
    }
    return { type: 'search', label: loading ? COPY.search.searchingButton : COPY.search.searchButton }
  }
  
  const primaryCTA = getPrimaryCTA()
  
  // Track CTA telemetry
  const handleCTAClick = (e) => {
    if (typeof window !== 'undefined' && window.__telem_track) {
      window.__telem_track('cta_primary', {
        cta_type: primaryCTA.type,
        surface: 'search',
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-8 tracking-tight">{COPY.search.title}</h1>
      
      <Card className="shadow-md">
        <Tabs
          value={searchType}
          onChange={(value) => setSearchType(value)}
          tabs={[
            { value: 'nlq', label: COPY.search.askQuestionLabel },
            { value: 'apn', label: COPY.search.apnLabel },
            { value: 'location', label: COPY.search.locationLabel },
          ]}
        />

        {searchType === 'nlq' ? (
          <form ref={formRef} onSubmit={handleNlqSubmit} onKeyDown={handleKeyDown} className="space-y-6 mt-6" noValidate>
            <div>
              <label htmlFor="nlq" className="block text-sm font-medium text-text mb-2">
                {COPY.search.askQuestionLabel}
              </label>
              <textarea
                id="nlq"
                value={nlq}
                onChange={(e) => handleNlqChange(e.target.value)}
                placeholder={COPY.search.askQuestionPlaceholder}
                className="w-full px-5 py-3.5 border-2 border-border rounded-xl bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all duration-200 placeholder:text-ink-500 shadow-sm resize-none"
                rows={4}
                aria-describedby="nlq-help"
                aria-invalid={!!validationErrors.nlq}
              />
              <p id="nlq-help" className="mt-1 text-xs text-text-muted">
                {COPY.search.askQuestionHelp}
              </p>
              {validationErrors.nlq && (
                <p className="mt-1 text-sm text-danger" role="alert">
                  {validationErrors.nlq}
                </p>
              )}
            </div>

            {/* Single parse preview card - no duplicate "Detected Intent" */}
            {parse && (
              <ParsePreview
                parse={parse}
                onSelectIntent={(intent) => {
                  setParse({ ...parse, intent, needs_disambiguation: false })
                }}
                onConfirm={handleNlqSubmit}
              />
            )}

            {/* Error display with retry */}
            {apiError && (
              <ErrorDisplay 
                error={apiError} 
                onRetry={handleRetry}
              />
            )}

            {validationErrors.general && !apiError && (
              <div className="p-4 bg-primary-weak border border-danger rounded-2" role="alert">
                <p className="text-sm text-danger">{validationErrors.general}</p>
              </div>
            )}

            {/* Single primary CTA - Always visible and enabled */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              onClick={handleCTAClick}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {COPY.search.searchingButton}
                </span>
              ) : (
                primaryCTA.label
              )}
            </Button>
            
            {/* Helper text when no input */}
            {!nlq.trim() && !parse?.intent && !loading && (
              <p className="text-xs text-ink-600 text-center mt-2">
                Enter a question above to get started
              </p>
            )}
          </form>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-6 mt-6" noValidate>

          {searchType === 'apn' ? (
            <ApnInput
              id="apn"
              label={COPY.search.apnLabel}
              value={apn}
              onChange={(e) => setApn(e.target.value)}
              placeholder={COPY.search.apnPlaceholder}
              required
              error={validationErrors.apn}
              ariaDescribedBy="apn-help"
            />
          ) : (
            <div className="space-y-4">
              <Input
                id="latitude"
                label={COPY.search.latitudeLabel}
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder={COPY.search.latitudePlaceholder}
                required
                error={validationErrors.latitude}
              />
              <Input
                id="longitude"
                label={COPY.search.longitudeLabel}
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder={COPY.search.longitudePlaceholder}
                required
                error={validationErrors.longitude}
              />
            </div>
          )}

          {/* City field - hidden when fixed to Austin */}
          <CityField value={city} onChange={setCity} multiJurisdiction={false} />

          {/* Error display with retry */}
          {apiError && (
            <ErrorDisplay 
              error={apiError} 
              onRetry={handleRetry}
            />
          )}

          {/* ARIA live region for state announcements */}
          <div 
            role="status" 
            aria-live="polite" 
            aria-atomic="true"
            className="sr-only"
          >
            {loading ? COPY.general.searching : validationErrors.general ? `Error: ${validationErrors.general}` : COPY.general.readyToSearch}
          </div>

          {validationErrors.general && !apiError && (
            <div className="p-4 bg-primary-weak border border-danger rounded-2" role="alert" aria-live="assertive" aria-atomic="true">
              <p className="text-sm text-danger mb-3">{validationErrors.general}</p>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                {COPY.general.retry}
              </Button>
            </div>
          )}

            {/* Single primary CTA */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              onClick={handleCTAClick}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {COPY.search.searchingButton}
                </span>
              ) : (
                primaryCTA.label
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}

