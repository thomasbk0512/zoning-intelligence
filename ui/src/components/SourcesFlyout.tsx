import { useEffect, useRef } from 'react'

interface SourcesFlyoutProps {
  sources: Array<{ type: string; cite: string }>
  isOpen: boolean
  onClose: () => void
}

export default function SourcesFlyout({ sources, isOpen, onClose }: SourcesFlyoutProps) {
  const flyoutRef = useRef<HTMLDivElement>(null)
  const firstFocusableRef = useRef<HTMLButtonElement>(null)

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key === 'Tab' && flyoutRef.current) {
        const focusableElements = flyoutRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    firstFocusableRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sources-title"
    >
      <div
        ref={flyoutRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 id="sources-title" className="text-xl font-semibold">
              Zoning Sources
            </h2>
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
              aria-label="Close sources"
            >
              ✕
            </button>
          </div>

          <ul className="space-y-3">
            {sources.map((source, idx) => (
              <li key={idx} className="border-b border-gray-200 pb-3 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-medium text-sm text-gray-700">
                      {source.type}:
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      {source.cite}
                    </span>
                  </div>
                  {source.cite.startsWith('§') && (
                    <a
                      href={`#section-${source.cite.replace(/[^a-zA-Z0-9]/g, '-')}`}
                      className="text-primary-600 hover:text-primary-700 text-sm"
                      onClick={(e) => {
                        e.preventDefault()
                        // TODO: Link to code section
                      }}
                    >
                      View Section
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

