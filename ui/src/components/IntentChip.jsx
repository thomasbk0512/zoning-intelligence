import { COPY } from '../copy/ui'

const intentLabels = {
  front_setback: COPY.intent.front_setback,
  side_setback: COPY.intent.side_setback,
  rear_setback: COPY.intent.rear_setback,
  max_height: COPY.intent.max_height,
  lot_coverage: COPY.intent.lot_coverage,
  min_lot_size: COPY.intent.min_lot_size,
}

export default function IntentChip({ intent, confidence, onClick, className = '' }) {
  const label = intentLabels[intent] || intent.replace(/_/g, ' ')
  const displayConfidence = confidence !== undefined ? Math.round(confidence * 100) : undefined

  return (
    <>
      {/* Aria-live announcement for screen readers */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {intent && `Intent detected: ${label}${displayConfidence ? ` with ${displayConfidence}% confidence` : ''}`}
      </div>
      
      <button
        onClick={onClick}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5
          text-sm font-medium
          bg-primary-100 text-primary-800
          rounded-full
          hover:bg-primary-200
          focus-ring
          transition-colors
          ${className}
        `}
        aria-label={`Intent: ${label}${displayConfidence ? ` (${displayConfidence}% confidence)` : ''}`}
        title={displayConfidence !== undefined ? `${displayConfidence}% confidence` : undefined}
      >
        <span>{label}</span>
        {/* No % shown in UI, only in title attribute */}
      </button>
    </>
  )
}

