import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import IntentChip from '../components/IntentChip'
import ParsePreview from '../components/ParsePreview'
import ErrorDisplay from '../components/ErrorDisplay'
import { parseQuery, confidenceBucket } from '../engine/nlu/router'
import { getZoningByAPN, getZoningByLatLng, APIError, checkBackendHealth, getConnectionStatus } from '../lib/api'
import { getRecentSearches, addRecent } from '../lib/recents'
import { COPY } from '../copy/ui'

const exampleQueries = [
  'how tall can I build in SF-3 APN 0204050712',
  'front setback for parcel 0204050712',
  'lot coverage at 30.25, -97.75',
]

export default function Home() {
  const navigate = useNavigate()
  const nlqInputRef = useRef(null)
  const [nlq, setNlq] = useState('')
  const [parse, setParse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [apiError, setApiError] = useState(null)
  const [recents, setRecents] = useState([])
  const [connectionStatus, setConnectionStatus] = useState('unknown')

  // Load recent searches and focus management
  useEffect(() => {
    const recentSearches = getRecentSearches()
    setRecents(recentSearches)
    
    // Track telemetry
    if (recentSearches.length > 0 && typeof window !== 'undefined' && window.__telem_track) {
      window.__telem_track('recents_viewed', {
        count: recentSearches.length,
      })
    }
    
    // Focus NLQ input on mount
    if (nlqInputRef.current) {
      nlqInputRef.current.focus()
    }
    
    // Check connection status
    const checkConnection = async () => {
      const status = getConnectionStatus()
      setConnectionStatus(status)
      
      if (status === 'offline' || status === 'unknown') {
        const isHealthy = await checkBackendHealth()
        setConnectionStatus(isHealthy ? 'online' : 'offline')
      }
    }
    
    checkConnection()
  }, [])

  const handleNlqChange = (value) => {
    setNlq(value)
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
    } else {
      setParse(null)
    }
  }
  
  const handleKeyDown = (e) => {
    // Enter or Cmd+Enter submits
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
      e.preventDefault()
      if (parse?.intent && !loading) {
        handleNlqSubmit(e)
      } else if (parse && parse.mode === 'none') {
        // Focus hint if missing locator
        const hintElement = document.querySelector('[data-missing-locator-hint]')
        if (hintElement) {
          hintElement.focus()
        }
      }
    }
  }

  const handleNlqSubmit = async (e) => {
    e.preventDefault()
    
    // Validate input - show error if empty
    if (!nlq.trim()) {
      setError('Please enter a question or paste an APN')
      return
    }
    
    // If no intent detected, try to parse again or show helpful message
    if (!parse?.intent) {
      const result = parseQuery(nlq)
      if (result.intent) {
        setParse(result)
        // Continue with submission below
      } else {
        setError('Could not understand your question. Try including an APN or being more specific (e.g., "front setback for APN 0204050712")')
        return
      }
    }

    setError(null)
    setApiError(null)
    
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
      if (parse.confidence >= 0.7 && parse.mode !== 'none') {
        let result

        if (parse.mode === 'apn' && parse.params.apn) {
          result = await getZoningByAPN(parse.params.apn, 'austin')
        } else if (parse.mode === 'latlng' && parse.params.latitude && parse.params.longitude) {
          result = await getZoningByLatLng(parse.params.latitude, parse.params.longitude, 'austin')
        } else {
          // Fallback to search page
          navigate('/search', { state: { prefillIntent: parse.intent } })
          return
        }

        // Add to recent searches with deep link
        const deepLink = `/search?type=nlq&q=${encodeURIComponent(nlq)}`
        addRecent({
          query: nlq,
          intent: parse.intent,
          resultType: parse.mode === 'apn' ? 'apn' : parse.mode === 'latlng' ? 'latlng' : 'nlq',
          deepLink,
        })
        
        navigate('/results', { state: { result } })
      } else {
        // Low confidence or no locator → go to search with prefill
        navigate('/search', { state: { prefillIntent: parse.intent, prefillQuery: nlq } })
      }
    } catch (err) {
      if (err instanceof APIError) {
        setApiError(err)
        setError(err.message)
        
        // Update connection status
        if (err.isNetworkError) {
          setConnectionStatus('offline')
        }
      } else {
        const unknownError = new APIError('An unexpected error occurred. Please try again.')
        setApiError(unknownError)
        setError(unknownError.message)
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
      await handleNlqSubmit(syntheticEvent)
    }
  }

  const isEmpty = !nlq.trim() && !parse && recents.length === 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-ink-900 mb-4 tracking-tight">
          {COPY.home.title}
        </h1>
        <p className="text-xl sm:text-2xl text-ink-700 mb-12 max-w-2xl mx-auto">
          {COPY.home.subtitle}
        </p>
        
        {/* NLQ Input - Primary Action */}
        <div className="max-w-2xl mx-auto mb-8">
          <form onSubmit={handleNlqSubmit} className="space-y-5">
            <div className="relative">
              <input
                ref={nlqInputRef}
                type="text"
                value={nlq}
                onChange={(e) => handleNlqChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={COPY.home.nlqPlaceholder}
                className="w-full px-5 py-4 border-2 border-border rounded-xl bg-bg text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 text-lg shadow-sm transition-all duration-200 placeholder:text-ink-500"
                aria-label={COPY.home.nlqLabel}
                autoFocus
              />
              {parse?.intent && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <IntentChip intent={parse.intent} confidence={parse.confidence} />
                </div>
              )}
            </div>
            
            {/* Inline parse preview - animated entrance */}
            {parse && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <ParsePreview
                  parse={parse}
                  onSelectIntent={(intent) => {
                    setParse({ ...parse, intent, needs_disambiguation: false })
                  }}
                  onConfirm={handleNlqSubmit}
                />
              </div>
            )}
            
            {/* NLQ hint if missing locator */}
            {parse && parse.intent && parse.mode === 'none' && (
              <div 
                data-missing-locator-hint
                className="bg-yellow-50 border border-yellow-200 rounded p-3"
                tabIndex={-1}
              >
                <p className="text-sm text-yellow-800">
                  <strong>{COPY.parsePreview.missingApn.title}</strong> {COPY.parsePreview.missingApn.message}
                </p>
              </div>
            )}
            
            {/* Error display with retry */}
            {apiError && (
              <ErrorDisplay 
                error={apiError} 
                onRetry={handleRetry}
              />
            )}
            
            {error && !apiError && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            
            {/* Primary CTA - Always visible and enabled */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-lg py-3.5 font-semibold shadow-sm hover:shadow-md transition-all duration-200"
              onClick={() => {
                if (typeof window !== 'undefined' && window.__telem_track) {
                  window.__telem_track('cta_primary', {
                    cta_type: parse?.intent ? 'search' : 'get_started',
                    surface: 'home',
                  })
                }
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {COPY.home.searchingButton}
                </span>
              ) : parse?.intent ? (
                COPY.home.searchButton
              ) : (
                'Get Started'
              )}
            </Button>
            
            {/* Helper text when no input */}
            {!nlq.trim() && !parse?.intent && !loading && (
              <p className="text-xs text-ink-600 text-center mt-2">
                Type a question above or try an example below
              </p>
            )}
          </form>
          
          {/* Advanced Search link - demoted */}
          <div className="mt-4 text-center">
            <Link 
              to="/search" 
              className="text-sm text-primary-700 hover:text-primary-800 underline focus-ring rounded-2"
            >
              {COPY.home.advancedSearchLink}
            </Link>
          </div>
          
          {/* Example queries - more prominent when empty */}
          <div className={`mt-8 transition-opacity duration-300 ${isEmpty ? 'opacity-100' : 'opacity-60'}`}>
            <p className="text-sm font-medium text-ink-700 mb-3">{COPY.home.tryAsking}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    handleNlqChange(example)
                    nlqInputRef.current?.focus()
                  }}
                  className="text-sm px-4 py-2 bg-white border border-border hover:border-primary-300 hover:bg-primary-50 rounded-lg text-ink-700 transition-all duration-200 focus-ring shadow-sm hover:shadow-md"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Recent Searches */}
        {recents.length > 0 && (
          <div className="max-w-2xl mx-auto mt-12 pt-8 border-t border-border">
            <h2 className="text-base font-semibold text-ink-900 mb-4">{COPY.home.recentSearchesTitle}</h2>
            <div className="space-y-2">
              {recents.map((recent, idx) => (
                <Link
                  key={idx}
                  to={recent.deepLink || '/search'}
                  className="block p-4 bg-white border border-border rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 focus-ring shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-ink-900 font-medium group-hover:text-primary-700 transition-colors">{recent.query}</p>
                      {recent.intent && (
                        <p className="text-xs text-ink-600 mt-1">{COPY.intent[recent.intent] || recent.intent}</p>
                      )}
                    </div>
                    <svg className="w-5 h-5 text-ink-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

