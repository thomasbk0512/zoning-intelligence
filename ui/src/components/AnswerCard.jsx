import { useState } from 'react'
import Card from './Card'
import Button from './Button'
import CodeModal from './CodeModal'
import SourceList from './SourceList'
import FeedbackSheet from './FeedbackSheet'
import TraceModal from './TraceModal'
import type { ZoningAnswer } from '../engine/answers/rules'
import type { AnswerTrace } from '../engine/answers/trace'

interface AnswerCardProps {
  answer: ZoningAnswer
}

const intentLabels: Record<string, string> = {
  front_setback: 'Front Setback',
  side_setback: 'Side Setback',
  rear_setback: 'Rear Setback',
  max_height: 'Maximum Height',
  lot_coverage: 'Lot Coverage',
  min_lot_size: 'Minimum Lot Size',
}

export default function AnswerCard({ answer }: AnswerCardProps) {
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [traceModalOpen, setTraceModalOpen] = useState(false)
  
  const trace = (answer as any).trace as AnswerTrace | undefined

  const label = intentLabels[answer.intent] || answer.intent
  const cardId = `answer-card-${answer.intent}`
  const isOverridden = answer.provenance === 'override'
  const hasOverlay = answer.provenance === 'overlay'
  const hasException = answer.provenance === 'exception'
  
  // Get version from first citation if available
  const firstCitation = answer.citations[0] as CitationWithVersion | undefined
  const version = firstCitation?.version

  return (
    <>
      <Card>
        <div className="space-y-3" data-testid={cardId}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold">{label}</h3>
                {/* Badge priority: Overridden > Overlay > Exception */}
                {isOverridden && (
                  <span 
                    className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                    title="This answer has been overridden by a verified correction"
                  >
                    Overridden
                  </span>
                )}
                {!isOverridden && hasOverlay && (
                  <span 
                    className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded"
                    title="This answer has been adjusted by an overlay district"
                  >
                    Overlay
                  </span>
                )}
                {!isOverridden && !hasOverlay && hasException && (
                  <span 
                    className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
                    title="This answer has been adjusted by a lot condition exception"
                  >
                    Exception
                  </span>
                )}
                {answer.status === 'needs_review' && (
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                    Needs Review
                  </span>
                )}
                {version && (
                  <span 
                    className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded"
                    title={`Code version ${version}`}
                  >
                    Code v{version}
                  </span>
                )}
              </div>
            </div>
          </div>

          {answer.status === 'answered' && answer.value !== undefined && (
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-primary-600">
                  {formatValue(answer.value)}
                </span>
                {answer.unit && (
                  <span className="text-lg text-gray-600">{answer.unit}</span>
                )}
              </div>
              {answer.rationale && (
                <p className="text-sm text-gray-700">{answer.rationale}</p>
              )}
            </div>
          )}

          {answer.status === 'needs_review' && (
            <p className="text-sm text-gray-600">
              This answer requires manual review. Please consult the cited code sections.
            </p>
          )}

          {answer.citations.length > 0 && (
            <div className="pt-2 border-t border-gray-200">
              <SourceList citations={answer.citations} />
              {answer.citations.some(c => c.snippet) && (
                <Button
                  variant="secondary"
                  onClick={() => setCodeModalOpen(true)}
                  className="mt-2 text-sm"
                >
                  View Code
                </Button>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={() => setFeedbackOpen(true)}
              className="text-xs text-gray-600 hover:text-primary-600 focus-ring rounded"
              aria-label="Provide feedback on this answer"
            >
              Was this correct?
            </button>
          </div>
        </div>
      </Card>

      {codeModalOpen && (
        <CodeModal
          answer={answer}
          isOpen={codeModalOpen}
          onClose={() => setCodeModalOpen(false)}
        />
      )}

      {feedbackOpen && (
        <FeedbackSheet
          answer={answer}
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onSubmit={(feedback) => {
            // Track feedback via telemetry
            if (typeof window !== 'undefined' && (window as any).__telem_track) {
              ;(window as any).__telem_track('answer_feedback', feedback)
            }
          }}
        />
      )}
    </>
  )
}

function formatValue(value: number): string {
  if (value >= 1000) {
    return value.toLocaleString()
  }
  return value.toString()
}

