import { getCitationUrl, formatCitation, getFullCitationText } from '../engine/answers/citations'
import type { CodeCitation } from '../engine/answers/rules'

interface SourceListProps {
  citations: CodeCitation[]
}

export default function SourceList({ citations }: SourceListProps) {
  if (citations.length === 0) {
    return null
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        Sources
      </p>
      <ul className="space-y-1">
        {citations.map((citation, index) => (
          <li key={index} className="text-sm">
            <CitationItem citation={citation} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function CitationItem({ citation }: { citation: CodeCitation }) {
  const url = getCitationUrl(citation)
  const formatted = formatCitation(citation)
  const fullText = getFullCitationText(citation)

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 hover:text-primary-700 hover:underline inline-flex items-center gap-1"
        aria-label={`View code section ${formatted} (opens in new tab)`}
      >
        <span>{fullText}</span>
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    )
  }

  return <span className="text-gray-700">{fullText}</span>
}

