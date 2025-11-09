import { useState, useEffect, useRef } from 'react'
import Button from './Button'
import Card from './Card'
import Input from './Input'
import type { ZoningAnswer } from '../engine/answers/rules'
import type { CodeCitation } from '../engine/answers/rules'

interface FeedbackSheetProps {
  answer: ZoningAnswer
  isOpen: boolean
  onClose: () => void
  onSubmit: (feedback: FeedbackData) => void
}

interface FeedbackData {
  answer_id: string
  intent: string
  district: string
  vote: 'up' | 'down'
  reason?: string
  has_proposed: boolean
  proposed?: {
    value: number
    unit: string
    citation: CodeCitation
  }
}

export default function FeedbackSheet({ answer, isOpen, onClose, onSubmit }: FeedbackSheetProps) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const [reason, setReason] = useState('')
  const [showProposal, setShowProposal] = useState(false)
  const [proposedValue, setProposedValue] = useState('')
  const [proposedUnit, setProposedUnit] = useState('')
  const [proposedSection, setProposedSection] = useState('')
  const [proposedAnchor, setProposedAnchor] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const sheetRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Reset form when answer changes
  useEffect(() => {
    if (isOpen) {
      setVote(null)
      setReason('')
      setShowProposal(false)
      setProposedValue('')
      setProposedUnit('')
      setProposedSection('')
      setProposedAnchor('')
      setSubmitted(false)
    }
  }, [isOpen, answer])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = sheetRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    closeButtonRef.current?.focus()

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleTab)
    document.addEventListener('keydown', handleEsc)

    return () => {
      document.removeEventListener('keydown', handleTab)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!vote) return

    const feedback: FeedbackData = {
      answer_id: answer.answer_id || `${answer.intent}`,
      intent: answer.intent,
      district: answer.answer_id?.split(':')[0] || '',
      vote,
      reason: reason.trim() || undefined,
      has_proposed: showProposal && proposedValue && proposedUnit && proposedSection,
      proposed: showProposal && proposedValue && proposedUnit && proposedSection ? {
        value: parseFloat(proposedValue),
        unit: proposedUnit.trim(),
        citation: {
          code_id: 'austin_ldc_2024',
          section: proposedSection.trim(),
          anchor: proposedAnchor.trim() || undefined,
        },
      } : undefined,
    }

    onSubmit(feedback)
    setSubmitted(true)
    
    // Close after a brief delay
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const intentLabel = answer.intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-sheet-title"
        className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg shadow-xl z-50 max-h-[90vh] overflow-y-auto"
      >
        <Card className="m-0 rounded-t-lg">
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 id="feedback-sheet-title" className="text-xl font-bold">
                Feedback: {intentLabel}
              </h2>
              <Button
                ref={closeButtonRef}
                variant="secondary"
                onClick={onClose}
                aria-label="Close feedback sheet"
              >
                ✕
              </Button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <p className="text-green-600 font-medium">Thank you for your feedback!</p>
                <p className="text-sm text-gray-600 mt-2">Your input helps improve accuracy.</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium mb-3">Was this answer correct?</p>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setVote('up')}
                      className={`flex-1 p-4 border-2 rounded-lg transition-colors focus-ring ${
                        vote === 'up'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                      aria-label="Mark as correct"
                    >
                      <span className="text-2xl">👍</span>
                      <span className="block mt-2 text-sm font-medium">Correct</span>
                    </button>
                    <button
                      onClick={() => setVote('down')}
                      className={`flex-1 p-4 border-2 rounded-lg transition-colors focus-ring ${
                        vote === 'down'
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-red-400'
                      }`}
                      aria-label="Mark as incorrect"
                    >
                      <span className="text-2xl">👎</span>
                      <span className="block mt-2 text-sm font-medium">Incorrect</span>
                    </button>
                  </div>
                </div>

                {vote && (
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium mb-2">
                      Reason (optional, max 120 characters)
                    </label>
                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value.slice(0, 120))}
                      rows={3}
                      className="w-full border border-gray-300 rounded p-2 text-sm focus-ring"
                      placeholder="Why is this answer correct or incorrect?"
                    />
                    <p className="text-xs text-gray-500 mt-1">{reason.length}/120</p>
                  </div>
                )}

                {vote === 'down' && (
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showProposal}
                        onChange={(e) => setShowProposal(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm font-medium">I know the correct answer</span>
                    </label>
                  </div>
                )}

                {showProposal && vote === 'down' && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-sm">Proposed Correction</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="proposed-value" className="block text-xs font-medium mb-1">
                          Value
                        </label>
                        <Input
                          id="proposed-value"
                          type="number"
                          value={proposedValue}
                          onChange={(e) => setProposedValue(e.target.value)}
                          placeholder="25"
                        />
                      </div>
                      <div>
                        <label htmlFor="proposed-unit" className="block text-xs font-medium mb-1">
                          Unit
                        </label>
                        <Input
                          id="proposed-unit"
                          value={proposedUnit}
                          onChange={(e) => setProposedUnit(e.target.value.slice(0, 12))}
                          placeholder="ft"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="proposed-section" className="block text-xs font-medium mb-1">
                          Code Section *
                        </label>
                        <Input
                          id="proposed-section"
                          value={proposedSection}
                          onChange={(e) => setProposedSection(e.target.value)}
                          placeholder="25-2-492"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="proposed-anchor" className="block text-xs font-medium mb-1">
                          Anchor (optional)
                        </label>
                        <Input
                          id="proposed-anchor"
                          value={proposedAnchor}
                          onChange={(e) => setProposedAnchor(e.target.value)}
                          placeholder="(B)(1)"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!vote || (showProposal && (!proposedValue || !proposedUnit || !proposedSection))}
                    className="flex-1"
                  >
                    Submit Feedback
                  </Button>
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  )
}

