import type { ParseResult } from '../engine/nlu/router'

interface IntentChipProps {
  intent: string
  confidence?: number
  onClick?: () => void
  className?: string
}

const intentLabels: Record<string, string> = {
  front_setback: 'Front Setback',
  side_setback: 'Side Setback',
  rear_setback: 'Rear Setback',
  max_height: 'Max Height',
  lot_coverage: 'Lot Coverage',
  min_lot_size: 'Min Lot Size',
}

export default function IntentChip({ intent, confidence, onClick, className = '' }: IntentChipProps) {
  const label = intentLabels[intent] || intent.replace(/_/g, ' ')
  const displayConfidence = confidence !== undefined ? Math.round(confidence * 100) : undefined

  return (
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
    >
      <span>{label}</span>
      {displayConfidence !== undefined && (
        <span className="text-xs opacity-75">{displayConfidence}%</span>
      )}
    </button>
  )
}

