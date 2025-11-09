import { useEffect, useRef, useState } from 'react'
import Button from './Button'
import Card from './Card'
import { getBuildInfo } from '../lib/buildInfo'

interface DiagnosticsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function DiagnosticsPanel({ isOpen, onClose }: DiagnosticsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [buildInfo, setBuildInfo] = useState<any>(null)

  // Load build info
  useEffect(() => {
    if (isOpen) {
      getBuildInfo().then(setBuildInfo).catch(() => setBuildInfo(null))
    }
  }, [isOpen])

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
        aria-labelledby="diagnostics-title"
        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-xl z-50 overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 id="diagnostics-title" className="text-2xl font-bold">Diagnostics</h2>
            <Button
              ref={closeButtonRef}
              variant="secondary"
              onClick={onClose}
              aria-label="Close diagnostics panel"
            >
              ✕
            </Button>
          </div>

          <div className="space-y-6">
            <Card title="Build Information">
              {buildInfo ? (
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="font-semibold">Version:</dt>
                    <dd className="text-gray-600">{buildInfo.version || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-semibold">Git SHA:</dt>
                    <dd className="text-gray-600 font-mono text-xs">{buildInfo.git_sha?.substring(0, 7) || 'Unknown'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-semibold">Build Time:</dt>
                    <dd className="text-gray-600">{buildInfo.build_time || 'Unknown'}</dd>
                  </div>
                  {buildInfo.ci_run_url && (
                    <div className="flex justify-between">
                      <dt className="font-semibold">CI Run:</dt>
                      <dd className="text-gray-600">
                        <a
                          href={buildInfo.ci_run_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:underline"
                        >
                          View
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-gray-600">Build information not available</p>
              )}
            </Card>

            <Card title="Quality Gates">
              {buildInfo?.gates_summary ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold">Verdict:</span>
                    <span className={buildInfo.gates_summary.verdict === 'PASS' ? 'text-green-600' : 'text-red-600'}>
                      {buildInfo.gates_summary.verdict}
                    </span>
                  </div>
                  {buildInfo.gates_summary.gates && (
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between">
                        <span>E2E Tests:</span>
                        <span>{buildInfo.gates_summary.gates.e2e_pass ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lighthouse:</span>
                        <span>{Object.keys(buildInfo.gates_summary.gates.lh || {}).length > 0 ? '✅' : '❌'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Telemetry:</span>
                        <span>{buildInfo.gates_summary.gates.telemetry_schema_validation_pass ? '✅' : '❌'}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600">Quality gates information not available</p>
              )}
            </Card>

            <Card title="Feature Flags">
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="font-semibold">E2E Enabled:</dt>
                  <dd className="text-gray-600">{import.meta.env.VITE_E2E_ENABLE !== 'false' ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-semibold">Lighthouse Enabled:</dt>
                  <dd className="text-gray-600">{import.meta.env.VITE_LH_ENABLE !== 'false' ? 'Yes' : 'No'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-semibold">Telemetry Enabled:</dt>
                  <dd className="text-gray-600">{import.meta.env.VITE_TELEM_ENABLE !== 'false' ? 'Yes' : 'No'}</dd>
                </div>
              </dl>
            </Card>

            <Card title="Web Vitals">
              <p className="text-sm text-gray-600">
                Web Vitals metrics are collected via telemetry. Check browser console for recent values.
              </p>
            </Card>

            <Card title="Copy Diagnostics">
              <p className="text-sm text-gray-600 mb-4">
                Copy this information when reporting bugs or issues.
              </p>
              <Button
                variant="secondary"
                onClick={() => {
                  const diagnostics = {
                    buildInfo,
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                  }
                  navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2))
                  alert('Diagnostics copied to clipboard')
                }}
              >
                Copy to Clipboard
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}

