import { useState, useEffect } from 'react'
import { sanitizeApn, validateApn, formatApn } from '../lib/apn'
import { COPY } from '../copy/ui'

const SAMPLE_APN = '0204050712'

export default function ApnInput({ id, label, value, onChange, placeholder, required, error, ariaDescribedBy, onSanitize }) {
  const [sanitizedCount, setSanitizedCount] = useState(0)
  const [displayValue, setDisplayValue] = useState(value || '')
  const [isValid, setIsValid] = useState(true)

  // Sync with external value changes
  useEffect(() => {
    setDisplayValue(value || '')
  }, [value])

  const handleChange = (e) => {
    const rawValue = e.target.value
    setDisplayValue(rawValue)
    
    // Sanitize on change
    const sanitized = sanitizeApn(rawValue)
    const valid = sanitized.length === 0 || validateApn(sanitized)
    setIsValid(valid)
    
    // Notify parent of sanitized value
    if (onChange) {
      // Create synthetic event with sanitized value
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: sanitized,
        },
      }
      onChange(syntheticEvent)
    }
    
    // Track sanitization if non-digit characters were removed
    if (rawValue !== sanitized && rawValue.length > 0) {
      const newCount = sanitizedCount + 1
      setSanitizedCount(newCount)
      
      // Track telemetry
      if (typeof window !== 'undefined' && window.__telem_track) {
        window.__telem_track('apn_sanitized', {
          count: newCount,
          original_length: rawValue.length,
          sanitized_length: sanitized.length,
          source: 'input',
        })
      }
      
      // Expose onSanitize callback for parent components
      if (onSanitize) {
        onSanitize(newCount, {
          original: rawValue,
          sanitized,
          source: 'input',
        })
      }
    }
  }

  const handlePaste = (e) => {
    // Let paste happen, then sanitize
    setTimeout(() => {
      const pastedValue = e.target.value
      const sanitized = sanitizeApn(pastedValue)
      
      if (pastedValue !== sanitized) {
        setDisplayValue(sanitized)
        setIsValid(validateApn(sanitized))
        
        // Notify parent
        if (onChange) {
          const syntheticEvent = {
            target: {
              value: sanitized,
            },
          }
          onChange(syntheticEvent)
        }
        
        // Track sanitization
        const newCount = sanitizedCount + 1
        setSanitizedCount(newCount)
        
        if (typeof window !== 'undefined' && window.__telem_track) {
          window.__telem_track('apn_sanitized', {
            count: newCount,
            original_length: pastedValue.length,
            sanitized_length: sanitized.length,
            source: 'paste',
          })
        }
        
        if (onSanitize) {
          onSanitize(newCount, {
            original: pastedValue,
            sanitized,
            source: 'paste',
          })
        }
      }
    }, 0)
  }

  const handleSampleClick = () => {
    setDisplayValue(SAMPLE_APN)
    setIsValid(true)
    
    if (onChange) {
      const syntheticEvent = {
        target: {
          value: SAMPLE_APN,
        },
      }
      onChange(syntheticEvent)
    }
  }

  const formattedValue = displayValue ? formatApn(displayValue) : ''

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text mb-2">
        {label || COPY.search.apnLabel}
        {required && <span className="text-danger ml-1" aria-label="required">*</span>}
      </label>
      
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder={placeholder || COPY.search.apnPlaceholder}
          required={required}
          aria-describedby={ariaDescribedBy}
          aria-invalid={!isValid}
          className={`
            w-full px-4 py-2 border rounded-2 bg-bg text-text
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${error || !isValid ? 'border-danger' : 'border-border'}
          `}
        />
        
        {/* Sample chip */}
        {!displayValue && (
          <button
            type="button"
            onClick={handleSampleClick}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
            aria-label={`${COPY.search.apnSample}: ${SAMPLE_APN}`}
          >
            {COPY.search.apnSample}
          </button>
        )}
      </div>
      
      {/* Help text */}
      <p id={ariaDescribedBy} className="mt-1 text-xs text-text-muted">
        {COPY.search.apnHelp}
        {displayValue && !isValid && (
          <span className="text-danger ml-1">{COPY.validation.apnInvalid}</span>
        )}
      </p>
      
      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

