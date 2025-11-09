import { useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Card from '../components/Card'
import KeyValue from '../components/KeyValue'
import Button from '../components/Button'
import { SkeletonCard } from '../components/Skeleton'
import SourcesFlyout from '../components/SourcesFlyout'
import Map from '../components/Map'
import AnswerCard from '../components/AnswerCard'
import ConflictNotice from '../components/ConflictNotice'
import JurisdictionBadge from '../components/JurisdictionBadge'
import VersionNotice from '../components/VersionNotice'
import ReportHeader from '../components/ReportHeader'
import ReportFooter from '../components/ReportFooter'
import ShareMenu from '../components/ShareMenu'
import { getAnswers } from '../lib/answers'
import { generateReportSnapshot } from '../lib/report'
import { resolveFromAPN, resolveFromLatLng, getJurisdictionById } from '../engine/juris/resolve'
import type { ZoningResult } from '../types'
import type { AnswersResponse } from '../lib/answers'
import type { ShareParams } from '../lib/share'

export default function Results() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result as ZoningResult | undefined
  const [loading, setLoading] = useState(!result)
  const [announcement, setAnnouncement] = useState('')
  const [sourcesFlyoutOpen, setSourcesFlyoutOpen] = useState(false)
  const [answers, setAnswers] = useState<AnswersResponse | null>(null)
  const [answersLoading, setAnswersLoading] = useState(false)

  useEffect(() => {
    if (result) {
      setLoading(false)
      // Announce results with key information
      setAnnouncement(`Zoning results loaded for APN ${result.apn}. Zone: ${result.zone}. Height limit: ${result.height_ft} feet. FAR: ${result.far}.`)
      
      // Resolve jurisdiction
      let jurisdictionId = 'austin' // Default
      let jurisdictionResult = null
      
      if (result.apn) {
        jurisdictionResult = await resolveFromAPN(result.apn)
      } else if (result.latitude && result.longitude) {
        jurisdictionResult = await resolveFromLatLng(result.latitude, result.longitude)
      }
      
      if (jurisdictionResult) {
        jurisdictionId = jurisdictionResult.jurisdiction_id
        const juris = await getJurisdictionById(jurisdictionId)
        setJurisdiction(juris)
        
        // Track telemetry
        if (typeof window !== 'undefined' && (window as any).__telem_track) {
          ;(window as any).__telem_track('jurisdiction_resolved', {
            jurisdiction_id: jurisdictionId,
            resolver: jurisdictionResult.resolver,
            district: jurisdictionResult.district,
          })
        }
      } else {
        // Fallback: try to get jurisdiction from result
        const juris = await getJurisdictionById('austin')
        setJurisdiction(juris)
      }
      
      // Load answers with overlays and lot context (extract from result if available)
      setAnswersLoading(true)
      
      // Extract overlays from result (if available)
      const overlays = result.overlays || []
      
      // Build lot context from result (if available)
      const lotContext = {
        corner: result.notes?.toLowerCase().includes('corner') || false,
        flag: result.notes?.toLowerCase().includes('flag') || false,
        // Frontage, width, slope would come from parcel geometry analysis
        // For now, use defaults
      }
      
      getAnswers({
        apn: result.apn,
        city: result.jurisdiction.toLowerCase().includes('austin') ? 'austin' : 'austin',
        zone: result.zone,
        jurisdictionId,
        overlays,
        lotContext,
      })
        .then(response => {
          setAnswers(response)
          // Telemetry is tracked in getAnswers()
        })
        .catch(error => {
          console.warn('Failed to load answers:', error)
          setAnswers(null)
        })
        .finally(() => {
          setAnswersLoading(false)
        })
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
          {result && (
            <ShareMenu
              params={{
                type: result.apn ? 'apn' : 'latlng',
                apn: result.apn,
                latitude: result.latitude,
                longitude: result.longitude,
                city: result.jurisdiction.toLowerCase().includes('austin') ? 'austin' : 'austin',
                zone: result.zone,
                jurisdictionId: jurisdiction?.id,
              }}
              onShare={(method) => {
                // Track report generation on share
                if (answers && typeof window !== 'undefined' && (window as any).__telem_track) {
                  const hasConflicts = answers.answers.some(a => a.status === 'needs_review')
                  const jurisdictionId = jurisdiction?.id || 'austin'
                  ;(window as any).__telem_track('report_generated', {
                    intents_count: answers.answers.length,
                    has_conflicts: hasConflicts,
                    jurisdiction: jurisdictionId,
                  })
                }
              }}
            />
          )}
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
      
      {/* Print-only header */}
      <div className="hidden print:block">
        <ReportHeader
          apn={result.apn}
          jurisdiction={result.jurisdiction}
          zone={result.zone}
        />
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

        {/* Zoning Answers (Beta) */}
        {answers && answers.answers.length > 0 && (
          <div className="space-y-4">
            {/* Version Notice for stale citations */}
            {answers.answers.some(a => a.citations.some((c: any) => c.stale)) && (
              <VersionNotice
                citations={answers.answers.flatMap(a => a.citations as any[])}
                onViewDiagnostics={() => {
                  // Open diagnostics panel if available
                  const diagnosticsButton = document.querySelector('[data-testid="diagnostics-button"]') as HTMLElement
                  if (diagnosticsButton) {
                    diagnosticsButton.click()
                  }
                }}
              />
            )}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Zoning Answers (Beta)</h2>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                Beta
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Authoritative answers to common zoning questions with code citations.
            </p>
            <div className="space-y-4">
              {answers.answers.map((answer, index) => (
                <div key={index} className="space-y-2">
                  {answer.status === 'needs_review' && (
                    <ConflictNotice answer={answer} />
                  )}
                  <AnswerCard answer={answer} />
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500">
              <a href="/disclaimer" className="text-primary-600 hover:underline">
                Disclaimer: Informational only. Consult your jurisdiction for official requirements.
              </a>
            </p>
          </div>
        )}

        {answersLoading && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Zoning Answers (Beta)</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        )}

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

