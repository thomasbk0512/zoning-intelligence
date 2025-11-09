import { useState } from 'react'
import Card from './Card'
import Button from './Button'
import CodeModal from './CodeModal'
import SourceList from './SourceList'
import type { ZoningAnswer } from '../engine/answers/rules'

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

  const label = intentLabels[answer.intent] || answer.intent
  const cardId = `answer-card-${answer.intent}`

  return (
    <>
      <Card>
        <div className="space-y-3" data-testid={cardId}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{label}</h3>
              {answer.status === 'needs_review' && (
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                  Needs Review
                </span>
              )}
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
        </div>
      </Card>

      {codeModalOpen && (
        <CodeModal
          answer={answer}
          isOpen={codeModalOpen}
          onClose={() => setCodeModalOpen(false)}
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

