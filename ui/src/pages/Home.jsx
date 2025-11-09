import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import IntentChip from '../components/IntentChip'
import ParsePreview from '../components/ParsePreview'
import { parseQuery, confidenceBucket } from '../engine/nlu/router'
import { getZoningByAPN, getZoningByLatLng, APIError } from '../lib/api'
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
  const [recents, setRecents] = useState([])

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
    if (!nlq.trim() || !parse?.intent) return

    setError(null)
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
        setError(err.message)
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold text-text mb-4">
          {COPY.home.title}
        </h1>
        <p className="text-lg sm:text-xl text-text-muted mb-8">
          {COPY.home.subtitle}
        </p>
        
        {/* NLQ Input - Primary Action */}
        <div className="max-w-2xl mx-auto mb-6">
          <form onSubmit={handleNlqSubmit} className="space-y-4">
            <div className="relative">
              <input
                ref={nlqInputRef}
                type="text"
                value={nlq}
                onChange={(e) => handleNlqChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={COPY.home.nlqPlaceholder}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                aria-label={COPY.home.nlqLabel}
                autoFocus
              />
              {parse?.intent && (
                <div className="absolute right-2 top-2">
                  <IntentChip intent={parse.intent} confidence={parse.confidence} />
                </div>
              )}
            </div>
            
            {/* Inline parse preview */}
            {parse && (
              <ParsePreview
                parse={parse}
                onSelectIntent={(intent) => {
                  setParse({ ...parse, intent, needs_disambiguation: false })
                }}
                onConfirm={handleNlqSubmit}
              />
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
            
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            
            <Button
              type="submit"
              disabled={loading || !parse?.intent}
              className="w-full text-lg py-3"
              onClick={() => {
                if (typeof window !== 'undefined' && window.__telem_track) {
                  window.__telem_track('cta_primary', {
                    cta_type: 'search',
                    surface: 'home',
                  })
                }
              }}
            >
              {loading ? COPY.home.searchingButton : COPY.home.searchButton}
            </Button>
          </form>
          
          {/* Example queries */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">{COPY.home.tryAsking}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {exampleQueries.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => handleNlqChange(example)}
                  className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Advanced search link */}
        <div className="flex justify-center mb-8">
          <Link to="/search" className="text-sm text-primary-600 hover:text-primary-700 underline">
            {COPY.home.advancedSearchLink}
          </Link>
        </div>
        
        {/* Recent searches */}
        {recents.length > 0 && (
          <div className="max-w-2xl mx-auto mb-6">
            <h2 className="text-lg font-semibold text-text mb-3">{COPY.home.recentSearchesTitle}</h2>
            <div className="space-y-2">
              {recents.map((recent, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setNlq(recent.query)
                    handleNlqChange(recent.query)
                  }}
                  className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{recent.query}</span>
                    {recent.intent && (
                      <IntentChip intent={recent.intent} className="text-xs" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-12 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-text">Search by APN</h3>
          <p className="text-sm sm:text-base text-text-muted">
            Enter an Assessor's Parcel Number to get detailed zoning information.
          </p>
        </Card>
        
        <Card>
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-text">Search by Location</h3>
          <p className="text-sm sm:text-base text-text-muted">
            Use latitude and longitude to find zoning for any location.
          </p>
        </Card>
        
        <Card className="sm:col-span-2 lg:col-span-1">
          <h3 className="text-lg sm:text-xl font-semibold mb-2 text-text">Comprehensive Data</h3>
          <p className="text-sm sm:text-base text-text-muted">
            Get setbacks, height limits, FAR, lot coverage, and overlays.
          </p>
        </Card>
      </div>
    </div>
  )
}

