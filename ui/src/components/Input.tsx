import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium text-text mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 border rounded-lg bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-all duration-200 placeholder:text-ink-500 shadow-sm ${
            error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border'
          } ${className}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

