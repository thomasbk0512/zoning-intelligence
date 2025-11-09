import { useState } from 'react'
import Card from './Card'
import Button from './Button'
import CodeModal from './CodeModal'
import { type ZoningAnswer } from '../engine/answers/rules'

interface ConflictNoticeProps {
  answer: ZoningAnswer
  conflictSources?: Array<{
    type: string
    id?: string
    value: number
    unit: string
    citations: Array<{ code_id: string; section: string; anchor?: string }>
  }>
}

export default function ConflictNotice({ answer, conflictSources }: ConflictNoticeProps) {
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [selectedCitation, setSelectedCitation] = useState<any>(null)

  if (!conflictSources || conflictSources.length === 0) {
    return null
  }

  const intentLabel = answer.intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  const handleViewCode = (citation: any) => {
    setSelectedCitation(citation)
    setCodeModalOpen(true)
  }

  return (
    <>
      <Card className="border-yellow-300 bg-yellow-50">
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600 text-xl" aria-hidden="true">
              ⚠️
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">
                Review Required: {intentLabel}
              </h3>
              <p className="text-sm text-yellow-800 mt-1">
                Conflicting values from multiple sources. Please review the cited code sections.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-yellow-900 uppercase tracking-wide">
              Conflicting Sources
            </p>
            <ul className="space-y-2">
              {conflictSources.map((source, index) => {
                const typeLabel =
                  source.type === 'override'
                    ? 'Override'
                    : source.type === 'overlay'
                    ? `Overlay${source.id ? ` (${source.id})` : ''}`
                    : source.type === 'exception'
                    ? `Exception${source.id ? ` (${source.id})` : ''}`
                    : 'Rule'

                return (
                  <li key={index} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-900">
                        <strong>{typeLabel}:</strong> {source.value} {source.unit}
                      </span>
                      {source.citations.length > 0 && (
                        <button
                          onClick={() => handleViewCode(source.citations[0])}
                          className="text-xs text-yellow-700 hover:text-yellow-900 underline focus-ring rounded"
                        >
                          View Code
                        </button>
                      )}
                    </div>
                    {source.citations.length > 0 && (
                      <p className="text-xs text-yellow-700 mt-1">
                        {source.citations.map((c, i) => (
                          <span key={i}>
                            {c.section}
                            {c.anchor && ` ${c.anchor}`}
                            {i < source.citations.length - 1 && ', '}
                          </span>
                        ))}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <p className="text-xs text-yellow-700">
            Consult your jurisdiction for official requirements. This answer requires manual review.
          </p>
        </div>
      </Card>

      {codeModalOpen && selectedCitation && (
        <CodeModal
          answer={{
            ...answer,
            citations: [selectedCitation],
          }}
          isOpen={codeModalOpen}
          onClose={() => {
            setCodeModalOpen(false)
            setSelectedCitation(null)
          }}
        />
      )}
    </>
  )
}
