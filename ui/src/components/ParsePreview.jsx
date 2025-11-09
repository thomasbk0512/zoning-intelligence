import { useState } from 'react'
import Button from './Button'
import IntentChip from './IntentChip'
import { confidenceBucket } from '../engine/nlu/router'
import { COPY } from '../copy/ui'

const intentLabels = {
  front_setback: COPY.intent.frontSetback,
  side_setback: COPY.intent.sideSetback,
  rear_setback: COPY.intent.rearSetback,
  max_height: COPY.intent.maxHeight,
  lot_coverage: COPY.intent.lotCoverage,
  min_lot_size: COPY.intent.minLotSize,
}

export default function ParsePreview({ parse, onSelectIntent, onConfirm, className = '' }) {
  const [selectedIntent, setSelectedIntent] = useState(parse.intent)

  const handleSelectIntent = (intent) => {
    setSelectedIntent(intent)
    onSelectIntent?.(intent)
  }

  const handleConfirm = () => {
    if (selectedIntent) {
      onConfirm?.()
    }
  }

  if (!parse.intent && !parse.needs_confirmation) {
    return null
  }

  const hasApn = parse.mode === 'apn' && parse.params.apn
  const missingApn = parse.intent && parse.mode === 'none'
  const bucket = confidenceBucket(parse.confidence)
  const confidenceLabels = {
    high: COPY.parsePreview.confidence.high,
    medium: COPY.parsePreview.confidence.medium,
    low: COPY.parsePreview.confidence.low,
  }
  const guidanceLabels = {
    high: COPY.parsePreview.guidance.high,
    medium: COPY.parsePreview.guidance.medium,
    low: COPY.parsePreview.guidance.low,
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 ${className}`}>
      {/* Confidence badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          bucket === 'high' ? 'bg-green-100 text-green-800' :
          bucket === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {bucket === 'high' ? 'High' : bucket === 'medium' ? 'Medium' : 'Low'} Confidence
        </span>
        <span className="text-xs text-gray-600">{confidenceLabels[bucket]}</span>
      </div>
      
      {/* Guidance */}
      <p className="text-xs text-gray-600 mb-2">{guidanceLabels[bucket]}</p>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">{COPY.parsePreview.detectedIntent}</h3>
        {parse.needs_disambiguation && parse.alternatives ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{COPY.parsePreview.multipleIntents}</p>
            <div className="flex flex-wrap gap-2">
              {parse.alternatives.map(intent => (
                <IntentChip
                  key={intent}
                  intent={intent}
                  onClick={() => handleSelectIntent(intent)}
                  className={selectedIntent === intent ? 'ring-2 ring-primary-500' : ''}
                />
              ))}
            </div>
          </div>
        ) : parse.intent ? (
          <div className="flex flex-wrap gap-2">
            <IntentChip intent={parse.intent} confidence={parse.confidence} />
            {/* Show dual intent chips if two intents are close */}
            {parse.alternatives && parse.alternatives.length === 2 && (
              <IntentChip
                intent={parse.alternatives[1]}
                onClick={() => handleSelectIntent(parse.alternatives[1])}
                className={selectedIntent === parse.alternatives[1] ? 'ring-2 ring-primary-500' : ''}
              />
            )}
          </div>
        ) : null}
      </div>

      {parse.mode !== 'none' && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">{COPY.parsePreview.location}</h4>
          <p className="text-sm text-gray-600">
            {parse.mode === 'apn' && parse.params.apn && `APN: ${parse.params.apn}`}
            {parse.mode === 'latlng' && parse.params.latitude && parse.params.longitude && (
              `Coordinates: ${parse.params.latitude}, ${parse.params.longitude}`
            )}
          </p>
        </div>
      )}

      {parse.params.zone && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">{COPY.parsePreview.zone}</h4>
          <p className="text-sm text-gray-600">{parse.params.zone}</p>
        </div>
      )}

      {/* Missing APN affordance */}
      {missingApn && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>{COPY.parsePreview.missingApn.title}</strong> {COPY.parsePreview.missingApn.message}
          </p>
          <p className="text-xs text-yellow-700">
            {COPY.parsePreview.missingApn.example}
          </p>
        </div>
      )}

      {parse.needs_confirmation && (
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!selectedIntent}
            className="w-full sm:w-auto"
          >
            {COPY.search.continueButton} {selectedIntent ? (intentLabels[selectedIntent] || selectedIntent.replace(/_/g, ' ')) : 'this intent'}
          </Button>
        </div>
      )}
    </div>
  )
}

