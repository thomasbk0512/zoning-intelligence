import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import IntentChip from '../components/IntentChip'
import { parseQuery } from '../engine/nlu/router'
import { getZoningByAPN, getZoningByLatLng, APIError } from '../lib/api'
import type { ZoningResult } from '../types'

const exampleQueries = [
  'how tall can I build in SF-3 APN 0204050712',
  'front setback for parcel 0204050712',
  'lot coverage at 30.25, -97.75',
]

export default function Home() {
  const navigate = useNavigate()
  const [nlq, setNlq] = useState('')
  const [parse, setParse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
          result = await getZoningByAPN(parse.params.apn, 'austin')
        } else if (parse.mode === 'latlng' && parse.params.latitude && parse.params.longitude) {
          result = await getZoningByLatLng(parse.params.latitude, parse.params.longitude, 'austin')
        } else {
          // Fallback to search page
          navigate('/search', { state: { prefillIntent: parse.intent } })
          return
        }

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
          Zoning Intelligence
        </h1>
        <p className="text-lg sm:text-xl text-text-muted mb-8">
          Get instant zoning information for any property
        </p>
        
        {/* NLQ Input */}
        <div className="max-w-2xl mx-auto mb-6">
          <form onSubmit={handleNlqSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={nlq}
                onChange={(e) => handleNlqChange(e.target.value)}
                placeholder="Ask a question... (e.g., 'how tall can I build in SF-3 APN 0204050712')"
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="Ask a zoning question"
              />
              {parse?.intent && (
                <div className="absolute right-2 top-2">
                  <IntentChip intent={parse.intent} confidence={parse.confidence} />
                </div>
              )}
            </div>
            {parse?.needs_confirmation && (
              <p className="text-sm text-gray-600">
                Please confirm your intent or provide more details.
              </p>
            )}
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading || !parse?.intent}
              className="w-full sm:w-auto"
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>
          
          {/* Example queries */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Try asking:</p>
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
        
        <div className="flex justify-center gap-4">
          <Link to="/search" data-testid="home-cta-search">
            <Button className="text-base sm:text-lg px-6 sm:px-8 py-3">
              Search Property
            </Button>
          </Link>
        </div>
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

