import { useEffect, useRef } from 'react'
import Button from './Button'
import type { ZoningAnswer } from '../engine/answers/rules'
import { getFullCitationText } from '../engine/answers/citations'

interface CodeModalProps {
  answer: ZoningAnswer
  isOpen: boolean
  onClose: () => void
}

export default function CodeModal({ answer, isOpen, onClose }: CodeModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Track citation opened
  useEffect(() => {
    if (isOpen && answer.citations.length > 0) {
      const citation = answer.citations[0]
      if (window.__telem_track) {
        window.__telem_track('citation_opened', {
          code_id: citation.code_id,
        })
      }
    }
  }, [isOpen, answer])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
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

  const citationsWithSnippets = answer.citations.filter(c => c.snippet)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="code-modal-title"
        className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 xl:inset-24 bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 id="code-modal-title" className="text-xl font-bold">
                Code Citations
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {answer.intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <Button
              ref={closeButtonRef}
              variant="secondary"
              onClick={onClose}
              aria-label="Close code modal"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {citationsWithSnippets.length > 0 ? (
            <div className="space-y-6">
              {citationsWithSnippets.map((citation, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-semibold text-gray-900">
                    {getFullCitationText(citation)}
                  </h3>
                  <pre className="bg-gray-50 border border-gray-200 rounded p-4 text-sm overflow-x-auto">
                    <code>{citation.snippet}</code>
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No code snippets available for this answer.</p>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <Button variant="primary" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </div>
      </div>
    </>
  )
}
