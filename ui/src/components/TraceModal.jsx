import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import CodeModal from './CodeModal'
import { formatTraceAsJSON, formatTraceAsMarkdown } from '../lib/traceFormat'

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
    return false
  }
}

export default function TraceModal({ answer, trace, isOpen, onClose }) {
  const modalRef = useRef(null)
  const closeButtonRef = useRef(null)
  const [copiedFormat, setCopiedFormat] = useState(null)
  const [selectedCitation, setSelectedCitation] = useState(null)
  const [codeModalOpen, setCodeModalOpen] = useState(false)

  // Track trace opened
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && window.__telem_track) {
      window.__telem_track('trace_opened', {
        intent: trace.intent,
        jurisdiction_id: trace.jurisdiction_id,
        district: trace.district,
      })
    }
  }, [isOpen, trace])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = modalRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (!focusableElements || focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

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

  const handleCopyJSON = async () => {
    const json = formatTraceAsJSON(trace)
    const success = await copyToClipboard(json)
    if (success) {
      setCopiedFormat('json')
      setTimeout(() => setCopiedFormat(null), 2000)
      
      // Track telemetry
      if (typeof window !== 'undefined' && window.__telem_track) {
        window.__telem_track('trace_copied', {
          format: 'json',
        })
      }
    }
  }

  const handleCopyMarkdown = async () => {
    const md = formatTraceAsMarkdown(trace)
    const success = await copyToClipboard(md)
    if (success) {
      setCopiedFormat('md')
      setTimeout(() => setCopiedFormat(null), 2000)
      
      // Track telemetry
      if (typeof window !== 'undefined' && window.__telem_track) {
        window.__telem_track('trace_copied', {
          format: 'md',
        })
      }
    }
  }

  const handleViewCode = (citation: any) => {
    setSelectedCitation(citation)
    setCodeModalOpen(true)
  }

  if (!isOpen) return null

  const intentLabel = trace.intent.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

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
        aria-labelledby="trace-modal-title"
        className="fixed inset-4 sm:inset-8 md:inset-12 lg:inset-16 xl:inset-24 bg-white rounded-lg shadow-xl z-50 overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 id="trace-modal-title" className="text-xl font-bold">
                Explanation Trace
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {intentLabel} • {trace.district} • {trace.jurisdiction_id}
              </p>
            </div>
            <Button
              ref={closeButtonRef}
              variant="secondary"
              onClick={onClose}
              aria-label="Close trace modal"
            >
              ✕
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Final Result</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {trace.final_value !== null ? trace.final_value : 'Conflict'}
                </span>
                {trace.final_value !== null && (
                  <span className="text-gray-600">{trace.units}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Provenance: <span className="font-medium">{trace.provenance}</span>
              </p>
              {trace.conflict && (
                <p className="text-sm text-yellow-700 mt-2">
                  ⚠️ Conflict detected - manual review required
                </p>
              )}
            </div>

            {/* Steps */}
            <div>
              <h3 className="font-semibold mb-4">Computation Steps</h3>
              <ol className="space-y-4">
                {trace.steps.map((step, index) => {
                  const prevValue = index > 0 ? trace.steps[index - 1].value : null
                  return (
                    <li key={index} className="border-l-4 border-primary-500 pl-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary-600">
                            Step {index + 1}: {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                          </span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {step.id}
                          </span>
                        </div>
                        {step.op && (
                          <p className="text-sm text-gray-600">
                            Operation: <code className="bg-gray-100 px-1 rounded">{step.op}</code>
                          </p>
                        )}
                        <div className="bg-gray-50 rounded p-3 font-mono text-sm">
                          <div className="text-gray-600">
                            {prevValue !== null && (
                              <span>prev = {prevValue} {trace.units}</span>
                            )}
                          </div>
                          <div className="mt-1">
                            <span className="text-gray-600">→</span>{' '}
                            <code>{step.expr}</code>
                            <span className="text-gray-600"> = </span>
                            <span className="font-bold text-primary-600">
                              {step.value} {trace.units}
                            </span>
                          </div>
                        </div>
                        {step.citations.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700 mb-1">Citations:</p>
                            <ul className="space-y-1">
                              {step.citations.map((citation, cIdx) => {
                                const version = 'version' in citation ? citation.version : undefined
                                return (
                                  <li key={cIdx} className="text-xs">
                                    <button
                                      onClick={() => handleViewCode(citation)}
                                      className="text-primary-600 hover:underline focus-ring rounded"
                                    >
                                      {citation.code_id}, Section {citation.section}
                                      {citation.anchor ? ` ${citation.anchor}` : ''}
                                      {version ? ` (v${version})` : ''}
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex-shrink-0">
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleCopyJSON}
                className="text-sm"
              >
                {copiedFormat === 'json' ? '✓ Copied!' : 'Copy as JSON'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleCopyMarkdown}
                className="text-sm"
              >
                {copiedFormat === 'md' ? '✓ Copied!' : 'Copy as Markdown'}
              </Button>
            </div>
            <Button variant="primary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Code Modal for citations */}
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

