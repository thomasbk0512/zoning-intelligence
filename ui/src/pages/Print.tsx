import { useLocation } from 'react-router-dom'
import type { ZoningResult } from '../types'

export default function Print() {
  const location = useLocation()
  const result = location.state?.result as ZoningResult | undefined

  if (!result) {
    return (
      <div className="p-8">
        <p>No results to print. Please search for a property first.</p>
      </div>
    )
  }

  return (
    <div className="print-view p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Zoning Information</h1>
        <p className="text-sm text-gray-600">Generated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Property Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">APN:</span> {result.apn}
          </div>
          <div>
            <span className="font-medium">Jurisdiction:</span> {result.jurisdiction}
          </div>
          <div>
            <span className="font-medium">Zone:</span> {result.zone}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Zoning Regulations</h2>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="font-semibold mb-2">Setbacks (ft)</h3>
            <ul className="space-y-1">
              <li>Front: {result.setbacks_ft.front}</li>
              <li>Side: {result.setbacks_ft.side}</li>
              <li>Rear: {result.setbacks_ft.rear}</li>
              {result.setbacks_ft.street_side > 0 && (
                <li>Street Side: {result.setbacks_ft.street_side}</li>
              )}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Limits</h3>
            <ul className="space-y-1">
              <li>Height: {result.height_ft} ft</li>
              <li>FAR: {result.far}</li>
              <li>Lot Coverage: {result.lot_coverage_pct}%</li>
            </ul>
          </div>
        </div>
      </div>

      {result.overlays.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Overlays</h2>
          <ul className="text-sm space-y-1">
            {result.overlays.map((overlay, idx) => (
              <li key={idx}>{overlay}</li>
            ))}
          </ul>
        </div>
      )}

      {result.notes && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Notes</h2>
          <p className="text-sm">{result.notes}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Sources</h2>
        <ul className="text-sm space-y-1">
          {result.sources.map((source, idx) => (
            <li key={idx}>
              {source.type}: {source.cite}
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-gray-500 mt-6">
        Query completed in {result.run_ms}ms
      </div>
    </div>
  )
}

