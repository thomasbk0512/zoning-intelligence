import { useState } from 'react'
import Button from './Button'
import { COPY } from '../copy/ui'

/**
 * ErrorDisplay component
 * Shows user-friendly error messages with actionable guidance
 */
export default function ErrorDisplay({ error, onRetry, className = '' }) {
  const [retrying, setRetrying] = useState(false)

  if (!error) return null

  // Determine error type
  const isNetworkError = error.isNetworkError || error.message?.includes('Network error')
  const isTimeout = error.message?.includes('timeout') || error.message?.includes('Timeout')
  const isServerError = error.statusCode && error.statusCode >= 500
  const isNotFound = error.statusCode === 404

  let errorConfig
  if (isNetworkError) {
    errorConfig = COPY.errors.network
  } else if (isTimeout) {
    errorConfig = COPY.errors.timeout
  } else if (isServerError) {
    errorConfig = COPY.errors.server
  } else if (isNotFound) {
    errorConfig = COPY.errors.notFound
  } else {
    errorConfig = COPY.errors.unknown
  }

  const handleRetry = async () => {
    if (!onRetry) return
    
    setRetrying(true)
    try {
      await onRetry()
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div 
      className={`bg-red-50 border-l-4 border-red-400 p-5 rounded-xl shadow-sm ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg 
            className="h-5 w-5 text-red-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800 mb-1">
            {errorConfig.title}
          </h3>
          <p className="text-sm text-red-700 mb-2">
            {error.message || errorConfig.message}
          </p>
          
          {errorConfig.suggestions && errorConfig.suggestions.length > 0 && (
            <ul className="list-disc list-inside text-sm text-red-600 mb-3 space-y-1">
              {errorConfig.suggestions.map((suggestion, idx) => (
                <li key={idx}>{suggestion}</li>
              ))}
            </ul>
          )}

          {onRetry && errorConfig.retry && (
            <div className="mt-3">
              <Button
                variant="secondary"
                onClick={handleRetry}
                disabled={retrying}
                className="text-sm"
              >
                {retrying ? 'Retrying...' : errorConfig.retry}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

