import { useEffect, useRef } from 'react'
import Button from './Button'
import Card from './Card'

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = panelRef.current?.querySelectorAll(
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

    // Focus close button on open
    closeButtonRef.current?.focus()

    // Handle Esc key
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 id="help-title" className="text-2xl font-bold">Help</h2>
            <Button
              ref={closeButtonRef}
              variant="secondary"
              onClick={onClose}
              aria-label="Close help panel"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            <Card title="Quick Start">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Navigate to the Search page</li>
                <li>Choose search type: APN or Location (Lat/Lng)</li>
                <li>Enter your search criteria</li>
                <li>Click "Search" to view zoning results</li>
              </ol>
            </Card>

            <Card title="Search Tips">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><strong>APN:</strong> Enter the Assessor's Parcel Number (e.g., 0204050712)</li>
                <li><strong>Location:</strong> Enter latitude and longitude in decimal degrees (e.g., 30.2672, -97.7431)</li>
                <li>All searches are currently limited to Austin, TX</li>
              </ul>
            </Card>

            <Card title="Error Glossary">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-semibold">Property not found</dt>
                  <dd className="text-gray-600 ml-4">The APN or location does not match any parcel in our database.</dd>
                </div>
                <div>
                  <dt className="font-semibold">Network error</dt>
                  <dd className="text-gray-600 ml-4">Unable to connect to the server. Check your internet connection.</dd>
                </div>
                <div>
                  <dt className="font-semibold">Validation error</dt>
                  <dd className="text-gray-600 ml-4">Invalid input format. Check that APN is numeric or coordinates are valid.</dd>
                </div>
              </dl>
            </Card>

            <Card title="Keyboard Shortcuts">
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Tab</kbd> - Navigate between elements</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Enter</kbd> - Submit form or activate button</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Esc</kbd> - Close dialogs and panels</li>
                <li><kbd className="px-2 py-1 bg-gray-100 rounded">Ctrl/Cmd + P</kbd> - Print results</li>
              </ul>
            </Card>

            <Card title="Accessibility">
              <p className="text-sm mb-2">
                This application is designed to meet WCAG 2.1 AA standards.
              </p>
              <p className="text-sm">
                <a
                  href="/accessibility-statement"
                  className="text-primary-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Accessibility Statement
                </a>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

