import { useState } from 'react'
import Card from './Card'
import Button from './Button'
import CodeModal from './CodeModal'
import SourceList from './SourceList'
import FeedbackSheet from './FeedbackSheet'
import TraceModal from './TraceModal'

const intentLabels = {
  front_setback: 'Front Setback',
  side_setback: 'Side Setback',
  rear_setback: 'Rear Setback',
  max_height: 'Maximum Height',
  lot_coverage: 'Lot Coverage',
  min_lot_size: 'Minimum Lot Size',
}

export default function AnswerCard({ answer }) {
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [traceModalOpen, setTraceModalOpen] = useState(false)
  
  const trace = answer.trace

  const label = intentLabels[answer.intent] || answer.intent
  const cardId = `answer-card-${answer.intent}`
  const isOverridden = answer.provenance === 'override'
  const hasOverlay = answer.provenance === 'overlay'
  const hasException = answer.provenance === 'exception'
  
  // Get version from first citation if available
  const firstCitation = answer.citations[0]
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
              <div className="flex gap-2 mt-2">
                {answer.citations.some(c => c.snippet) && (
                  <Button
                    variant="secondary"
                    onClick={() => setCodeModalOpen(true)}
                    className="text-sm"
                  >
                    View Code
                  </Button>
                )}
                {trace && (
                  <Button
                    variant="secondary"
                    onClick={() => setTraceModalOpen(true)}
                    className="text-sm"
                  >
                    Explain
                  </Button>
                )}
              </div>
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
            if (typeof window !== 'undefined' && window.__telem_track) {
              window.__telem_track('answer_feedback', feedback)
            }
          }}
        />
      )}

      {traceModalOpen && trace && (
        <TraceModal
          answer={answer}
          trace={trace}
          isOpen={traceModalOpen}
          onClose={() => setTraceModalOpen(false)}
        />
      )}
    </>
  )
}

function formatValue(value) {
  if (value >= 1000) {
    return value.toLocaleString()
  }
  return value.toString()
}

