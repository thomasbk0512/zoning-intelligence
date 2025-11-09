import { useState } from 'react'
import { type CitationWithVersion } from '../engine/answers/citations'

interface VersionNoticeProps {
  citations: CitationWithVersion[]
  onViewDiagnostics?: () => void
}

export default function VersionNotice({ citations, onViewDiagnostics }: VersionNoticeProps) {
  const [dismissed, setDismissed] = useState(false)
  
  const staleCitations = citations.filter(c => c.stale)
  
  if (dismissed || staleCitations.length === 0) {
    return null
  }

  return (
    <div
      role="alert"
      className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4"
      aria-live="polite"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-yellow-800 mb-1">
            Code Source Update Detected
          </h4>
          <p className="text-sm text-yellow-700">
            {staleCitations.length === 1
              ? 'One citation may reference an outdated code section.'
              : `${staleCitations.length} citations may reference outdated code sections.`}
            {' '}
            Please verify the cited sections are current.
          </p>
          {onViewDiagnostics && (
            <button
              onClick={onViewDiagnostics}
              className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900 focus-ring rounded"
            >
              View Diagnostics
            </button>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 text-yellow-600 hover:text-yellow-800 focus-ring rounded"
          aria-label="Dismiss notice"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

