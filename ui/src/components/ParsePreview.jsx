import { useState } from 'react'
import Button from './Button'
import IntentChip from './IntentChip'
import { type ParseResult } from '../engine/nlu/router'

interface ParsePreviewProps {
  parse: ParseResult
  onSelectIntent?: (intent: string) => void
  onConfirm?: () => void
  className?: string
}

const intentLabels: Record<string, string> = {
  front_setback: 'Front Setback',
  side_setback: 'Side Setback',
  rear_setback: 'Rear Setback',
  max_height: 'Maximum Height',
  lot_coverage: 'Lot Coverage',
  min_lot_size: 'Minimum Lot Size',
}

export default function ParsePreview({ parse, onSelectIntent, onConfirm, className = '' }: ParsePreviewProps) {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(parse.intent)

  const handleSelectIntent = (intent: string) => {
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

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3 ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Detected Intent</h3>
        {parse.needs_disambiguation && parse.alternatives ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Multiple intents detected. Please select one:</p>
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
          <div>
            <IntentChip intent={parse.intent} confidence={parse.confidence} />
            {parse.confidence < 0.7 && (
              <p className="text-xs text-gray-600 mt-2">
                Low confidence ({Math.round(parse.confidence * 100)}%). Please confirm.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {parse.mode !== 'none' && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Location</h4>
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
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Zone</h4>
          <p className="text-sm text-gray-600">{parse.params.zone}</p>
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
            Continue with {selectedIntent ? intentLabels[selectedIntent] : 'this intent'}
          </Button>
        </div>
      )}
    </div>
  )
}

