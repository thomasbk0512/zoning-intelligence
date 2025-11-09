import { useState, useRef, useEffect } from 'react'
import Button from './Button'
import { buildPermalink, copyToClipboard, type ShareParams } from '../lib/share'

interface ShareMenuProps {
  params: ShareParams
  onShare?: (method: 'link' | 'print') => void
}

export default function ShareMenu({ params, onShare }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on outside click
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleCopyLink = async () => {
    const link = buildPermalink(params)
    const success = await copyToClipboard(link)
    
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      
      // Track telemetry
      if (typeof window !== 'undefined' && (window as any).__telem_track) {
        ;(window as any).__telem_track('report_shared', {
          method: 'link',
        })
      }
      
      onShare?.('link')
    }
  }

  const handlePrint = () => {
    // Track telemetry
    if (typeof window !== 'undefined' && (window as any).__telem_track) {
      ;(window as any).__telem_track('report_shared', {
        method: 'print',
      })
    }
    
    onShare?.('print')
    window.print()
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Share report"
      >
        Share
        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
      </Button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          role="menu"
        >
          <div className="py-1">
            <button
              onClick={handleCopyLink}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus-ring rounded"
              role="menuitem"
            >
              {copied ? '✓ Link copied!' : 'Copy link'}
            </button>
            <button
              onClick={handlePrint}
              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus-ring rounded"
              role="menuitem"
            >
              Print / Save as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

